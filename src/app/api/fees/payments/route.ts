import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateReceiptNumber } from '@/lib/id-generator';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { notificationDispatcher } from '@/lib/email/service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    const where: any = {};
    if (studentId) where.studentId = studentId;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        invoice: {
          include: { items: true },
        },
        student: {
          include: {
            class: true,
            section: true,
            parent: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { invoiceId, amount, paymentMethod = 'CASH', transactionRef, bankName, remarks } = await req.json();

    const paymentAmount = parseFloat(amount);
    if (!invoiceId || isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: 'Valid invoice and payment amount are required' }, { status: 400 });
    }

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          include: {
            class: true,
            section: true,
            parent: true,
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (paymentAmount > invoice.remainingAmount) {
      return NextResponse.json({
        error: `Payment amount (Rs. ${paymentAmount}) exceeds remaining balance of Rs. ${invoice.remainingAmount}`,
      }, { status: 400 });
    }

    const receiptNo = await generateReceiptNumber(2026);

    const { payment, updatedInvoice } = await prisma.$transaction(async (tx) => {
      // Re-fetch invoice with lock in transaction to prevent race conditions / double submission
      const currentInv = await tx.feeInvoice.findUnique({
        where: { id: invoiceId },
      });

      if (!currentInv) {
        throw new Error('Invoice not found during payment processing');
      }

      if (paymentAmount > currentInv.remainingAmount) {
        throw new Error(`Payment amount (Rs. ${paymentAmount}) exceeds remaining balance of Rs. ${currentInv.remainingAmount}`);
      }

      const p = await tx.payment.create({
        data: {
          receiptNo,
          invoiceId: currentInv.id,
          studentId: currentInv.studentId,
          amount: paymentAmount,
          paymentDate: new Date(),
          paymentMethod,
          transactionRef: transactionRef || null,
          bankName: bankName || null,
          receivedById: session?.userId || null,
          status: 'COMPLETED',
          remarks: remarks || `Fee payment for ${currentInv.title}`,
        },
      });

      const newPaidAmount = currentInv.paidAmount + paymentAmount;
      const newRemainingAmount = Math.max(0, currentInv.remainingAmount - paymentAmount);
      const newStatus = newRemainingAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';

      const upInv = await tx.feeInvoice.update({
        where: { id: currentInv.id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
        },
        include: {
          items: true,
        },
      });

      return { payment: p, updatedInvoice: upInv };
    });

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Cashier',
      role: session?.role || 'ACCOUNTANT',
      action: 'PAYMENT_RECEIVED',
      entity: 'Payment',
      entityId: payment.id,
      details: {
        receiptNo: payment.receiptNo,
        invoiceNo: invoice.invoiceNo,
        studentName: invoice.student.fullName,
        amount: paymentAmount,
        remainingBalance: updatedInvoice.remainingAmount,
        method: paymentMethod,
      },
    });

    // Dispatch email receipt to parent
    notificationDispatcher
      .onFeePaymentReceived({
        receiptNo: payment.receiptNo,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        remainingBalance: updatedInvoice.remainingAmount,
        studentId: invoice.studentId,
      })
      .catch((err) => console.error('Failed to dispatch payment receipt email:', err));

    return NextResponse.json({
      success: true,
      message: 'Payment recorded and official receipt generated successfully',
      receipt: {
        receiptNo: payment.receiptNo,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        transactionRef: payment.transactionRef,
        bankName: payment.bankName,
      },
      invoice: {
        invoiceNo: invoice.invoiceNo,
        title: invoice.title,
        month: invoice.month,
        totalAmount: invoice.totalAmount,
        discountAmount: invoice.discountAmount,
        paidAmount: updatedInvoice.paidAmount,
        remainingAmount: updatedInvoice.remainingAmount,
        status: updatedInvoice.status,
        items: invoice.items,
      },
      student: {
        studentId: invoice.student.studentId,
        admissionNo: invoice.student.admissionNo,
        rollNo: invoice.student.rollNo,
        fullName: invoice.student.fullName,
        className: invoice.student.class.name,
        sectionName: invoice.student.section.name,
        fatherName: invoice.student.parent?.fatherName || 'N/A',
      },
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: 'Failed to record fee payment' }, { status: 500 });
  }
}
