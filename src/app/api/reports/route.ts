import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'reports.view') && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'PRINCIPAL' && session.role !== 'ACCOUNTANT' && session.role !== 'HR_MANAGER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'STUDENTS';
    const classId = searchParams.get('classId');
    const sessionId = searchParams.get('sessionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const query = searchParams.get('q');

    let reportData: any = {};

    switch (type) {
      case 'STUDENTS': {
        const where: any = {};
        if (classId && classId !== 'ALL') where.classId = classId;
        if (sessionId && sessionId !== 'ALL') where.sessionId = sessionId;
        if (query) {
          where.OR = [
            { fullName: { contains: query, mode: 'insensitive' } },
            { studentId: { contains: query, mode: 'insensitive' } },
            { rollNo: { contains: query, mode: 'insensitive' } },
          ];
        }

        const students = await prisma.student.findMany({
          where,
          include: {
            class: true,
            section: true,
            parent: true,
            session: true,
          },
          orderBy: [{ classId: 'asc' }, { rollNo: 'asc' }],
        });

        reportData = {
          title: 'Official Enrolled Students Directory',
          totalCount: students.length,
          columns: ['Student ID', 'Roll No', 'Full Name', 'Class & Section', 'Father Name', 'Father Phone', 'Status', 'Session'],
          rows: students.map(s => ({
            id: s.id,
            studentId: s.studentId,
            rollNo: s.rollNo,
            fullName: s.fullName,
            classSection: `${s.class?.name || ''} - ${s.section?.name || ''}`,
            fatherName: s.parent?.fatherName || 'N/A',
            fatherPhone: s.parent?.fatherPhone || 'N/A',
            status: s.status,
            sessionName: s.session?.name || 'Current',
          })),
        };
        break;
      }

      case 'ADMISSIONS': {
        const where: any = {};
        if (classId && classId !== 'ALL') where.applyingClassId = classId;
        if (startDate && endDate) {
          where.createdAt = {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
          };
        }

        const admissions = await prisma.admissionApplication.findMany({
          where,
          include: { session: true },
          orderBy: { createdAt: 'desc' },
        });

        reportData = {
          title: 'Online Admissions & Applicant Verification Pipeline',
          totalCount: admissions.length,
          columns: ['App No', 'Applicant Name', 'Applying Class', 'Father Name', 'Phone', 'Status', 'Applied Date'],
          rows: admissions.map(a => ({
            id: a.id,
            appNo: a.applicationNo,
            fullName: a.fullName,
            applyingClass: a.applyingClassId,
            fatherName: a.fatherName,
            fatherPhone: a.fatherPhone,
            status: a.status,
            appliedDate: new Date(a.createdAt).toLocaleDateString('en-GB'),
          })),
        };
        break;
      }

      case 'DEFAULTERS':
      case 'FEES': {
        const where: any = {};
        if (type === 'DEFAULTERS') {
          where.status = { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] };
          where.remainingAmount = { gt: 0 };
        }
        if (classId && classId !== 'ALL') {
          where.student = { classId };
        }

        const invoices = await prisma.feeInvoice.findMany({
          where,
          include: {
            student: {
              include: {
                class: true,
                section: true,
                parent: true,
              },
            },
          },
          orderBy: { dueDate: 'asc' },
        });

        const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
        const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
        const totalRemaining = invoices.reduce((sum, i) => sum + i.remainingAmount, 0);

        reportData = {
          title: type === 'DEFAULTERS' ? 'Fee Defaulters & Outstanding Balances Statement' : 'Fee Invoicing & Collections Audit Report',
          totalCount: invoices.length,
          summary: { totalBilled, totalPaid, totalRemaining },
          columns: ['Invoice No', 'Student ID', 'Student Name', 'Class & Roll', 'Father Phone', 'Month', 'Total Dues', 'Paid', 'Outstanding Balance', 'Status'],
          rows: invoices.map(i => ({
            id: i.id,
            invoiceNo: i.invoiceNo,
            studentId: i.student?.studentId || 'N/A',
            fullName: i.student?.fullName || 'N/A',
            classRoll: `${i.student?.class?.name || ''} (${i.student?.rollNo || ''})`,
            fatherPhone: i.student?.parent?.fatherPhone || 'N/A',
            month: i.month,
            totalAmount: i.totalAmount,
            paidAmount: i.paidAmount,
            remainingAmount: i.remainingAmount,
            status: i.status,
          })),
        };
        break;
      }

      case 'ATTENDANCE': {
        const dateFilter = startDate ? new Date(startDate) : new Date();
        const dateOnly = new Date(dateFilter.getFullYear(), dateFilter.getMonth(), dateFilter.getDate());

        const where: any = { date: dateOnly };
        if (classId && classId !== 'ALL') {
          where.student = { classId };
        }

        const records = await prisma.attendance.findMany({
          where,
          include: {
            student: {
              include: {
                class: true,
                section: true,
              },
            },
          },
          orderBy: [{ student: { classId: 'asc' } }, { student: { rollNo: 'asc' } }],
        });

        const present = records.filter(r => r.status === 'PRESENT').length;
        const late = records.filter(r => r.status === 'LATE').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const excused = records.filter(r => r.status === 'EXCUSED').length;

        reportData = {
          title: `Daily Attendance Register (${dateOnly.toLocaleDateString('en-GB')})`,
          totalCount: records.length,
          summary: { present, late, absent, excused, rate: records.length ? (((present + late) / records.length) * 100).toFixed(1) : '100' },
          columns: ['Roll No', 'Student ID', 'Student Name', 'Class & Section', 'Check-In Time', 'Status', 'Method', 'Remarks'],
          rows: records.map(r => ({
            id: r.id,
            rollNo: r.student?.rollNo || '',
            studentId: r.student?.studentId || '',
            fullName: r.student?.fullName || '',
            classSection: `${r.student?.class?.name || ''} - ${r.student?.section?.name || ''}`,
            time: r.time,
            status: r.status,
            method: r.method,
            remarks: r.remarks || 'Gate Pass',
          })),
        };
        break;
      }

      case 'EXAMS': {
        const where: any = {};
        if (classId && classId !== 'ALL') {
          where.examSchedule = { classId };
        }

        const marks = await prisma.mark.findMany({
          where,
          include: {
            student: {
              include: { class: true, section: true },
            },
            examSchedule: {
              include: { exam: true, subject: true, class: true },
            },
          },
          orderBy: [{ examSchedule: { classId: 'asc' } }, { marksObtained: 'desc' }],
        });

        reportData = {
          title: 'Examinations Merit & Performance Ledger',
          totalCount: marks.length,
          columns: ['Exam Name', 'Class & Roll', 'Student Name', 'Subject', 'Total Marks', 'Marks Obtained', 'Percentage', 'Grade', 'GPA'],
          rows: marks.map(m => ({
            id: m.id,
            examName: m.examSchedule?.exam?.name || 'Examination',
            classRoll: `${m.student?.class?.name || ''} (${m.student?.rollNo || ''})`,
            fullName: m.student?.fullName || '',
            subjectName: m.examSchedule?.subject?.name || '',
            totalMarks: m.totalMarks,
            marksObtained: m.marksObtained,
            percentage: `${m.percentage}%`,
            grade: m.grade,
            gpa: m.gpa,
          })),
        };
        break;
      }

      case 'TEACHERS': {
        const teachers = await prisma.teacher.findMany({
          include: {
            managedSections: { include: { class: true } },
            assignments: { include: { class: true, section: true, subject: true } },
          },
          orderBy: { fullName: 'asc' },
        });

        reportData = {
          title: 'Faculty Workload & Departmental Directory',
          totalCount: teachers.length,
          columns: ['Employee ID', 'Full Name', 'Designation', 'Qualification', 'Phone', 'Email', 'Assigned Classes & Subjects', 'Status'],
          rows: teachers.map(t => ({
            id: t.id,
            employeeId: t.employeeId,
            fullName: t.fullName,
            designation: t.designation,
            qualification: t.qualification,
            phone: t.phone,
            email: t.email,
            workload: `${t.assignments.length} Assigned Periods/Subjects`,
            status: t.status,
          })),
        };
        break;
      }

      case 'STAFF': {
        const staff = await prisma.staff.findMany({
          orderBy: { role: 'asc' },
        });

        reportData = {
          title: 'Support & Administrative Staff Directory',
          totalCount: staff.length,
          columns: ['Employee ID', 'Full Name', 'Department Role', 'Phone', 'Email', 'Joining Date', 'Status'],
          rows: staff.map(s => ({
            id: s.id,
            employeeId: s.employeeId,
            fullName: s.fullName,
            role: s.role,
            phone: s.phone,
            email: s.email || 'N/A',
            joiningDate: new Date(s.joiningDate).toLocaleDateString('en-GB'),
            status: s.status,
          })),
        };
        break;
      }

      case 'LIBRARY': {
        const issues = await prisma.libraryIssue.findMany({
          include: {
            book: true,
            student: { select: { fullName: true, studentId: true, class: { select: { name: true } } } },
            teacher: { select: { fullName: true, employeeId: true } },
          },
          orderBy: { issueDate: 'desc' },
        });

        reportData = {
          title: 'Library Circulation & Circulation Fine Ledger',
          totalCount: issues.length,
          columns: ['Accession No', 'Book Title', 'Borrower Name', 'Borrower ID', 'Issue Date', 'Due Date', 'Status', 'Fine (Rs.)'],
          rows: issues.map(i => ({
            id: i.id,
            accessionNo: i.book?.accessionNo || '',
            bookTitle: i.book?.title || '',
            borrowerName: i.student?.fullName || i.teacher?.fullName || 'N/A',
            borrowerId: i.student?.studentId || i.teacher?.employeeId || 'N/A',
            issueDate: new Date(i.issueDate).toLocaleDateString('en-GB'),
            dueDate: new Date(i.dueDate).toLocaleDateString('en-GB'),
            status: i.isReturned ? 'RETURNED' : new Date(i.dueDate) < new Date() ? 'OVERDUE' : 'ISSUED',
            fineAmount: i.fineAmount || 0,
          })),
        };
        break;
      }

      case 'TRANSPORT': {
        const assignments = await prisma.studentTransport.findMany({
          include: {
            student: { include: { class: true, section: true, parent: true } },
            route: { include: { vehicle: true } },
            stop: true,
          },
          orderBy: { route: { routeName: 'asc' } },
        });

        reportData = {
          title: 'Transport Fleet Route & Passenger Manifest',
          totalCount: assignments.length,
          columns: ['Route Name', 'Vehicle No', 'Driver Phone', 'Student ID', 'Student Name', 'Class', 'Pickup Stop', 'Monthly Fee'],
          rows: assignments.map(a => ({
            id: a.id,
            routeName: a.route?.routeName || '',
            vehicleNo: a.route?.vehicle?.vehicleNo || '',
            driverPhone: a.route?.vehicle?.driverPhone || '',
            studentId: a.student?.studentId || '',
            fullName: a.student?.fullName || '',
            classSection: `${a.student?.class?.name || ''} (${a.student?.section?.name || ''})`,
            stopName: a.stop?.stopName || 'Campus Main',
            monthlyFee: `Rs. ${a.route?.monthlyFee || 3500}`,
          })),
        };
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    console.error('Reports generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
