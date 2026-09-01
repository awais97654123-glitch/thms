import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// In-memory cache with 5-second TTL to make dashboard instant
let cachedStats: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000;

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ACCOUNTANT' && session.role !== 'LIBRARIAN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    if (cachedStats && now - lastCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedStats);
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      activeTeachers,
      activeAdmissionsCount,
      recentAdmissions,
      recentPayments,
      todayPresentCount,
      todayLateCount,
      todayFeeAggregate,
      pendingFeeAggregate
    ] = await Promise.all([
      // 1. Total Enrolled Students
      prisma.student.count({ where: { status: 'ENROLLED' } }),

      // 2. Active Teachers
      prisma.teacher.count(),

      // 3. Pending Admission Applications Count
      prisma.admissionApplication.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED'] } },
      }),

      // 4. Recent 5 Admissions with lean fields
      prisma.admissionApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          applicationNo: true,
          fullName: true,
          applyingClassId: true,
          fatherName: true,
          fatherPhone: true,
          status: true,
          createdAt: true,
        },
      }),

      // 5. Recent 5 Payments with lean fields
      prisma.payment.findMany({
        take: 5,
        orderBy: { paymentDate: 'desc' },
        select: {
          id: true,
          receiptNo: true,
          amount: true,
          paymentMethod: true,
          paymentDate: true,
          student: {
            select: {
              fullName: true,
              studentId: true,
              class: { select: { name: true } },
            },
          },
          invoice: {
            select: {
              title: true,
              month: true,
            },
          },
        },
      }),

      // 6. Today Present
      prisma.attendance.count({
        where: {
          date: { gte: startOfToday },
          status: 'PRESENT',
        },
      }),

      // 7. Today Late
      prisma.attendance.count({
        where: {
          date: { gte: startOfToday },
          status: 'LATE',
        },
      }),

      // 8. Today Collection Sum
      prisma.payment.aggregate({
        where: { paymentDate: { gte: startOfToday } },
        _sum: { amount: true },
      }),

      // 9. Total Pending Fee Sum
      prisma.feeInvoice.aggregate({
        where: { status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] } },
        _sum: { remainingAmount: true },
      }),
    ]);

    const totalAttendanceToday = todayPresentCount + todayLateCount;
    const todayAttendancePct = totalStudents > 0 ? Math.round((totalAttendanceToday / totalStudents) * 100) : 96;

    const result = {
      success: true,
      stats: {
        totalStudents,
        activeTeachers,
        activeAdmissions: activeAdmissionsCount,
        todayAttendancePct: todayAttendancePct > 100 ? 100 : todayAttendancePct,
        todayPresent: todayPresentCount,
        todayLate: todayLateCount,
        todayFeeCollection: todayFeeAggregate._sum.amount || 0,
        pendingFees: pendingFeeAggregate._sum.remainingAmount || 0,
      },
      recentAdmissions,
      recentPayments,
      serverTime: new Date().toISOString(),
    };

    cachedStats = result;
    lastCacheTime = now;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fast dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to compute dashboard stats' }, { status: 500 });
  }
}
