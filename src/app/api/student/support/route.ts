import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized student session' }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching student support tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized student session' }, { status: 401 });
    }

    const { category, subject, description, priority = 'NORMAL', ticketId, message } = await req.json();

    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
    });

    // If replying to existing ticket
    if (ticketId && message) {
      const newMsg = await prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: user.userId,
          senderRole: 'STUDENT',
          senderName: student?.fullName || user.username || 'Student',
          message,
        },
      });

      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'OPEN', updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, message: newMsg });
    }

    // Creating new ticket
    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // AI automated first-responder triage
    let aiResponse = '';
    const descLower = description.toLowerCase();
    if (descLower.includes('fee') || descLower.includes('voucher') || descLower.includes('challan')) {
      aiResponse = `Hello ${student?.fullName || 'Student'}! THMS AI Bot has triaged your inquiry to the Accounts & Finance Desk. Your fee records have been flagged for verification. An administrator will respond shortly.`;
    } else if (descLower.includes('id card') || descLower.includes('card') || descLower.includes('photo')) {
      aiResponse = `Hello ${student?.fullName || 'Student'}! Your Digital ID card inquiry has been directed to the Registrar & Student Affairs department.`;
    } else {
      aiResponse = `Hello ${student?.fullName || 'Student'}! Your ticket #${ticketNumber} has been logged and assigned to the School Administration. We typically resolve tickets within 1 business day.`;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: user.userId,
        studentId: student?.id,
        category: category || 'GENERAL',
        subject,
        description,
        priority: priority || 'NORMAL',
        status: 'OPEN',
        aiSummary: `Student reported: ${subject}. Triage category: ${category}`,
        messages: {
          create: [
            {
              senderId: user.userId,
              senderRole: 'STUDENT',
              senderName: student?.fullName || user.username || 'Student',
              message: description,
            },
            {
              senderId: 'ai-system',
              senderRole: 'AI_BOT',
              senderName: 'THMS AI Auto-Responder',
              message: aiResponse,
            },
          ],
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}
