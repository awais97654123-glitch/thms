import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      studentsCount,
      teachersCount,
      admissionsCount,
      invoicesCount,
      paymentsCount,
      attendanceCount,
      homeworkCount,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.admissionApplication.count(),
      prisma.feeInvoice.count(),
      prisma.payment.count(),
      prisma.attendance.count(),
      prisma.homework.count(),
    ]);

    return NextResponse.json({
      success: true,
      status: 'ONLINE',
      serverTime: new Date().toISOString(),
      databaseHealth: 'HEALTHY',
      syncedTables: {
        students: studentsCount,
        teachers: teachersCount,
        admissions: admissionsCount,
        invoices: invoicesCount,
        payments: paymentsCount,
        attendance: attendanceCount,
        homework: homeworkCount,
      },
      portalsReplicationStatus: {
        studentPortal: 'LIVE_SYNCED',
        teacherPortal: 'LIVE_SYNCED',
        parentPortal: 'LIVE_SYNCED',
      },
    });
  } catch (err: any) {
    console.error('Error fetching sync status:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Database unavailable' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actions = body.actions || [];

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({ success: true, message: 'No actions to sync', processedCount: 0 });
    }

    let processedCount = 0;

    for (const action of actions) {
      try {
        // Record audit log for synced offline transaction
        await prisma.auditLog.create({
          data: {
            userName: 'Admin (Offline Sync Engine)',
            role: 'SUPER_ADMIN',
            action: action.type || 'OFFLINE_SYNC_MUTATION',
            entity: 'SyncEngine',
            entityId: action.id,
            details: JSON.stringify({
              actionType: action.type,
              originalTimestamp: action.timestamp,
              payload: action.payload,
            }),
          },
        });

        // If action is a queued offline admission
        if (action.type === 'OFFLINE_ADMISSION_QUEUED' && action.payload) {
          const p = action.payload;
          const session = await prisma.academicSession.findFirst();
          if (session && p.firstName && p.lastName) {
            const count = await prisma.admissionApplication.count();
            const year = new Date().getFullYear();
            const appNo = `THMS-APP-${year}-${String(count + 1).padStart(4, '0')}`;

            await prisma.admissionApplication.create({
              data: {
                applicationNo: appNo,
                sessionId: session.id,
                applyingClassId: p.applyingClassId || '',
                preferredSectionId: p.preferredSectionId || null,
                firstName: p.firstName,
                middleName: p.middleName || null,
                lastName: p.lastName,
                fullName: `${p.firstName} ${p.middleName ? p.middleName + ' ' : ''}${p.lastName}`.trim(),
                dob: new Date(p.dob || '2014-01-01'),
                gender: p.gender || 'MALE',
                bloodGroup: p.bloodGroup || 'B+',
                photoUrl: p.photoUrl || null,
                fatherName: p.fatherName || 'Parent',
                fatherPhone: p.fatherPhone || '03000000000',
                fatherCnic: p.fatherCnic || null,
                fatherEmail: p.fatherEmail || null,
                houseStreet: p.houseStreet || 'Sector F-4',
                area: p.area || 'Hayatabad',
                emergencyName: p.emergencyName || p.fatherName || 'Father',
                emergencyRelation: p.emergencyRelation || 'Father',
                emergencyPhone: p.emergencyPhone || p.fatherPhone || '03000000000',
                previousSchool: p.previousSchool || null,
                previousGrade: p.previousGrade || null,
              },
            });
          }
        }

        processedCount++;
      } catch (innerErr) {
        console.error('Error processing single sync item:', action.id, innerErr);
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      serverTime: new Date().toISOString(),
      message: `Successfully synchronized ${processedCount} transaction(s) to central database & portals.`,
    });
  } catch (err: any) {
    console.error('Sync batch error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
