import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { format } from 'date-fns';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { qrToken, deviceId, method = 'QR' } = await req.json();

    if (!qrToken) {
      return NextResponse.json({ error: 'QR Token is required' }, { status: 400 });
    }

    let cleanedToken = qrToken.trim();
    if (cleanedToken.includes('/verify/student/')) {
      const parts = cleanedToken.split('/verify/student/');
      cleanedToken = parts[parts.length - 1].split('?')[0].trim();
    }

    const student = await prisma.student.findUnique({
      where: { qrToken: cleanedToken },
      include: {
        class: true,
        section: true,
        session: true,
      },
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!student) {
      await prisma.qrScanLog.create({
        data: {
          qrToken: cleanedToken,
          scanType: 'GATE_ENTRY',
          result: 'INVALID',
          scannerIp: ip,
          scannerDevice: deviceId || 'Smart Gate Scanner',
          remarks: 'Gate scan token not found',
        },
      }).catch(console.error);

      return NextResponse.json({ error: 'Unrecognized QR Token. Student record not found.' }, { status: 404 });
    }

    if (student.cardStatus && student.cardStatus !== 'ACTIVE') {
      await prisma.qrScanLog.create({
        data: {
          qrToken: cleanedToken,
          studentId: student.id,
          scanType: 'GATE_ENTRY',
          result: student.cardStatus,
          scannerIp: ip,
          scannerDevice: deviceId || 'Smart Gate Scanner',
          remarks: `Gate scan rejected because card is ${student.cardStatus}`,
        },
      }).catch(console.error);

      return NextResponse.json({
        error: `Identity Card Inactive (${student.cardStatus}). Gate turnstile entry denied.`,
      }, { status: 403 });
    }

    if (student.status !== 'ENROLLED') {
      return NextResponse.json({
        error: `Student status is ${student.status}. Only actively enrolled students can mark attendance.`,
      }, { status: 403 });
    }

    // Determine today date at midnight UTC
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const formattedTime = format(now, 'hh:mm a');

    // Check if already scanned today
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId: student.id,
          date: todayMidnight,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: `Attendance was already recorded for today at ${existing.time}`,
        student: {
          id: student.id,
          studentId: student.studentId,
          fullName: student.fullName,
          rollNo: student.rollNo,
          className: student.class.name,
          sectionName: student.section.name,
          time: existing.time,
          status: existing.status,
        },
      });
    }

    // Determine status (Late after 08:30 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 8 || (hours === 8 && minutes > 30);
    const status = isLate ? 'LATE' : 'PRESENT';

    const record = await prisma.attendance.create({
      data: {
        studentId: student.id,
        date: todayMidnight,
        time: formattedTime,
        status,
        method,
        deviceId: deviceId || 'SCANNER-MAIN-GATE',
        remarks: isLate ? 'Late arrival via Main Gate Scanner' : 'On-time Main Gate QR verification',
      },
    });

    return NextResponse.json({
      success: true,
      message: isLate ? 'Late arrival recorded' : 'Attendance verified & recorded successfully',
      student: {
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
        rollNo: student.rollNo,
        className: student.class.name,
        sectionName: student.section.name,
        time: record.time,
        status: record.status,
      },
    });
  } catch (error) {
    console.error('QR Scan error:', error);
    return NextResponse.json({ error: 'Failed to process QR attendance scan' }, { status: 500 });
  }
}
