import prisma from '@/lib/db';

export const SCHOOL_TIMEZONE = 'Asia/Karachi';

export type PeriodStatusType =
  | 'UPCOMING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'FREE_PERIOD'
  | 'CANCELLED'
  | 'SUBSTITUTE'
  | 'SCHOOL_CLOSED';

export interface SchoolTimeInfo {
  dateString: string; // YYYY-MM-DD
  timeString: string; // HH:MM (24-hr)
  dayOfWeek: string;  // MONDAY, TUESDAY, etc.
  totalMinutes: number;
  now: Date;
}

/**
 * Returns current server date and time mapped to Asia/Karachi timezone
 */
export function getSchoolCurrentTime(date: Date = new Date()): SchoolTimeInfo {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHOOL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'long',
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = getPart('hour');
  let minute = getPart('minute');

  if (hour === '24') hour = '00';

  const weekday = getPart('weekday').toUpperCase();
  const dateString = `${year}-${month}-${day}`;
  const timeString = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  const totalMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10);

  return {
    dateString,
    timeString,
    dayOfWeek: weekday,
    totalMinutes,
    now: date,
  };
}

/**
 * Converts a time string (e.g. "08:30", "8:30 AM", "02:15 PM") to minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  const cleanNum = clean.replace(/AM|PM/g, '').trim();
  const [hStr, mStr] = cleanNum.split(':');
  let hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr || '0', 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Evaluates live status for a single timetable period item
 */
export function evaluatePeriodStatus({
  startTime,
  endTime,
  currentMinutes,
  cancellation,
  substitute,
  activeClosure,
}: {
  startTime: string;
  endTime: string;
  currentMinutes: number;
  cancellation?: {
    id: string;
    reason: string;
    cancelledAt: Date;
    cancelledBy?: { fullName?: string; role?: string };
  } | null;
  substitute?: {
    id: string;
    substituteTeacher: { fullName: string; employeeId: string };
    reason?: string | null;
  } | null;
  activeClosure?: {
    title: string;
    reason: string;
    isEmergency: boolean;
  } | null;
}): {
  status: PeriodStatusType;
  label: string;
  badgeClass: string;
  minutesRemaining?: number;
  minutesUntilStart?: number;
  cancellationReason?: string;
  substituteTeacherName?: string;
} {
  // 1. School Closure check
  if (activeClosure) {
    return {
      status: 'SCHOOL_CLOSED',
      label: activeClosure.isEmergency ? 'Emergency Closed' : 'School Closed',
      badgeClass: 'bg-red-500/15 text-red-500 border-red-500/30',
      cancellationReason: `${activeClosure.title} - ${activeClosure.reason}`,
    };
  }

  // 2. Class Cancellation check
  if (cancellation) {
    return {
      status: 'CANCELLED',
      label: 'Class Cancelled',
      badgeClass: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
      cancellationReason: cancellation.reason,
    };
  }

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  // 3. Substitute Teacher check
  if (substitute) {
    if (currentMinutes < startMin) {
      return {
        status: 'SUBSTITUTE',
        label: `Substitute (${substitute.substituteTeacher.fullName})`,
        badgeClass: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
        minutesUntilStart: startMin - currentMinutes,
        substituteTeacherName: substitute.substituteTeacher.fullName,
      };
    } else if (currentMinutes >= startMin && currentMinutes <= endMin) {
      return {
        status: 'ACTIVE',
        label: `Active • Sub: ${substitute.substituteTeacher.fullName}`,
        badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 ring-2 ring-emerald-500/30 animate-pulse',
        minutesRemaining: endMin - currentMinutes,
        substituteTeacherName: substitute.substituteTeacher.fullName,
      };
    } else {
      return {
        status: 'COMPLETED',
        label: 'Completed (Substituted)',
        badgeClass: 'bg-slate-200 text-slate-500 border-slate-300',
        substituteTeacherName: substitute.substituteTeacher.fullName,
      };
    }
  }

  // 4. Normal Timeslot Progression
  if (currentMinutes < startMin) {
    return {
      status: 'UPCOMING',
      label: 'Upcoming',
      badgeClass: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
      minutesUntilStart: startMin - currentMinutes,
    };
  } else if (currentMinutes >= startMin && currentMinutes <= endMin) {
    return {
      status: 'ACTIVE',
      label: 'In Progress',
      badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 ring-2 ring-emerald-500/30 animate-pulse',
      minutesRemaining: endMin - currentMinutes,
    };
  } else {
    return {
      status: 'COMPLETED',
      label: 'Completed',
      badgeClass: 'bg-slate-200 text-slate-500 border-slate-300',
    };
  }
}

