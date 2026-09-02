import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let teacher = null;
    if (session.role === 'TEACHER') {
      teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
      });
    } else if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      const { searchParams } = new URL(req.url);
      const teacherId = searchParams.get('teacherId');
      if (teacherId) {
        teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
      } else {
        teacher = await prisma.teacher.findFirst();
      }
    }

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Authoritative source of truth:
    // 1. Central Timetable slots assigned to this teacher
    // 2. Official TeacherAssignment records
    const [timetableSlots, teacherAssignments] = await Promise.all([
      prisma.timetable.findMany({
        where: {
          teacherId: teacher.id,
          status: 'PUBLISHED',
        },
        include: {
          class: true,
          section: true,
          subject: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
      prisma.teacherAssignment.findMany({
        where: { teacherId: teacher.id },
        include: {
          class: true,
          section: true,
          subject: true,
        },
      }),
    ]);

    // Build structured Map: Class -> Sections -> Subjects
    const classMap: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
        sections: {
          id: string;
          name: string;
          subjects: { id: string; name: string; code: string }[];
        }[];
      }
    > = {};

    const addAssignment = (
      cls: { id: string; name: string; code: string },
      sec: { id: string; name: string },
      sub: { id: string; name: string; code: string }
    ) => {
      if (!classMap[cls.id]) {
        classMap[cls.id] = {
          id: cls.id,
          name: cls.name,
          code: cls.code,
          sections: [],
        };
      }

      let sectionObj = classMap[cls.id].sections.find((s) => s.id === sec.id);
      if (!sectionObj) {
        sectionObj = {
          id: sec.id,
          name: sec.name,
          subjects: [],
        };
        classMap[cls.id].sections.push(sectionObj);
      }

      if (!sectionObj.subjects.some((s) => s.id === sub.id)) {
        sectionObj.subjects.push({
          id: sub.id,
          name: sub.name,
          code: sub.code,
        });
      }
    };

    // 1. Ingest from Timetable (source of truth)
    for (const slot of timetableSlots) {
      if (slot.class && slot.section && slot.subject) {
        addAssignment(slot.class, slot.section, slot.subject);
      }
    }

    // 2. Ingest from TeacherAssignment (source of truth)
    for (const assign of teacherAssignments) {
      if (assign.class && assign.section && assign.subject) {
        addAssignment(assign.class, assign.section, assign.subject);
      }
    }

    // Fallback: If no assignments exist yet, allow admin to see classes or return empty
    if (Object.keys(classMap).length === 0 && (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN')) {
      const allSampleClasses = await prisma.class.findMany({
        include: { sections: true, subjects: true },
        take: 3,
      });
      for (const cls of allSampleClasses) {
        for (const sec of cls.sections) {
          for (const sub of cls.subjects) {
            addAssignment(cls, sec, sub);
          }
        }
      }
    }

    const assignedClasses = Object.values(classMap);

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        employeeId: teacher.employeeId,
        designation: teacher.designation,
        department: teacher.department,
        qualification: teacher.qualification,
        email: teacher.email,
        phone: teacher.phone,
      },
      assignedClasses,
      totalClasses: assignedClasses.length,
      timetablePeriodsCount: timetableSlots.length,
    });
  } catch (error: any) {
    console.error('Fetch teacher classes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assigned classes' },
      { status: 500 }
    );
  }
}
