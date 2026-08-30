import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schoolCount = await prisma.schoolSetting.count();
    const adminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    const classCount = await prisma.class.count();
    const teacherCount = await prisma.teacher.count();
    const studentCount = await prisma.student.count();

    const isFirstTime = schoolCount === 0 || adminCount === 0 || classCount === 0;

    return NextResponse.json({
      success: true,
      isFirstTime,
      stats: {
        schools: schoolCount,
        admins: adminCount,
        classes: classCount,
        teachers: teacherCount,
        students: studentCount,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to check setup status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolInfo, adminInfo, academicStructure, firstTeacher } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. School Setting
      const school = await tx.schoolSetting.create({
        data: {
          schoolName: schoolInfo?.schoolName || 'The Hayatabad Model School',
          tagline: schoolInfo?.tagline || 'Excellence in Education, Character & Innovation',
          phone: schoolInfo?.phone || '+92 91 5812345',
          email: schoolInfo?.email || 'info@hayatabadmodel.edu.pk',
          website: schoolInfo?.website || 'https://hayatabadmodel.edu.pk',
          address: schoolInfo?.address || 'Sector F-4, Phase 6, Hayatabad, Peshawar, KPK',
          principalName: schoolInfo?.principalName || 'Prof. Dr. Muhammad Tariq Khan',
        },
      });

      // 2. Academic Session
      const session = await tx.academicSession.create({
        data: {
          name: academicStructure?.sessionName || 'Academic Session 2026-2027',
          code: '2026',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31'),
          isCurrent: true,
        },
      });

      // 3. Admin Account
      const adminPassword = adminInfo?.password || 'Admin@123';
      const passwordHash = await hashPassword(adminPassword);

      const adminUser = await tx.user.upsert({
        where: { username: adminInfo?.username || 'admin' },
        update: { passwordHash },
        create: {
          username: adminInfo?.username || 'admin',
          email: adminInfo?.email || 'admin@hayatabadmodel.edu.pk',
          passwordHash,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          isFirstLogin: false,
        },
      });

      // 4. Classes, Sections & Subjects
      const classesList = academicStructure?.classes || [
        { name: 'Nursery', code: 'C00', order: 0 },
        { name: 'Prep', code: 'CPR', order: 1 },
        { name: 'Class 1', code: 'C01', order: 2 },
        { name: 'Class 2', code: 'C02', order: 3 },
        { name: 'Class 3', code: 'C04', order: 4 },
        { name: 'Class 5', code: 'C05', order: 5 },
        { name: 'Class 8', code: 'C08', order: 6 },
        { name: 'Class 9', code: 'C09', order: 7 },
        { name: 'Class 10', code: 'C10', order: 8 },
      ];

      const createdClasses: any = {};
      const createdSections: any = {};

      for (const c of classesList) {
        const createdClass = await tx.class.create({
          data: {
            name: c.name,
            code: c.code,
            orderIndex: c.order,
          },
        });
        createdClasses[c.code] = createdClass;

        const secA = await tx.section.create({
          data: {
            name: 'Section A',
            classId: createdClass.id,
            roomNo: `Room ${100 + c.order * 2 + 1}`,
          },
        });
        createdSections[`${c.code}-A`] = secA;

        // Default Core Subjects for secondary classes
        if (c.code === 'C08' || c.code === 'C05') {
          await tx.subject.create({
            data: {
              name: 'Mathematics',
              code: `MATH-${c.code.replace('C', '')}`,
              classId: createdClass.id,
            },
          });
          await tx.subject.create({
            data: {
              name: 'English Language',
              code: `ENG-${c.code.replace('C', '')}`,
              classId: createdClass.id,
            },
          });
          await tx.subject.create({
            data: {
              name: 'General Science',
              code: `SCI-${c.code.replace('C', '')}`,
              classId: createdClass.id,
            },
          });
        }
      }

      // 5. First Teacher (Optional in wizard)
      let teacherObj: any = null;
      let teacherCredentials: any = null;

      if (firstTeacher && firstTeacher.fullName) {
        const empId = firstTeacher.employeeId || 'THMS-T-0001';
        const tempPassword = firstTeacher.tempPassword || 'Teacher@123';
        const teacherPasswordHash = await hashPassword(tempPassword);

        const teacherUser = await tx.user.create({
          data: {
            username: empId,
            email: firstTeacher.email || `${empId.toLowerCase()}@faculty.hayatabadmodel.edu.pk`,
            passwordHash: teacherPasswordHash,
            role: 'TEACHER',
            isFirstLogin: true,
          },
        });

        teacherObj = await tx.teacher.create({
          data: {
            userId: teacherUser.id,
            employeeId: empId,
            fullName: firstTeacher.fullName,
            phone: firstTeacher.phone || '+92 333 1234567',
            email: firstTeacher.email || 'teacher@hayatabadmodel.edu.pk',
            qualification: firstTeacher.qualification || 'M.Sc. Education',
            designation: firstTeacher.designation || 'Subject Teacher',
          },
        });

        teacherCredentials = {
          fullName: firstTeacher.fullName,
          employeeId: empId,
          username: empId,
          temporaryPassword: tempPassword,
        };
      }

      return {
        school,
        session,
        adminUser,
        teacherCredentials,
      };
    });

    await logAuditEvent({
      userName: body.adminInfo?.username || 'Super Admin',
      role: 'SUPER_ADMIN',
      action: 'INITIAL_SCHOOL_SETUP_COMPLETED',
      entity: 'SchoolSetting',
      details: 'Completed Guided First-Time School Setup Wizard',
    });

    return NextResponse.json({
      success: true,
      message: 'School setup completed successfully',
      result,
    });
  } catch (error: any) {
    console.error('Setup wizard error:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete setup' }, { status: 500 });
  }
}