/**
 * Fetch today's active school closure if any
 */
export async function getActiveSchoolClosure(date: Date = new Date(), targetAudience = 'ALL') {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const closure = await prisma.schoolClosure.findFirst({
      where: {
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
        OR: [{ targetAudience: 'ALL' }, { targetAudience }],
        affectsTimetable: true,
      },
      orderBy: { isEmergency: 'desc' },
    });

    return closure;
  } catch {
    return null;
  }
}

/**
 * Get full live schedule for an enrolled student
 */
export async function getStudentLiveSchedule(studentId: string, customDate?: Date) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: true,
      section: true,
    },
  });

  if (!student) throw new Error('Student not found');

  const schoolTime = getSchoolCurrentTime(customDate);
  const targetDate = customDate || schoolTime.now;
  const targetDateStart = new Date(targetDate);
  targetDateStart.setHours(0, 0, 0, 0);
  const targetDateEnd = new Date(targetDate);
  targetDateEnd.setHours(23, 59, 59, 999);

  // Check school closure
  const activeClosure = await getActiveSchoolClosure(targetDate, 'STUDENTS');

  // Fetch timetable for student's class and section on this day of week
  const timetables = await prisma.timetable.findMany({
    where: {
      classId: student.classId,
      sectionId: student.sectionId,
      dayOfWeek: schoolTime.dayOfWeek,
    },
    include: {
      subject: true,
      teacher: true,
      cancellations: {
        where: {
          date: { gte: targetDateStart, lte: targetDateEnd },
          status: 'CANCELLED',
        },
      },
      substitutes: {
        where: {
          date: { gte: targetDateStart, lte: targetDateEnd },
          status: 'ACTIVE',
        },
        include: {
          substituteTeacher: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  // Evaluate each period
  let currentPeriod: any = null;
  let nextPeriod: any = null;

  const schedule = timetables.map((item) => {
    const cancellation = item.cancellations[0] || null;
    const substitute = item.substitutes[0] || null;

    const evaluation = evaluatePeriodStatus({
      startTime: item.startTime,
      endTime: item.endTime,
      currentMinutes: schoolTime.totalMinutes,
      cancellation,
      substitute,
      activeClosure,
    });

    const periodData = {
      id: item.id,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      roomNo: item.roomNo || 'Main Classroom',
      subjectName: item.subject.name,
      subjectCode: item.subject.code,
      teacherName: item.teacher.fullName,
      teacherPhoto: item.teacher.photoUrl,
      isSubstitute: !!substitute,
      substituteTeacherName: substitute?.substituteTeacher.fullName,
      isCancelled: !!cancellation,
      cancellationReason: cancellation?.reason,
      ...evaluation,
    };

    if (periodData.status === 'ACTIVE' && !currentPeriod) {
      currentPeriod = periodData;
    } else if (periodData.status === 'UPCOMING' && !nextPeriod && !currentPeriod) {
      nextPeriod = periodData;
    }

    return periodData;
  });

  return {
    student: {
      id: student.id,
      fullName: student.fullName,
      studentId: student.studentId,
      rollNo: student.rollNo,
      className: student.class.name,
      sectionName: student.section.name,
    },
    schoolTime,
    isSchoolClosed: !!activeClosure,
    closureInfo: activeClosure,
    schedule,
    currentPeriod: currentPeriod || (schedule.length > 0 && !schedule.some((p) => p.status === 'ACTIVE') ? null : null),
    nextPeriod,
  };
}

/**
 * Get full live schedule for a teacher
 */
export async function getTeacherLiveSchedule(teacherId: string, customDate?: Date) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) throw new Error('Teacher not found');

  const schoolTime = getSchoolCurrentTime(customDate);
  const targetDate = customDate || schoolTime.now;
  const targetDateStart = new Date(targetDate);
  targetDateStart.setHours(0, 0, 0, 0);
  const targetDateEnd = new Date(targetDate);
  targetDateEnd.setHours(23, 59, 59, 999);

  const activeClosure = await getActiveSchoolClosure(targetDate, 'TEACHERS');

  // Timetables where this teacher is primary OR assigned as substitute
  const [regularTimetables, substituteAssignments] = await Promise.all([
    prisma.timetable.findMany({
      where: {
        teacherId: teacher.id,
        dayOfWeek: schoolTime.dayOfWeek,
      },
      include: {
        class: true,
        section: true,
        subject: true,
        cancellations: {
          where: {
            date: { gte: targetDateStart, lte: targetDateEnd },
            status: 'CANCELLED',
          },
        },
        substitutes: {
          where: {
            date: { gte: targetDateStart, lte: targetDateEnd },
            status: 'ACTIVE',
          },
          include: {
            substituteTeacher: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.substituteAssignment.findMany({
      where: {
        substituteTeacherId: teacher.id,
        date: { gte: targetDateStart, lte: targetDateEnd },
        status: 'ACTIVE',
      },
      include: {
        timetable: {
          include: {
            class: true,
            section: true,
            subject: true,
            teacher: true,
            cancellations: {
              where: {
                date: { gte: targetDateStart, lte: targetDateEnd },
                status: 'CANCELLED',
              },
            },
          },
        },
      },
    }),
  ]);

  let currentPeriod: any = null;
  let nextPeriod: any = null;

  // Map regular
  const regularMapped = regularTimetables.map((item) => {
    const cancellation = item.cancellations[0] || null;
    const substitute = item.substitutes[0] || null;

    const evaluation = evaluatePeriodStatus({
      startTime: item.startTime,
      endTime: item.endTime,
      currentMinutes: schoolTime.totalMinutes,
      cancellation,
      substitute,
      activeClosure,
    });

    return {
      id: item.id,
      timetableId: item.id,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      roomNo: item.roomNo || 'Classroom',
      className: item.class.name,
      sectionName: item.section.name,
      subjectName: item.subject.name,
      subjectCode: item.subject.code,
      isSubstituteRole: false,
      substituteTeacherAssigned: substitute ? substitute.substituteTeacher.fullName : null,
      isCancelled: !!cancellation,
      cancellationReason: cancellation?.reason,
      cancellationId: cancellation?.id,
      ...evaluation,
    };
  });

  // Map substituted periods where this teacher is covering
  const substitutedMapped = substituteAssignments.map((sub) => {
    const item = sub.timetable;
    const cancellation = item.cancellations[0] || null;

    const evaluation = evaluatePeriodStatus({
      startTime: item.startTime,
      endTime: item.endTime,
      currentMinutes: schoolTime.totalMinutes,
      cancellation,
      activeClosure,
    });

    return {
      id: item.id,
      timetableId: item.id,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      roomNo: item.roomNo || 'Classroom',
      className: item.class.name,
      sectionName: item.section.name,
      subjectName: item.subject.name,
      subjectCode: item.subject.code,
      isSubstituteRole: true,
      originalTeacherName: item.teacher.fullName,
      substituteReason: sub.reason,
      isCancelled: !!cancellation,
      cancellationReason: cancellation?.reason,
      ...evaluation,
      label: `Substitute Duty (${evaluation.label})`,
    };
  });

  // Combine and sort
  const combined = [...regularMapped, ...substitutedMapped].sort((a, b) =>
    parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  combined.forEach((period) => {
    if (period.status === 'ACTIVE' && !currentPeriod) {
      currentPeriod = period;
    } else if (period.status === 'UPCOMING' && !nextPeriod && !currentPeriod) {
      nextPeriod = period;
    }
  });

  return {
    teacher: {
      id: teacher.id,
      fullName: teacher.fullName,
      employeeId: teacher.employeeId,
      designation: teacher.designation,
    },
    schoolTime,
    isSchoolClosed: !!activeClosure,
    closureInfo: activeClosure,
    schedule: combined,
    currentPeriod,
    nextPeriod,
  };
}

/**
 * Get campus live overview across all classes for Admin Command Center
 */
export async function getCampusLiveOverview(customDate?: Date) {
  const schoolTime = getSchoolCurrentTime(customDate);
  const targetDate = customDate || schoolTime.now;
  const targetDateStart = new Date(targetDate);
  targetDateStart.setHours(0, 0, 0, 0);
  const targetDateEnd = new Date(targetDate);
  targetDateEnd.setHours(23, 59, 59, 999);

  const activeClosure = await getActiveSchoolClosure(targetDate);

  const [timetables, cancellations, substitutes] = await Promise.all([
    prisma.timetable.findMany({
      where: { dayOfWeek: schoolTime.dayOfWeek },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
      },
      orderBy: [{ class: { orderIndex: 'asc' } }, { startTime: 'asc' }],
    }),
    prisma.periodCancellation.findMany({
      where: {
        date: { gte: targetDateStart, lte: targetDateEnd },
        status: 'CANCELLED',
      },
      include: {
        timetable: {
          include: { class: true, section: true, subject: true, teacher: true },
        },
        cancelledBy: true,
      },
    }),
    prisma.substituteAssignment.findMany({
      where: {
        date: { gte: targetDateStart, lte: targetDateEnd },
        status: 'ACTIVE',
      },
      include: {
        timetable: {
          include: { class: true, section: true, subject: true },
        },
        originalTeacher: true,
        substituteTeacher: true,
      },
    }),
  ]);

  const cancellationMap = new Map<string, any>();
  cancellations.forEach((c) => cancellationMap.set(c.timetableId, c));

  const substituteMap = new Map<string, any>();
  substitutes.forEach((s) => substituteMap.set(s.timetableId, s));

  let activePeriodsCount = 0;
  let upcomingPeriodsCount = 0;
  let completedPeriodsCount = 0;

  const evaluated = timetables.map((item) => {
    const cancellation = cancellationMap.get(item.id);
    const substitute = substituteMap.get(item.id);

    const evaluation = evaluatePeriodStatus({
      startTime: item.startTime,
      endTime: item.endTime,
      currentMinutes: schoolTime.totalMinutes,
      cancellation,
      substitute,
      activeClosure,
    });

    if (evaluation.status === 'ACTIVE') activePeriodsCount++;
    if (evaluation.status === 'UPCOMING') upcomingPeriodsCount++;
    if (evaluation.status === 'COMPLETED') completedPeriodsCount++;

    return {
      id: item.id,
      className: item.class.name,
      sectionName: item.section.name,
      subjectName: item.subject.name,
      teacherName: item.teacher.fullName,
      substituteTeacherName: substitute?.substituteTeacher.fullName,
      startTime: item.startTime,
      endTime: item.endTime,
      roomNo: item.roomNo,
      ...evaluation,
    };
  });

  return {
    schoolTime,
    isSchoolClosed: !!activeClosure,
    closureInfo: activeClosure,
    metrics: {
      totalScheduledToday: timetables.length,
      activePeriodsCount,
      upcomingPeriodsCount,
      completedPeriodsCount,
      cancellationsCount: cancellations.length,
      substitutesCount: substitutes.length,
    },
    cancellations: cancellations.map((c) => ({
      id: c.id,
      className: c.timetable.class.name,
      sectionName: c.timetable.section.name,
      subjectName: c.timetable.subject.name,
      teacherName: c.timetable.teacher.fullName,
      startTime: c.timetable.startTime,
      endTime: c.timetable.endTime,
      reason: c.reason,
      cancelledBy: c.cancelledBy.username,
      cancelledAt: c.cancelledAt,
    })),
    substitutes: substitutes.map((s) => ({
      id: s.id,
      className: s.timetable.class.name,
      sectionName: s.timetable.section.name,
      subjectName: s.timetable.subject.name,
      originalTeacher: s.originalTeacher.fullName,
      substituteTeacher: s.substituteTeacher.fullName,
      startTime: s.timetable.startTime,
      endTime: s.timetable.endTime,
      reason: s.reason,
    })),
    activeRightNow: evaluated.filter((p) => p.status === 'ACTIVE'),
    allPeriods: evaluated,
  };
}
