import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser';

    if (!token || token.trim() === '') {
      return NextResponse.json(
        { error: 'Verification token is required', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { qrToken: token.trim() },
      include: {
        class: true,
        section: true,
        session: true,
      },
    });

    if (!student) {
      // Record invalid scan attempt
      await prisma.qrScanLog.create({
        data: {
          qrToken: token.trim(),
          scanType: 'VERIFICATION',
          result: 'INVALID',
          scannerIp: ip,
          scannerDevice: userAgent.slice(0, 150),
          remarks: 'Token not found in student registry',
        },
      }).catch(console.error);

      return NextResponse.json(
        {
          error: 'This QR code could not be verified. The card may be invalid or unregistered.',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Check card expiration
    const now = new Date();
    const isExpired = student.cardExpiresAt && new Date(student.cardExpiresAt) < now;
    const cardStatus = isExpired ? 'EXPIRED' : (student.cardStatus || 'ACTIVE');

    if (cardStatus === 'REVOKED' || cardStatus === 'LOST' || cardStatus === 'EXPIRED') {
      await prisma.qrScanLog.create({
        data: {
          qrToken: token.trim(),
          studentId: student.id,
          scanType: 'VERIFICATION',
          result: cardStatus,
          scannerIp: ip,
          scannerDevice: userAgent.slice(0, 150),
          remarks: `Card verification attempted on ${cardStatus.toLowerCase()} card`,
        },
      }).catch(console.error);

      return NextResponse.json(
        {
          error: `This student identity card is no longer valid (${cardStatus}).`,
          code: 'CARD_INACTIVE',
          cardStatus,
          student: {
            fullName: student.fullName,
            studentId: student.studentId,
            photoUrl: student.photoUrl,
            cardStatus,
          },
        },
        { status: 403 }
      );
    }

    // Record verified scan in QrScanLog
    await prisma.qrScanLog.create({
      data: {
        qrToken: token.trim(),
        studentId: student.id,
        scanType: 'VERIFICATION',
        result: 'VERIFIED',
        scannerIp: ip,
        scannerDevice: userAgent.slice(0, 150),
        remarks: 'Official public credential verification passed',
      },
    }).catch(console.error);

    // Return sanitized public verification dossier
    return NextResponse.json({
      success: true,
      verified: true,
      verifiedAt: new Date().toISOString(),
      student: {
        id: student.id,
        fullName: student.fullName,
        studentId: student.studentId,
        rollNo: student.rollNo,
        admissionNo: student.admissionNo,
        photoUrl: student.photoUrl || '/student-avatar.png',
        gender: student.gender,
        bloodGroup: student.bloodGroup || 'N/A',
        enrollmentStatus: student.status,
        cardStatus: student.cardStatus || 'ACTIVE',
        cardIssuedAt: student.cardIssuedAt || student.createdAt,
        cardExpiresAt: student.cardExpiresAt,
        class: {
          name: student.class?.name || 'Class',
        },
        section: {
          name: student.section?.name || 'Section',
        },
        session: {
          name: student.session?.name || '2026-2027',
        },
      },
      institution: {
        name: 'The Hayatabad Model School',
        code: 'THMS',
        address: 'Phase 3, Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan',
        phone: '+92 91 5828100',
        website: 'https://hayatabadmodel.edu.pk',
        verificationRegistry: 'THMS Official Secure Registry v2.6',
      },
    });
  } catch (error: any) {
    console.error('QR verification error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred during verification' },
      { status: 500 }
    );
  }
}
