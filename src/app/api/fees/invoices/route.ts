import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateInvoiceNumber } from '@/lib/id-generator';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const query = searchParams.get('q');

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (studentId) where.studentId = studentId;
    if (classId) {
      where.student = { classId };
    }
    if (query) {
      where.OR = [
        { invoiceNo: { contains: query, mode: 'insensitive' } },
        { title: { contains: query, mode: 'insensitive' } },
        { student: { fullName: { contains: query, mode: 'insensitive' } } },
        { student: { studentId: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const [total, invoices, aggregates] = await Promise.all([
      prisma.feeInvoice.count({ where }),
      prisma.feeInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              class: true,
              section: true,
              parent: true,
            },
          },
          items: true,
          payments: true,
        },
      }),
      prisma.feeInvoice.aggregate({
        where,
        _sum: {
          totalAmount: true,
          paidAmount: true,
          remainingAmount: true,
        },
      }),
    ]);

    const totalBilled = aggregates._sum.totalAmount || 0;
    const totalCollected = aggregates._sum.paidAmount || 0;
    const totalPending = aggregates._sum.remainingAmount || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalBilled,
        totalCollected,
        totalPending,
        count: total,
      },
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();

    const activeSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

    if (!activeSession) {
      return NextResponse.json({ error: 'No active academic session found' }, { status: 400 });
    }

    // Single or bulk class creation
    if (body.classId && body.isBulk) {
      const students = await prisma.student.findMany({
        where: { classId: body.classId, status: 'ENROLLED' },
      });

      const created = [];
      for (const student of students) {
        const invoiceNo = await generateInvoiceNumber(2026);
        const totalAmount = body.items.reduce((sum: number, it: any) => sum + parseFloat(it.amount), 0);

        const inv = await prisma.feeInvoice.create({
          data: {
            invoiceNo,
            studentId: student.id,
            sessionId: activeSession.id,
            title: body.title || `Monthly Fee - ${body.month || 'Current'}`,
            month: body.month || 'Current Month',
            issueDate: new Date(),
            dueDate: new Date(body.dueDate || Date.now() + 10 * 24 * 60 * 60 * 1000),
            totalAmount,
            discountAmount: 0,
            paidAmount: 0,
            remainingAmount: totalAmount,
            status: 'PENDING',
            remarks: body.remarks || 'Bulk monthly class invoice',
            items: {
              create: body.items.map((it: any) => ({
                feeType: it.feeType,
                amount: parseFloat(it.amount),
                description: it.description,
              })),
            },
          },
        });
        created.push(inv);
      }

      await logAuditEvent({
        userId: session?.userId,
        userName: session?.fullName || 'Accountant',
        role: session?.role || 'ACCOUNTANT',
        action: 'BULK_INVOICES_GENERATED',
        entity: 'FeeInvoice',
        details: `Generated ${created.length} invoices for class`,
      });

      return NextResponse.json({ success: true, count: created.length });
    }

    // Single student invoice
    const invoiceNo = await generateInvoiceNumber(2026);
    const totalAmount = body.items.reduce((sum: number, it: any) => sum + parseFloat(it.amount), 0);
    const discountAmount = parseFloat(body.discountAmount || 0);
    const netAmount = Math.max(0, totalAmount - discountAmount);

    const invoice = await prisma.feeInvoice.create({
      data: {
        invoiceNo,
        studentId: body.studentId,
        sessionId: activeSession.id,
        title: body.title,
        month: body.month || 'Current Month',
        issueDate: new Date(),
        dueDate: new Date(body.dueDate || Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalAmount,
        discountAmount,
        paidAmount: 0,
        remainingAmount: netAmount,
        status: 'PENDING',
        remarks: body.remarks,
        items: {
          create: body.items.map((it: any) => ({
            feeType: it.feeType,
            amount: parseFloat(it.amount),
            description: it.description,
          })),
        },
      },
      include: {
        student: true,
      },
    });

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Accountant',
      role: session?.role || 'ACCOUNTANT',
      action: 'FEE_INVOICE_CREATED',
      entity: 'FeeInvoice',
      entityId: invoice.id,
      details: `Created invoice ${invoice.invoiceNo} for ${invoice.student.fullName} (Rs. ${invoice.remainingAmount})`,
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create fee invoice' }, { status: 500 });
  }
}
