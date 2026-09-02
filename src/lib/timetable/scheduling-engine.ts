import prisma from '@/lib/db';
import { parseTimeToMinutes } from './period-engine';
import { logAuditEvent } from '@/lib/audit';

export interface TimetableSlotInput {
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string; // e.g. "MONDAY"
  startTime: string; // "08:30"
  endTime: string; // "09:15"
  roomNo?: string;
  version?: string;
  effectiveFrom?: Date | string;
  allowOverride?: boolean;
  excludeTimetableId?: string; // For updates
}

export interface SchedulingValidationResult {
  valid: boolean;
  conflicts: string[];
  warnings: string[];
  alternatives?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    teacherName: string;
    roomNo?: string;
  }[];
}

/**
 * Checks whether two time intervals overlap.
 */
export function isTimeOverlapping(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Validates a proposed timetable entry against all authoritative scheduling rules.
 */
export async function validateTimetableAssignment(
  input: TimetableSlotInput
): Promise<SchedulingValidationResult> {
  const conflicts: string[] = [];
  const warnings: string[] = [];

  const startMin = parseTimeToMinutes(input.startTime);
  const endMin = parseTimeToMinutes(input.endTime);

  if (endMin <= startMin) {
    conflicts.push(`Invalid Time Interval: End time (${input.endTime}) must be after start time (${input.startTime}).`);
    return { valid: false, conflicts, warnings };
  }

  // 1. Fetch Teacher with qualifications and user details
  const teacher = await prisma.teacher.findUnique({
    where: { id: input.teacherId },
    include: {
      user: {
        include: {
          leaves: {
            where: { status: 'APPROVED' },
          },
        },
      },
    },
  });

  if (!teacher) {
    conflicts.push('Teacher not found in database.');
    return { valid: false, conflicts, warnings };
  }

  // 2. Fetch Subject, Class, Section details
  const [subject, cls, section] = await Promise.all([
    prisma.subject.findUnique({ where: { id: input.subjectId } }),
    prisma.class.findUnique({ where: { id: input.classId } }),
    prisma.section.findUnique({ where: { id: input.sectionId } }),
  ]);

  if (!subject || !cls || !section) {
    conflicts.push('Class, section, or subject record does not exist.');
    return { valid: false, conflicts, warnings };
  }

  // 3. Subject Qualification Check
  if (teacher.qualifiedSubjects) {
    try {
      let qualifiedList: string[] = [];
      if (teacher.qualifiedSubjects.startsWith('[')) {
        qualifiedList = JSON.parse(teacher.qualifiedSubjects);
      } else {
        qualifiedList = teacher.qualifiedSubjects.split(',').map((s) => s.trim());
      }

      const isQualified = qualifiedList.some(
        (q) =>
          q.toLowerCase() === subject.name.toLowerCase() ||
          q.toLowerCase() === (subject.code || '').toLowerCase()
      );

      if (!isQualified) {
        const msg = `Subject Qualification Conflict: ${teacher.fullName} is registered for [${qualifiedList.join(
          ', '
        )}], but not qualified for "${subject.name}".`;
        if (input.allowOverride) {
          warnings.push(`${msg} (Admin Override Granted)`);
        } else {
          conflicts.push(msg);
        }
      }
    } catch {
      // Ignore JSON parse error and proceed
    }
  }

  // 4. Teacher Working Days Check
  if (teacher.workingDays) {
    const days = teacher.workingDays.split(',').map((d) => d.trim().toUpperCase());
    if (!days.includes(input.dayOfWeek.toUpperCase())) {
      conflicts.push(
        `Working Day Conflict: ${teacher.fullName} does not work on ${input.dayOfWeek}. Configured days: [${days.join(', ')}].`
      );
    }
  }

  // 5. Teacher Working Hours Availability Check
  if (teacher.availableFrom && teacher.availableTo) {
    const availStart = parseTimeToMinutes(teacher.availableFrom);
    const availEnd = parseTimeToMinutes(teacher.availableTo);

    if (startMin < availStart || endMin > availEnd) {
      conflicts.push(
        `Working Hours Conflict: ${teacher.fullName} is available from ${teacher.availableFrom} to ${teacher.availableTo}. Requested period is ${input.startTime} - ${input.endTime}.`
      );
    }
  }

  // 6. Teacher Hard Double Booking Check (overlapping time on same day)
  const teacherExisting = await prisma.timetable.findMany({
    where: {
      teacherId: input.teacherId,
      dayOfWeek: input.dayOfWeek,
      id: input.excludeTimetableId ? { not: input.excludeTimetableId } : undefined,
    },
    include: { class: true, section: true, subject: true },
  });

  for (const existing of teacherExisting) {
    const exStart = parseTimeToMinutes(existing.startTime);
    const exEnd = parseTimeToMinutes(existing.endTime);

    if (isTimeOverlapping(startMin, endMin, exStart, exEnd)) {
      conflicts.push(
        `Teacher Double-Booking Conflict: ${teacher.fullName} is already assigned to ${existing.class.name} (${existing.section.name}) for ${existing.subject.name} on ${input.dayOfWeek} from ${existing.startTime} to ${existing.endTime}.`
      );
    }
  }

  // 7. Class Section Hard Double Booking Check (cannot have two classes at same time)
  const sectionExisting = await prisma.timetable.findMany({
    where: {
      classId: input.classId,
      sectionId: input.sectionId,
      dayOfWeek: input.dayOfWeek,
      id: input.excludeTimetableId ? { not: input.excludeTimetableId } : undefined,
    },
    include: { subject: true, teacher: true },
  });

  for (const existing of sectionExisting) {
    const exStart = parseTimeToMinutes(existing.startTime);
    const exEnd = parseTimeToMinutes(existing.endTime);

    if (isTimeOverlapping(startMin, endMin, exStart, exEnd)) {
      conflicts.push(
        `Class Section Conflict: ${cls.name} (${section.name}) already has a period for "${existing.subject.name}" with ${existing.teacher.fullName} from ${existing.startTime} to ${existing.endTime}.`
      );
    }
  }

  // 8. Room Double Booking Check (if room is assigned)
  if (input.roomNo && input.roomNo.trim() !== '') {
    const roomExisting = await prisma.timetable.findMany({
      where: {
        roomNo: input.roomNo.trim(),
        dayOfWeek: input.dayOfWeek,
        id: input.excludeTimetableId ? { not: input.excludeTimetableId } : undefined,
      },
      include: { class: true, section: true, subject: true },
    });

    for (const existing of roomExisting) {
      const exStart = parseTimeToMinutes(existing.startTime);
      const exEnd = parseTimeToMinutes(existing.endTime);

      if (isTimeOverlapping(startMin, endMin, exStart, exEnd)) {
        conflicts.push(
          `Room Occupancy Conflict: Room ${input.roomNo} is already booked by ${existing.class.name} (${existing.section.name}) for ${existing.subject.name} from ${existing.startTime} to ${existing.endTime}.`
        );
      }
    }
  }

  // 9. Workload Cap: Max Daily Periods
  const maxDaily = teacher.maxDailyPeriods || 6;
  if (teacherExisting.length >= maxDaily) {
    const msg = `Daily Workload Limit: ${teacher.fullName} already has ${teacherExisting.length} periods scheduled on ${input.dayOfWeek} (Max allowed: ${maxDaily}).`;
    if (input.allowOverride) {
      warnings.push(`${msg} (Admin Override Confirmed)`);
    } else {
      conflicts.push(msg);
    }
  }

  // 10. Workload Cap: Max Weekly Periods
  const maxWeekly = teacher.maxWeeklyPeriods || 30;
  const totalWeekly = await prisma.timetable.count({
    where: {
      teacherId: input.teacherId,
      id: input.excludeTimetableId ? { not: input.excludeTimetableId } : undefined,
    },
  });

  if (totalWeekly >= maxWeekly) {
    const msg = `Weekly Workload Limit: ${teacher.fullName} already has ${totalWeekly} weekly periods scheduled (Max allowed: ${maxWeekly}).`;
    if (input.allowOverride) {
      warnings.push(`${msg} (Admin Override Confirmed)`);
    } else {
      conflicts.push(msg);
    }
  }

  // 11. Teacher Approved Leave Check
  if (teacher.user?.leaves && teacher.user.leaves.length > 0) {
    const targetDate = input.effectiveFrom ? new Date(input.effectiveFrom) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    for (const leave of teacher.user.leaves) {
      const start = new Date(leave.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(leave.endDate);
      end.setHours(23, 59, 59, 999);

      if (targetDate >= start && targetDate <= end) {
        warnings.push(
          `Faculty Leave Notice: ${teacher.fullName} has approved ${leave.leaveType} leave on ${targetDate.toISOString().split('T')[0]}. A substitute teacher will be required.`
        );
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
    warnings,
  };
}

/**
 * Intelligent Automatic Scheduling Assistant:
 * Scans eligible teachers, available timetable periods, and rooms to propose
 * conflict-free slots.
 */
export async function suggestOptimalSlots(params: {
  classId: string;
  sectionId: string;
  subjectId: string;
  requiredWeeklyPeriods?: number;
  preferredTeacherId?: string;
  roomNo?: string;
}) {
  const { classId, sectionId, subjectId, requiredWeeklyPeriods = 5, roomNo } = params;

  const [cls, section, subject] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.section.findUnique({ where: { id: sectionId } }),
    prisma.subject.findUnique({ where: { id: subjectId } }),
  ]);

  if (!cls || !section || !subject) {
    throw new Error('Class, Section, or Subject not found');
  }

  // 1. Find all teachers qualified for this subject
  const allTeachers = await prisma.teacher.findMany({
    where: { status: 'ACTIVE' },
    include: {
      timetables: true,
      subjects: true,
    },
  });

  const qualifiedTeachers = allTeachers.filter((t) => {
    if (params.preferredTeacherId && t.id === params.preferredTeacherId) return true;
    if (t.qualifiedSubjects) {
      try {
        const list: string[] = t.qualifiedSubjects.startsWith('[')
          ? JSON.parse(t.qualifiedSubjects)
          : t.qualifiedSubjects.split(',').map((s) => s.trim());
        return list.some(
          (q) =>
            q.toLowerCase() === subject.name.toLowerCase() ||
            q.toLowerCase() === (subject.code || '').toLowerCase()
        );
      } catch {
        return false;
      }
    }
    // Fallback: Check if teacher teaches this subject currently
    return t.subjects.some((s) => s.name.toLowerCase() === subject.name.toLowerCase());
  });

  const candidateTeachers = qualifiedTeachers.length > 0 ? qualifiedTeachers : allTeachers.slice(0, 3);

  // Standard timetable period blocks
  const standardPeriods = [
    { startTime: '08:00', endTime: '08:40', label: 'Period 1' },
    { startTime: '08:40', endTime: '09:20', label: 'Period 2' },
    { startTime: '09:20', endTime: '10:00', label: 'Period 3' },
    { startTime: '10:20', endTime: '11:00', label: 'Period 4' },
    { startTime: '11:00', endTime: '11:40', label: 'Period 5' },
    { startTime: '11:40', endTime: '12:20', label: 'Period 6' },
    { startTime: '12:20', endTime: '13:00', label: 'Period 7' },
  ];

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const suggestions: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    periodLabel: string;
    teacherId: string;
    teacherName: string;
    roomNo: string;
    workloadScore: number;
  }[] = [];

  for (const day of days) {
    for (const period of standardPeriods) {
      for (const t of candidateTeachers) {
        const res = await validateTimetableAssignment({
          classId,
          sectionId,
          subjectId,
          teacherId: t.id,
          dayOfWeek: day,
          startTime: period.startTime,
          endTime: period.endTime,
          roomNo: roomNo || section.roomNo || 'Room 101',
        });

        if (res.valid) {
          const currentLoad = t.timetables.length;
          suggestions.push({
            dayOfWeek: day,
            startTime: period.startTime,
            endTime: period.endTime,
            periodLabel: period.label,
            teacherId: t.id,
            teacherName: t.fullName,
            roomNo: roomNo || section.roomNo || 'Room 101',
            workloadScore: currentLoad,
          });
          break; // Move to next period once a valid teacher is found for this slot
        }
      }

      if (suggestions.length >= requiredWeeklyPeriods) break;
    }
    if (suggestions.length >= requiredWeeklyPeriods) break;
  }

  return {
    subjectName: subject.name,
    className: `${cls.name} (${section.name})`,
    requiredWeeklyPeriods,
    suggestionsCount: suggestions.length,
    suggestions,
  };
}

/**
 * Calculates teacher workload metrics.
 */
export async function getTeacherWorkload(teacherId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      timetables: {
        include: { class: true, section: true, subject: true },
      },
    },
  });

  if (!teacher) return null;

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dailyCounts: Record<string, number> = {};
  days.forEach((d) => (dailyCounts[d] = 0));

  teacher.timetables.forEach((tt) => {
    const day = tt.dayOfWeek.toUpperCase();
    if (dailyCounts[day] !== undefined) {
      dailyCounts[day]++;
    }
  });

  const weeklyCount = teacher.timetables.length;
  const maxDaily = teacher.maxDailyPeriods || 6;
  const maxWeekly = teacher.maxWeeklyPeriods || 30;

  return {
    teacherId: teacher.id,
    fullName: teacher.fullName,
    department: teacher.department,
    designation: teacher.designation,
    dailyCounts,
    weeklyCount,
    maxDaily,
    maxWeekly,
    isOverloaded: weeklyCount >= maxWeekly,
    utilizationPct: Math.round((weeklyCount / maxWeekly) * 100),
  };
}

