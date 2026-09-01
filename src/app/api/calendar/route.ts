import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // e.g. "2026-09"
    const eventType = searchParams.get('type');

    const where: any = { isActive: true };

    // Role-based filtering
    if (!['SUPER_ADMIN', 'PRINCIPAL', 'ADMIN', 'SCHOOL_ADMIN'].includes(session.role)) {
      where.OR = [
        { targetRole: 'ALL' },
        { targetRole: session.role === 'TEACHER' ? 'TEACHERS' : session.role === 'STUDENT' ? 'STUDENTS' : session.role === 'PARENT' ? 'PARENTS' : 'ALL' },
      ];
    }

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const startOfMonth = new Date(year, m - 1, 1);
      const endOfMonth = new Date(year, m, 0, 23, 59, 59);
      where.startDate = { gte: startOfMonth, lte: endOfMonth };
    }

    if (eventType && eventType !== 'ALL') {
      where.eventType = eventType;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'calendar.manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE' || !action) {
      const { title, description, eventType, startDate, endDate, isAllDay, targetRole, classId, color, location } = body;
      if (!title || !eventType || !startDate) {
        return NextResponse.json({ error: 'Title, event type, and start date are required' }, { status: 400 });
      }

      const event = await prisma.calendarEvent.create({
        data: {
          title,
          description: description || null,
          eventType,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          isAllDay: isAllDay !== false,
          targetRole: targetRole || 'ALL',
          classId: classId || null,
          color: color || '#1e3a8a',
          location: location || null,
          createdById: session.userId,
        },
      });

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: 'CALENDAR_EVENT_CREATED',
        entity: 'CalendarEvent',
        entityId: event.id,
        details: `Calendar event created: "${title}" (${eventType}) on ${startDate}`,
      });

      return NextResponse.json({ success: true, event });
    }

    if (action === 'DELETE') {
      const { eventId } = body;
      if (!eventId) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
      }

      await prisma.calendarEvent.update({
        where: { id: eventId },
        data: { isActive: false },
      });

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: 'CALENDAR_EVENT_DELETED',
        entity: 'CalendarEvent',
        entityId: eventId,
        details: 'Calendar event soft-deleted',
      });

      return NextResponse.json({ success: true, message: 'Event deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Calendar action error:', error);
    return NextResponse.json({ error: 'Calendar operation failed' }, { status: 500 });
  }
}
