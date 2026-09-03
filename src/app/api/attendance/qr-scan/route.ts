import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { format } from 'date-fns';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { qrToken, deviceId, method = 'QR' } = await req.json();

    if (!qrToken || typeof qrToken !== 'string' || qrToken.trim() === '') {
      return NextResponse.json({ error: 'Card or QR token is required' }, { status: 400 });
    }

    let raw = qrToken.trim().replace(/^["']|["']$/g, '');
    let cleaned = raw;

    // Handle full verification URL or path
    if (cleaned.includes('/verify/student/')) {
      const match = cleaned.match(/\/verify\/student\/([^/?#\s]+)/i);
      if (match && match[1]) {
        try {
          cleaned = decodeURIComponent(match[1]).trim();
        } catch (_) {
          cleaned = match[1].trim();
        }
      } else {
        const parts = cleaned.split('/verify/student/');
        cleaned = parts[parts.length - 1].split('?')[0].split('#')[0].replace(/\/+$/, '').trim();
        try {
          cleaned = decodeURIComponent(cleaned);
        } catch (_) {}
      }
    }

    // Flexible student search: by qrToken, studentId, admissionNo, rollNo, or UUID
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { qrToken: cleaned },
          { qrToken: raw },
          { studentId: { equals: cleaned, mode: 'insensitive' } },
          { studentId: { equals: raw, mode: 'insensitive' } },
          { admissionNo: { equals: cleaned, mode: 'insensitive' } },
          { admissionNo: { equals: raw, mode: 'insensitive' } },
          { rollNo: { equals: cleaned, mode: 'insensitive' } },
          { id: cleaned },
        ],
      },
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
          qrToken: cleaned,
          scanType: 'GATE_ENTRY',
          result: 'INVALID',
          scannerIp: ip,
          scannerDevice: deviceId || 'Smart Gate Scanner',
          remarks: `Card token '${cleaned}' not found in student database`,
        },
      }).catch(console.error);

      return NextResponse.json({ 
        error: `Unrecognized Card / Token (${cleaned}). Student record not found in system.` 
      }, { status: 404 });
    }

    if (student.cardStatus && student.cardStatus !== 'ACTIVE') {
      await prisma.qrScanLog.create({
        data: {
          qrToken: student.qrToken,
          studentId: student.id,
          scanType: 'GATE_ENTRY',
          result: student.cardStatus,
          scannerIp: ip,
          scannerDevice: deviceId || 'Smart Gate Scanner',
          remarks: `Gate scan rejected because card is ${student.cardStatus}`,
        },
      }).catch(console.error);

      return NextResponse.json({
        error: `Student Identity Card is ${student.cardStatus}. Access denied. Please contact school administration.`,
      }, { status: 403 });
    }

    if (student.status !== 'ENROLLED') {
      return NextResponse.json({
        error: `Student status is ${student.status}. Only actively enrolled students can mark attendance.`,
      }, { status: 403 });
    }

    // Determine today date at midnight local
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
        alreadyMarked: true,
        message: `Attendance was already recorded for today at ${existing.time}`,
        student: {
          id: student.id,
          studentId: student.studentId,
          admissionNo: student.admissionNo,
          fullName: student.fullName,
          rollNo: student.rollNo,
          className: student.class.name,
          sectionName: student.section.name,
          photoUrl: student.photoUrl,
          time: existing.time,
          status: existing.status,
          method: existing.method || method,
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
        remarks: isLate ? 'Late arrival via Main Gate Scanner' : 'On-time Card verification',
      },
    });

    // Log successful scan
    await prisma.qrScanLog.create({
      data: {
        qrToken: student.qrToken,
        studentId: student.id,
        scanType: 'GATE_ENTRY',
        result: 'VERIFIED',
        scannerIp: ip,
        scannerDevice: deviceId || 'Smart Gate Scanner',
        remarks: `Successful ${method} scan for ${student.fullName} (${student.studentId})`,
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      alreadyMarked: false,
      message: isLate ? 'Late arrival recorded' : 'Attendance verified & recorded successfully',
      student: {
        id: student.id,
        studentId: student.studentId,
        admissionNo: student.admissionNo,
        fullName: student.fullName,
        rollNo: student.rollNo,
        className: student.class.name,
        sectionName: student.section.name,
        photoUrl: student.photoUrl,
        time: record.time,
        status: record.status,
        method: record.method,
      },
    });
  } catch (error: any) {
    console.error('QR/Card Scan error:', error);
    return NextResponse.json({ error: 'Failed to process card attendance scan: ' + (error?.message || 'Server error') }, { status: 500 });
  }
}
