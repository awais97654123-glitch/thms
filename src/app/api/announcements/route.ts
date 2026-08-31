import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { emailProvider } from '@/lib/email/provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { publishDate: 'desc' }],
      include: {
        class: true,
        section: true,
      },
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, targetAudience = 'ALL', isPinned = false, classId, sectionId } = await req.json();

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetAudience,
        isPinned,
        classId: classId || null,
        sectionId: sectionId || null,
      },
    });

    // 1. Determine target users for in-app notification
    let targetRoles: string[] = [];
    if (targetAudience === 'ALL') {
      targetRoles = ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'];
    } else if (targetAudience === 'STUDENTS') {
      targetRoles = ['STUDENT'];
    } else if (targetAudience === 'PARENTS') {
      targetRoles = ['PARENT'];
    } else if (targetAudience === 'TEACHERS' || targetAudience === 'STAFF') {
      targetRoles = ['TEACHER', 'STAFF'];
    } else {
      targetRoles = ['STUDENT', 'PARENT'];
    }

    // Find active target users
    const targetUsers = await prisma.user.findMany({
      where: {
        role: { in: targetRoles },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    // Create in-app notifications
    if (targetUsers.length > 0) {
      const notifs = targetUsers.map((u) => ({
        userId: u.id,
        title: `Campus Notice: ${title}`,
        message: content.length > 120 ? content.substring(0, 120) + '...' : content,
        type: 'ANNOUNCEMENT',
        link: '/#news',
      }));

      await prisma.notification.createMany({
        data: notifs,
      }).catch((e) => console.warn('Bulk notification creation error:', e));
    }

    // 2. Dispatch Broadcast Email Notification
    const emailRecipients = targetUsers
      .map((u) => u.email)
      .filter((em): em is string => Boolean(em && em.includes('@')));

    if (emailRecipients.length > 0) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
          <div style="background: #0a192f; color: white; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb;">
            <h2 style="margin: 0; font-size: 20px; font-family: Georgia, serif;">The Hayatabad Model School</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #60a5fa; letter-spacing: 1.5px;">Official Campus Circular & Announcement</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <span style="display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; font-weight: bold; font-size: 11px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; border: 1px solid #bfdbfe;">
              Target: ${targetAudience}
            </span>
            <h3 style="font-size: 18px; color: #0f172a; margin: 0 0 12px 0;">${title}</h3>
            <div style="font-size: 14px; line-height: 1.6; color: #475569; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
              ${content}
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:3000/login" style="display: inline-block; padding: 12px 28px; background: #2563eb; color: white; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                View Full Portal Notice ➔
              </a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            The Hayatabad Model School • Phase 3, Peshawar • Tel: +92 91 5828850
          </div>
        </div>
      `;

      // Dispatch non-blockingly
      (async () => {
        for (const recipient of emailRecipients.slice(0, 20)) {
          try {
            await emailProvider.sendEmail({
              to: recipient,
              toName: 'Student / Parent / Staff',
              subject: `Official Circular: ${title}`,
              html: emailHtml,
            });
          } catch (e) {
            console.warn(`Failed sending circular to ${recipient}:`, e);
          }
        }
      })().catch(console.error);
    }

    return NextResponse.json({
      success: true,
      announcement,
      notifiedUsersCount: targetUsers.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

