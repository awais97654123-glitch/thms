import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { emailQueue } from '@/lib/email/queue';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const jobs = await prisma.emailJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { logs: true },
    });

    const totalJobs = await prisma.emailJob.count();
    const sentCount = await prisma.emailJob.count({ where: { status: 'SENT' } });
    const failedCount = await prisma.emailJob.count({ where: { status: 'FAILED' } });
    const queuedCount = await prisma.emailJob.count({ where: { status: 'QUEUED' } });

    return NextResponse.json({
      success: true,
      jobs,
      summary: {
        total: totalJobs,
        sent: sentCount,
        failed: failedCount,
        queued: queuedCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch email logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    await emailQueue.retryFailedJob(jobId);
    return NextResponse.json({ success: true, message: 'Job retry initiated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retry email job' }, { status: 500 });
  }
}
