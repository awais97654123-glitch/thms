import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        students: [],
        teachers: [],
        admissions: [],
        fees: [],
        classes: [],
      });
    }

    const [students, teachers, admissions, fees, classes] = await Promise.all([
      // 1. Students search
      prisma.student.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { studentId: { contains: q, mode: 'insensitive' } },
            { rollNo: { contains: q, mode: 'insensitive' } },
            { admissionNo: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: { class: true, section: true },
      }),

      // 2. Teachers search
      prisma.teacher.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { employeeId: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),

      // 3. Admissions search
      prisma.admissionApplication.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { applicationNo: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
      }),

      // 4. Fee Invoices search
      prisma.feeInvoice.findMany({
        where: {
          invoiceNo: { contains: q, mode: 'insensitive' },
        },
        take: 4,
        include: { student: true },
      }),

      // 5. Classes search
      prisma.class.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
        },
        take: 3,
        include: { sections: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        students: students.map((s) => ({
          id: s.id,
          title: s.fullName,
          subtitle: `${s.studentId} • ${s.class?.name || 'Class'} (${s.section?.name || 'A'})`,
          badge: s.status,
          url: `/admin/students/${s.id}`,
          type: 'STUDENT',
        })),
        teachers: teachers.map((t) => ({
          id: t.id,
          title: t.fullName,
          subtitle: `${t.employeeId} • ${t.designation || 'Faculty'}`,
          badge: t.department || 'Academics',
          url: `/admin/teachers`,
          type: 'TEACHER',
        })),
        admissions: admissions.map((a) => ({
          id: a.id,
          title: a.fullName,
          subtitle: `Application ${a.applicationNo}`,
          badge: a.status,
          url: `/admin/admissions`,
          type: 'ADMISSION',
        })),
        fees: fees.map((f: any) => ({
          id: f.id,
          title: `Invoice ${f.invoiceNo}`,
          subtitle: `${f.student?.fullName || 'Student'} • Rs. ${f.totalAmount}`,
          badge: f.status,
          url: `/admin/fees`,
          type: 'FEE',
        })),
        classes: classes.map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: `${c.sections.length} Section(s)`,
          badge: 'CLASS',
          url: `/admin/academics/timetable?classId=${c.id}`,
          type: 'CLASS',
        })),
      },
    });
  } catch (error: any) {
    console.error('Global search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}