/**
 * Transactional Timetable Assignment with conflict enforcement and audit logging.
 */
export async function assignTimetableTransactional(
  input: TimetableSlotInput,
  authorizingUserId?: string
) {
  // 1. Strict conflict check
  const validation = await validateTimetableAssignment(input);
  if (!validation.valid) {
    throw new Error(validation.conflicts.join(' | '));
  }

  // 2. Transactional persistence
  return await prisma.$transaction(async (tx) => {
    let record;
    if (input.excludeTimetableId) {
      record = await tx.timetable.update({
        where: { id: input.excludeTimetableId },
        data: {
          classId: input.classId,
          sectionId: input.sectionId,
          subjectId: input.subjectId,
          teacherId: input.teacherId,
          dayOfWeek: input.dayOfWeek.toUpperCase(),
          startTime: input.startTime,
          endTime: input.endTime,
          roomNo: input.roomNo || null,
          version: input.version || '1.0',
          effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
          publishedById: authorizingUserId,
          publishedAt: new Date(),
        },
        include: {
          class: true,
          section: true,
          subject: true,
          teacher: true,
        },
      });
    } else {
      record = await tx.timetable.create({
        data: {
          classId: input.classId,
          sectionId: input.sectionId,
          subjectId: input.subjectId,
          teacherId: input.teacherId,
          dayOfWeek: input.dayOfWeek.toUpperCase(),
          startTime: input.startTime,
          endTime: input.endTime,
          roomNo: input.roomNo || null,
          version: input.version || '1.0',
          effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
          publishedById: authorizingUserId,
          publishedAt: new Date(),
        },
        include: {
          class: true,
          section: true,
          subject: true,
          teacher: true,
        },
      });
    }

    // 3. Audit logging
    if (authorizingUserId) {
      await logAuditEvent({
        userId: authorizingUserId,
        action: input.excludeTimetableId ? 'TIMETABLE_PERIOD_UPDATED' : 'TIMETABLE_PERIOD_CREATED',
        entity: 'Timetable',
        entityId: record.id,
        details: JSON.stringify({
          class: record.class.name,
          section: record.section.name,
          subject: record.subject.name,
          teacher: record.teacher.fullName,
          dayOfWeek: record.dayOfWeek,
          time: `${record.startTime} - ${record.endTime}`,
          warnings: validation.warnings,
        }),
      });
    }

    return {
      success: true,
      timetable: record,
      warnings: validation.warnings,
    };
  }, { maxWait: 15000, timeout: 30000 });
}
