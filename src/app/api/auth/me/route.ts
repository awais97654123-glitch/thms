import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. No active session.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        isFirstLogin: true,
        lastLoginAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            admissionNo: true,
            rollNo: true,
            firstName: true,
            lastName: true,
            fullName: true,
            dob: true,
            gender: true,
            bloodGroup: true,
            photoUrl: true,
            qrToken: true,
            status: true,
            class: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            section: {
              select: {
                id: true,
                name: true,
                roomNo: true,
              },
            },
            session: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            parent: {
              select: {
                id: true,
                fatherName: true,
                fatherPhone: true,
                fatherEmail: true,
                address: true,
                emergencyContact: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            phone: true,
            email: true,
            qualification: true,
            designation: true,
            photoUrl: true,
            managedSections: {
              select: {
                id: true,
                name: true,
                class: { select: { id: true, name: true } },
              },
            },
            subjects: {
              select: {
                id: true,
                name: true,
                code: true,
                class: { select: { id: true, name: true } },
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            fatherName: true,
            fatherPhone: true,
            fatherEmail: true,
            address: true,
            city: true,
            emergencyContact: true,
            students: {
              select: {
                id: true,
                studentId: true,
                admissionNo: true,
                rollNo: true,
                fullName: true,
                photoUrl: true,
                gender: true,
                status: true,
                class: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
                session: { select: { id: true, name: true } },
              },
            },
          },
        },
        staff: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            role: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // Fetch school setting for branding
    const school = await prisma.schoolSetting.findFirst({
      select: {
        schoolName: true,
        schoolCode: true,
        phone: true,
        email: true,
        address: true,
        logoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
      school: school || {
        schoolName: 'The Hayatabad Model School',
        schoolCode: 'THMS',
        phone: '+92 91 5812345',
        email: 'info@hayatabadmodel.edu.pk',
        address: 'Sector F-4, Phase 6, Hayatabad, Peshawar',
      },
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
