import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { fullName: 'asc' },
      include: {
        managedSections: {
          include: { class: true },
        },
        subjects: {
          include: { class: true },
        },
      },
    });

    return NextResponse.json({ success: true, teachers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email, qualification, designation, classId, sectionId, subjectName, tempPassword } = body;

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const teacherCount = await prisma.teacher.count();
    const employeeId = `THMS-T-${(teacherCount + 101).toString()}`;
    const passwordToUse = tempPassword || 'Teacher@123';
    const passwordHash = await hashPassword(passwordToUse);

    const teacherEmail = email || `${employeeId.toLowerCase()}@faculty.hayatabadmodel.edu.pk`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Portal User Account
      const user = await tx.user.create({
        data: {
          username: employeeId,
          email: teacherEmail,
          passwordHash,
          role: 'TEACHER',
          isFirstLogin: true,
        },
      });

      // 2. Create Teacher Record
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          fullName,
          phone: phone || '+92 300 0000000',
          email: teacherEmail,
          qualification: qualification || 'M.Sc. Education',
          designation: designation || 'Subject Teacher',
          status: 'ACTIVE',
        },
      });

      // 3. Assign Subject if provided
      if (classId && subjectName) {
        await tx.subject.create({
          data: {
            name: subjectName,
            code: `${subjectName.substring(0, 3).toUpperCase()}-08`,
            classId,
            teacherId: teacher.id,
          },
        });
      }

      // 4. Assign Section if provided
      if (sectionId) {
        await tx.section.update({
          where: { id: sectionId },
          data: { classTeacherId: teacher.id },
        });
      }

      return {
        teacher,
        credentials: {
          fullName,
          employeeId,
          username: employeeId,
          temporaryPassword: passwordToUse,
        },
      };
    });

    await logAuditEvent({
      userName: 'Admin',
      role: 'ADMIN',
      action: 'TEACHER_CREATED',
      entity: 'Teacher',
      entityId: result.teacher.id,
      details: `Added new teacher ${fullName} (${result.teacher.employeeId})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher added and credentials generated successfully',
      teacher: result.teacher,
      credentials: result.credentials,
    });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add teacher' }, { status: 500 });
  }
}
