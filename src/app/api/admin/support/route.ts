import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized admin session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        student: {
          include: { class: true, section: true },
        },
        user: {
          select: { id: true, username: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const stats = {
      total: await prisma.supportTicket.count(),
      open: await prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      inProgress: await prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      resolved: await prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
    };

    return NextResponse.json({ success: true, tickets, stats });
  } catch (error) {
    console.error('Error fetching admin support tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized admin session' }, { status: 401 });
    }

    const { ticketId, message, status } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    if (message) {
      await prisma.supportMessage.create({
        data: {
          ticketId,
          senderId: user.userId,
          senderRole: 'ADMIN',
          senderName: 'School Administration (Admin)',
          message,
        },
      });
    }

    if (status) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status, updatedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
