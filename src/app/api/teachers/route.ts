import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { fullName: 'asc' },
      include: {
        managedSections: {
          include: { class: true },
        },
        subjects: {
          include: { class: true },
        },
        timetables: {
          include: { class: true, section: true, subject: true },
        },
      },
    });

    const teachersWithWorkload = teachers.map((t) => {
      const weeklyCount = t.timetables.length;
      const maxWeekly = t.maxWeeklyPeriods || 30;
      const maxDaily = t.maxDailyPeriods || 6;

      let qualifiedList: string[] = [];
      if (t.qualifiedSubjects) {
        try {
          qualifiedList = t.qualifiedSubjects.startsWith('[')
            ? JSON.parse(t.qualifiedSubjects)
            : t.qualifiedSubjects.split(',').map((s) => s.trim());
        } catch {
          qualifiedList = [t.qualifiedSubjects];
        }
      }

      return {
        ...t,
        workload: {
          weeklyPeriods: weeklyCount,
          maxWeekly,
          maxDaily,
          utilizationPct: Math.round((weeklyCount / maxWeekly) * 100),
          isOverloaded: weeklyCount >= maxWeekly,
        },
        parsedQualifications: qualifiedList,
      };
    });

    return NextResponse.json({ success: true, teachers: teachersWithWorkload });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      qualification,
      designation,
      department,
      qualifiedSubjects,
      workingDays,
      availableFrom,
      availableTo,
      maxDailyPeriods,
      maxWeeklyPeriods,
      preferredPeriods,
      unavailablePeriods,
      isClassTeacherEligible,
      classId,
      sectionId,
      subjectName,
      tempPassword,
    } = body;

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const teacherCount = await prisma.teacher.count();
    const employeeId = `THMS-T-${(teacherCount + 101).toString()}`;
    const passwordToUse = tempPassword || 'Teacher@123';
    const passwordHash = await hashPassword(passwordToUse);

    const teacherEmail = email || `${employeeId.toLowerCase()}@faculty.hayatabadmodel.edu.pk`;

    const qualSubjectsStr = Array.isArray(qualifiedSubjects)
      ? JSON.stringify(qualifiedSubjects)
      : typeof qualifiedSubjects === 'string'
      ? qualifiedSubjects
      : null;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Portal User Account
      const user = await tx.user.create({
        data: {
          username: employeeId,
          email: teacherEmail,
          passwordHash,
          role: 'TEACHER',
          isFirstLogin: true,
        },
      });

      // 2. Create Teacher Record with eligibility & availability configuration
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          fullName,
          phone: phone || '+92 300 0000000',
          email: teacherEmail,
          qualification: qualification || 'M.Sc. Education',
          designation: designation || 'Subject Teacher',
          department: department || 'General Academics',
          qualifiedSubjects: qualSubjectsStr,
          workingDays: workingDays || 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
          availableFrom: availableFrom || '08:00',
          availableTo: availableTo || '14:30',
          maxDailyPeriods: maxDailyPeriods ? parseInt(maxDailyPeriods, 10) : 6,
          maxWeeklyPeriods: maxWeeklyPeriods ? parseInt(maxWeeklyPeriods, 10) : 30,
          preferredPeriods: preferredPeriods ? JSON.stringify(preferredPeriods) : null,
          unavailablePeriods: unavailablePeriods ? JSON.stringify(unavailablePeriods) : null,
          isClassTeacherEligible: isClassTeacherEligible !== undefined ? !!isClassTeacherEligible : true,
          status: 'ACTIVE',
        },
      });

      // 3. Optional Subject assignment if explicitly requested
      if (classId && subjectName) {
        await tx.subject.create({
          data: {
            name: subjectName,
            code: `${subjectName.substring(0, 3).toUpperCase()}-08`,
            classId,
            teacherId: teacher.id,
          },
        });
      }

      // 4. Optional Section assignment if explicitly requested
      if (sectionId) {
        await tx.section.update({
          where: { id: sectionId },
          data: { classTeacherId: teacher.id },
        });
      }

      return {
        teacher,
        credentials: {
          fullName,
          employeeId,
          username: employeeId,
          temporaryPassword: passwordToUse,
        },
      };
    });

    await logAuditEvent({
      userName: 'Admin',
      role: 'ADMIN',
      action: 'TEACHER_CREATED',
      entity: 'Teacher',
      entityId: result.teacher.id,
      details: `Added new teacher ${fullName} (${result.teacher.employeeId})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher added and credentials generated successfully',
      teacher: result.teacher,
      credentials: result.credentials,
    });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add teacher' }, { status: 500 });
  }
}
