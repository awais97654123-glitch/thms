import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET /api/teachers/[id]/assignments - Fetch all assignments for a specific teacher
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            class: true,
            section: true,
            subject: true,
            academicSession: true,
          },
          orderBy: [
            { class: { orderIndex: 'asc' } },
            { section: { name: 'asc' } },
            { subject: { name: 'asc' } },
          ],
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        employeeId: teacher.employeeId,
      },
      assignments: teacher.assignments,
    });
  } catch (error: any) {
    console.error('Fetch teacher assignments error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch assignments' }, { status: 500 });
  }
}

// POST /api/teachers/[id]/assignments - Create new Class -> Section -> Subject assignment
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: teacherId } = params;
    const body = await req.json();
    const { classId, sectionId, subjectId, academicSessionId } = body;

    if (!classId || !sectionId || !subjectId) {
      return NextResponse.json(
        { error: 'Class, Section, and Subject are all required' },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Verify class, section, subject exist and belong together
    const section = await prisma.section.findFirst({
      where: { id: sectionId, classId },
      include: { class: true },
    });
    if (!section) {
      return NextResponse.json({ error: 'Selected section does not belong to the selected class' }, { status: 400 });
    }

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, classId },
    });
    if (!subject) {
      return NextResponse.json({ error: 'Selected subject does not belong to the selected class' }, { status: 400 });
    }

    // Check for existing active session if not provided
    let sessionId = academicSessionId;
    if (!sessionId) {
      const activeSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
      });
      sessionId = activeSession?.id || null;
    }

    // Check for duplicate assignment
    const existing = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_classId_sectionId_subjectId: {
          teacherId,
          classId,
          sectionId,
          subjectId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This teacher is already assigned to this Class, Section, and Subject' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await prisma.teacherAssignment.create({
      data: {
        teacherId,
        classId,
        sectionId,
        subjectId,
        academicSessionId: sessionId,
      },
      include: {
        class: true,
        section: true,
        subject: true,
      },
    });

    await logAuditEvent({
      userName: 'Admin',
      role: 'ADMIN',
      action: 'TEACHER_ASSIGNMENT_CREATED',
      entity: 'TeacherAssignment',
      entityId: assignment.id,
      details: `Assigned ${teacher.fullName} to ${assignment.class.name} - ${assignment.section.name} (${assignment.subject.name})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Teaching assignment created successfully',
      assignment,
    });
  } catch (error: any) {
    console.error('Create teacher assignment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create assignment' }, { status: 500 });
  }
}

// DELETE /api/teachers/[id]/assignments - Remove an assignment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const assignment = await prisma.teacherAssignment.findUnique({
      where: { id: assignmentId },
      include: { class: true, section: true, subject: true, teacher: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    await prisma.teacherAssignment.delete({
      where: { id: assignmentId },
    });

    await logAuditEvent({
      userName: 'Admin',
      role: 'ADMIN',
      action: 'TEACHER_ASSIGNMENT_DELETED',
      entity: 'TeacherAssignment',
      entityId: assignmentId,
      details: `Removed assignment for ${assignment.teacher.fullName} from ${assignment.class.name} - ${assignment.section.name}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Teaching assignment removed successfully',
    });
  } catch (error: any) {
    console.error('Delete teacher assignment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove assignment' }, { status: 500 });
  }
}
