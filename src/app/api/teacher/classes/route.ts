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

    // Find teacher record for this user or query param if admin
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
        include: {
          assignments: {
            include: {
              class: true,
              section: true,
              subject: true,
            },
          },
          managedSections: {
            include: {
              class: true,
            },
          },
          subjects: {
            include: {
              class: true,
            },
          },
        },
      });
    } else if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      const { searchParams } = new URL(req.url);
      const teacherId = searchParams.get('teacherId');
      if (teacherId) {
        teacher = await prisma.teacher.findUnique({
          where: { id: teacherId },
          include: {
            assignments: {
              include: {
                class: true,
                section: true,
                subject: true,
              },
            },
            managedSections: {
              include: {
                class: true,
              },
            },
            subjects: {
              include: {
                class: true,
              },
            },
          },
        });
      } else {
        // Return first teacher or all classes for admin overview
        teacher = await prisma.teacher.findFirst({
          include: {
            assignments: {
              include: {
                class: true,
                section: true,
                subject: true,
              },
            },
            managedSections: {
              include: {
                class: true,
              },
            },
            subjects: {
              include: {
                class: true,
              },
            },
          },
        });
      }
    }

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Build structured assigned classes array
    // Map assignments: Class -> Sections -> Subjects
    const classMap: Record<string, {
      id: string;
      name: string;
      code: string;
      sections: {
        id: string;
        name: string;
        subjects: {
          id: string;
          name: string;
          code: string;
        }[];
      }[];
    }> = {};

    // 1. Process explicit TeacherAssignments
    if (teacher.assignments && teacher.assignments.length > 0) {
      for (const assign of teacher.assignments) {
        if (!classMap[assign.classId]) {
          classMap[assign.classId] = {
            id: assign.class.id,
            name: assign.class.name,
            code: assign.class.code,
            sections: [],
          };
        }

        let sectionObj = classMap[assign.classId].sections.find(s => s.id === assign.sectionId);
        if (!sectionObj) {
          sectionObj = {
            id: assign.section.id,
            name: assign.section.name,
            subjects: [],
          };
          classMap[assign.classId].sections.push(sectionObj);
        }

        if (!sectionObj.subjects.some(sub => sub.id === assign.subjectId)) {
          sectionObj.subjects.push({
            id: assign.subject.id,
            name: assign.subject.name,
            code: assign.subject.code,
          });
        }
      }
    }

    // 2. Process legacy subjects or managedSections if assignments is empty
    if (Object.keys(classMap).length === 0) {
      // Find classes with sections
      for (const subject of teacher.subjects) {
        if (!classMap[subject.classId]) {
          const cls = await prisma.class.findUnique({
            where: { id: subject.classId },
            include: { sections: true },
          });
          if (cls) {
            classMap[subject.classId] = {
              id: cls.id,
              name: cls.name,
              code: cls.code,
              sections: cls.sections.map(sec => ({
                id: sec.id,
                name: sec.name,
                subjects: [{
                  id: subject.id,
                  name: subject.name,
                  code: subject.code,
                }],
              })),
            };
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
        qualification: teacher.qualification,
        email: teacher.email,
        phone: teacher.phone,
      },
      assignedClasses,
      rawAssignments: teacher.assignments,
    });
  } catch (error: any) {
    console.error('Fetch teacher classes error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch assigned classes' }, { status: 500 });
  }
}
