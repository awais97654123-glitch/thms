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
    if (!hasPermission(session.role, 'library.manage') && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { isbn: { contains: query, mode: 'insensitive' } },
        { accessionNo: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, books] = await Promise.all([
      prisma.libraryBook.count({ where }),
      prisma.libraryBook.findMany({
        where,
        skip,
        take: limit,
        orderBy: { title: 'asc' },
        include: {
          issues: {
            where: { isReturned: false },
            include: {
              student: { select: { id: true, fullName: true, studentId: true, class: { select: { name: true } } } },
              teacher: { select: { id: true, fullName: true, employeeId: true } },
            },
          },
        },
      }),
    ]);

    // Aggregate stats
    const [totalBooks, totalIssued, overdueCount] = await Promise.all([
      prisma.libraryBook.count(),
      prisma.libraryIssue.count({ where: { isReturned: false } }),
      prisma.libraryIssue.count({ where: { isReturned: false, dueDate: { lt: new Date() } } }),
    ]);

    const totalAvailable = await prisma.libraryBook.aggregate({ _sum: { availableCopies: true } });

    return NextResponse.json({
      success: true,
      books,
      stats: {
        totalBooks,
        totalIssued,
        totalAvailable: totalAvailable._sum.availableCopies || 0,
        overdueCount,
      },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch library books' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'library.manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'ADD_BOOK') {
      const { title, author, isbn, category, publisher, edition, totalCopies, shelfLocation } = body;
      if (!title || !author || !category) {
        return NextResponse.json({ error: 'Title, author, and category are required' }, { status: 400 });
      }

      // Generate accession number
      const count = await prisma.libraryBook.count();
      const accessionNo = `BK-${(count + 1).toString().padStart(5, '0')}`;

      const book = await prisma.libraryBook.create({
        data: {
          accessionNo,
          title,
          author,
          isbn: isbn || null,
          category,
          publisher: publisher || null,
          edition: edition || null,
          totalCopies: totalCopies || 1,
          availableCopies: totalCopies || 1,
          shelfLocation: shelfLocation || null,
        },
      });

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: 'BOOK_ADDED',
        entity: 'LibraryBook',
        entityId: book.id,
        details: `Book added: "${title}" by ${author} (${accessionNo})`,
      });

      return NextResponse.json({ success: true, book });
    }

    if (action === 'ISSUE_BOOK') {
      const { bookId, studentId, teacherId, dueDate } = body;
      if (!bookId || (!studentId && !teacherId)) {
        return NextResponse.json({ error: 'Book ID and borrower (student or teacher) are required' }, { status: 400 });
      }

      const book = await prisma.libraryBook.findUnique({ where: { id: bookId } });
      if (!book || book.availableCopies <= 0) {
        return NextResponse.json({ error: 'Book not available for issue' }, { status: 400 });
      }

      const [issue] = await prisma.$transaction([
        prisma.libraryIssue.create({
          data: {
            bookId,
            studentId: studentId || null,
            teacherId: teacherId || null,
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
            issuedById: session.userId,
          },
        }),
        prisma.libraryBook.update({
          where: { id: bookId },
          data: { availableCopies: { decrement: 1 } },
        }),
      ]);

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: 'BOOK_ISSUED',
        entity: 'LibraryIssue',
        entityId: issue.id,
        details: `Book "${book.title}" issued to ${studentId ? 'student' : 'teacher'}`,
      });

      return NextResponse.json({ success: true, issue });
    }

    if (action === 'RETURN_BOOK') {
      const { issueId, fineAmount } = body;
      if (!issueId) {
        return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 });
      }

      const issue = await prisma.libraryIssue.findUnique({ where: { id: issueId }, include: { book: true } });
      if (!issue || issue.isReturned) {
        return NextResponse.json({ error: 'Invalid issue record or already returned' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.libraryIssue.update({
          where: { id: issueId },
          data: {
            isReturned: true,
            returnDate: new Date(),
            fineAmount: fineAmount || 0,
          },
        }),
        prisma.libraryBook.update({
          where: { id: issue.bookId },
          data: { availableCopies: { increment: 1 } },
        }),
      ]);

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: 'BOOK_RETURNED',
        entity: 'LibraryIssue',
        entityId: issueId,
        details: `Book "${issue.book.title}" returned${fineAmount ? `, fine: Rs.${fineAmount}` : ''}`,
      });

      return NextResponse.json({ success: true, message: 'Book returned successfully' });
    }

    return NextResponse.json({ error: 'Invalid action. Use ADD_BOOK, ISSUE_BOOK, or RETURN_BOOK' }, { status: 400 });
  } catch (error) {
    console.error('Library action error:', error);
    return NextResponse.json({ error: 'Library operation failed' }, { status: 500 });
  }
}
