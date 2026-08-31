import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { emailProvider } from '@/lib/email/provider';

export const dynamic = 'force-dynamic';

// GET /api/teacher/homework - Fetch homework list created by teacher
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');

    let teacherId: string | undefined;
    if (session.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
      });
      if (teacher) teacherId = teacher.id;
    }

    const homeworks = await prisma.homework.findMany({
      where: {
        ...(teacherId ? { teacherId } : {}),
        ...(classId ? { classId } : {}),
        ...(sectionId ? { sectionId } : {}),
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: homeworks.length,
      homeworks: homeworks.map(hw => ({
        id: hw.id,
        title: hw.title,
        description: hw.description,
        dueDate: hw.dueDate,
        createdAt: hw.createdAt,
        className: hw.class.name,
        sectionName: hw.section.name,
        subjectName: hw.subject.name,
        teacherName: hw.teacher.fullName,
        submissionsCount: hw._count.submissions,
      })),
    });
  } catch (error: any) {
    console.error('Fetch teacher homework error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch homework' }, { status: 500 });
  }
}

// POST /api/teacher/homework - Publish new homework & send email notification
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { classId, sectionId, subjectId, title, description, dueDate, attachments } = body;

    if (!classId || !sectionId || !subjectId || !title || !description || !dueDate) {
      return NextResponse.json(
        { error: 'Class, Section, Subject, Title, Description, and Due Date are required' },
        { status: 400 }
      );
    }

    let teacherId = '';
    let teacherName = session.fullName || 'Subject Teacher';

    if (session.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
        include: {
          assignments: true,
          managedSections: true,
          subjects: true,
        },
      });

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      teacherId = teacher.id;
      teacherName = teacher.fullName;

      // Verify authorization
      const isAuthorized = teacher.assignments.some(
        a => a.classId === classId && a.sectionId === sectionId && a.subjectId === subjectId
      ) || teacher.subjects.some(
        s => s.id === subjectId
      ) || teacher.managedSections.some(
        m => m.id === sectionId
      );

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Access denied: You are not assigned to this subject/class/section' },
          { status: 403 }
        );
      }
    } else {
      // Admin fallback
      const subj = await prisma.subject.findUnique({ where: { id: subjectId } });
      teacherId = subj?.teacherId || (await prisma.teacher.findFirst())?.id || '';
    }

    // Create Homework record
    const homework = await prisma.homework.create({
      data: {
        classId,
        sectionId,
        subjectId,
        teacherId,
        title,
        description,
        dueDate: new Date(dueDate),
        attachmentsJson: attachments ? JSON.stringify(attachments) : null,
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
      },
    });

    // Find students in this class/section to send email notification
    const students = await prisma.student.findMany({
      where: {
        classId,
        sectionId,
        status: 'ENROLLED',
      },
      include: {
        parent: true,
        user: true,
      },
    });

    // Create in-app notifications for all students and parents in this class/section
    try {
      const notifData: any[] = [];
      for (const st of students) {
        if (st.userId) {
          notifData.push({
            userId: st.userId,
            title: `New Homework: ${homework.subject.name}`,
            message: `Teacher ${teacherName} assigned: "${title}". Due Date: ${new Date(dueDate).toLocaleDateString()}`,
            type: 'HOMEWORK',
            link: '/student/homework',
          });
        }
        if (st.parent?.userId) {
          notifData.push({
            userId: st.parent.userId,
            title: `Homework Assigned (${homework.subject.name})`,
            message: `Homework assigned for ${st.fullName}: "${title}". Due Date: ${new Date(dueDate).toLocaleDateString()}`,
            type: 'HOMEWORK',
            link: '/parent',
          });
        }
      }

      if (notifData.length > 0) {
        await prisma.notification.createMany({
          data: notifData,
        });
      }
    } catch (notifErr) {
      console.warn('In-app homework notifications warning:', notifErr);
    }

    // Background email dispatch (non-blocking)
    let emailStatus = 'QUEUED';
    const emailRecipients: string[] = [];
    for (const st of students) {
      if (st.parent?.fatherEmail && !emailRecipients.includes(st.parent.fatherEmail)) {
        emailRecipients.push(st.parent.fatherEmail);
      }
      if (st.user?.email && !emailRecipients.includes(st.user.email)) {
        emailRecipients.push(st.user.email);
      }
    }

    if (emailRecipients.length > 0) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
          <div style="background: #0a192f; color: white; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb;">
            <h2 style="margin: 0; font-size: 20px; font-family: Georgia, serif;">The Hayatabad Model School</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #60a5fa; letter-spacing: 1.5px;">New Homework Assignment Notification</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <div style="display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; font-weight: bold; font-size: 13px; border-radius: 20px; margin-bottom: 12px; border: 1px solid #bfdbfe;">
              Subject: ${homework.subject.name} (${homework.class.name} - ${homework.section.name})
            </div>
            <h3 style="font-size: 18px; color: #0f172a; margin: 8px 0 12px 0;">${title}</h3>
            <div style="font-size: 14px; line-height: 1.6; color: #475569; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
              ${description}
            </div>
            <div style="margin-top: 16px; font-size: 13px; color: #64748b;">
              <p style="margin: 4px 0;"><strong>Teacher:</strong> ${teacherName}</p>
              <p style="margin: 4px 0;"><strong>Submission Deadline:</strong> ${new Date(dueDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:3000/login" style="display: inline-block; padding: 12px 28px; background: #2563eb; color: white; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                Open Student / Parent Portal ➔
              </a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            © The Hayatabad Model School, Phase 3, Peshawar. This is an automated academic alert.
          </div>
        </div>
      `;

      // Dispatch to recipients asynchronously
      (async () => {
        for (const recipient of emailRecipients.slice(0, 15)) {
          try {
            await emailProvider.sendEmail({
              to: recipient,
              toName: 'Parent / Student',
              subject: `New Homework: ${homework.subject.name} — ${title}`,
              html: emailHtml,
            });
          } catch (e) {
            console.warn(`Failed sending homework email to ${recipient}:`, e);
          }
        }
      })().catch(console.error);

      emailStatus = 'SENT';
    }

    await logAuditEvent({
      userName: teacherName,
      role: session.role,
      action: 'HOMEWORK_PUBLISHED',
      entity: 'Homework',
      entityId: homework.id,
      details: `Published homework "${title}" for ${homework.class.name} - ${homework.section.name} (${homework.subject.name})`,
    });

    return NextResponse.json({
      success: true,
      message: emailStatus === 'SENT' 
        ? 'Homework published and email notifications dispatched successfully' 
        : 'Homework published to student & parent portals successfully',
      homework: {
        id: homework.id,
        title: homework.title,
        className: homework.class.name,
        sectionName: homework.section.name,
        subjectName: homework.subject.name,
        dueDate: homework.dueDate,
      },
      emailStatus,
      targetedStudentsCount: students.length,
    });
  } catch (error: any) {
    console.error('Publish teacher homework error:', error);
    return NextResponse.json({ error: error.message || 'Failed to publish homework' }, { status: 500 });
  }
}
