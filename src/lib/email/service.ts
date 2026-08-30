import prisma from '../db';
import { emailQueue } from './queue';

export class NotificationDispatcherService {
  /**
   * Trigger notifications when Teacher publishes homework
   */
  async onHomeworkPublished({
    homeworkId,
    title,
    description,
    dueDate,
    className,
    sectionName,
    subjectName,
    teacherName,
    classId,
    sectionId,
  }: {
    homeworkId: string;
    title: string;
    description: string;
    dueDate: Date | string;
    className: string;
    sectionName: string;
    subjectName: string;
    teacherName: string;
    classId: string;
    sectionId: string;
  }) {
    // 1. Find all active enrolled students in this class/section
    const students = await prisma.student.findMany({
      where: { classId, sectionId, status: 'ENROLLED' },
      include: { parent: true, user: true },
    });

    const formattedDue = new Date(dueDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    for (const student of students) {
      // In-app notification for student
      if (student.userId) {
        await prisma.notification.create({
          data: {
            userId: student.userId,
            title: `New Homework: ${subjectName}`,
            message: `${title} has been assigned by ${teacherName}. Due on ${formattedDue}.`,
            type: 'ANNOUNCEMENT',
            link: '/student',
          },
        });
      }

      // Email to Parent if registered
      const parentEmail = student.parent?.fatherEmail || (student.user?.email && student.user.email.includes('@') ? student.user.email : null);
      if (parentEmail) {
        await emailQueue.enqueue({
          eventId: `hw_${homeworkId}_${student.id}`,
          eventType: 'HOMEWORK',
          recipientEmail: parentEmail,
          recipientName: student.parent?.fatherName || student.fullName,
          recipientRole: 'PARENT',
          templateCode: 'HOMEWORK_PUBLISHED',
          variables: {
            school_name: 'The Hayatabad Model School',
            student_name: student.fullName,
            class_name: className,
            section_name: sectionName,
            subject_name: subjectName,
            teacher_name: teacherName,
            homework_title: title,
            homework_desc: description,
            due_date: formattedDue,
            portal_url: 'http://localhost:3000/parent',
          },
        });
      }
    }
  }

  /**
   * Trigger notification when Fee Invoice is generated
   */
  async onFeeInvoiceCreated({
    invoiceId,
    invoiceNo,
    title,
    month,
    amount,
    dueDate,
    studentId,
  }: {
    invoiceId: string;
    invoiceNo: string;
    title: string;
    month: string;
    amount: number;
    dueDate: Date | string;
    studentId: string;
  }) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: true, class: true, user: true },
    });

    if (!student) return;

    const parentEmail = student.parent?.fatherEmail;
    if (parentEmail) {
      await emailQueue.enqueue({
        eventId: `inv_${invoiceId}`,
        eventType: 'FEE_INVOICE',
        recipientEmail: parentEmail,
        recipientName: student.parent?.fatherName || 'Parent',
        recipientRole: 'PARENT',
        templateCode: 'FEE_INVOICE',
        variables: {
          school_name: 'The Hayatabad Model School',
          student_name: student.fullName,
          student_id: student.studentId,
          class_name: student.class.name,
          invoice_number: invoiceNo,
          month_name: month,
          amount: amount.toLocaleString(),
          due_date: new Date(dueDate).toLocaleDateString('en-GB'),
          portal_url: 'http://localhost:3000/parent',
        },
      });
    }
  }

  /**
   * Trigger notification when Fee Payment is recorded
   */
  async onFeePaymentReceived({
    receiptNo,
    amount,
    paymentMethod,
    paymentDate,
    remainingBalance,
    studentId,
  }: {
    receiptNo: string;
    amount: number;
    paymentMethod: string;
    paymentDate: Date | string;
    remainingBalance: number;
    studentId: string;
  }) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: true },
    });

    if (!student) return;

    const parentEmail = student.parent?.fatherEmail;
    if (parentEmail) {
      await emailQueue.enqueue({
        eventId: `rec_${receiptNo}`,
        eventType: 'PAYMENT',
        recipientEmail: parentEmail,
        recipientName: student.parent?.fatherName || 'Parent',
        recipientRole: 'PARENT',
        templateCode: 'PAYMENT_RECEIPT',
        variables: {
          school_name: 'The Hayatabad Model School',
          student_name: student.fullName,
          student_id: student.studentId,
          receipt_number: receiptNo,
          amount_paid: amount.toLocaleString(),
          payment_method: paymentMethod,
          payment_date: new Date(paymentDate).toLocaleDateString('en-GB'),
          remaining_balance: remainingBalance.toLocaleString(),
          portal_url: 'http://localhost:3000/parent',
        },
      });
    }
  }

  /**
   * Trigger attendance alert if student is marked Absent or Late
   */
  async onAttendanceMarked({
    studentId,
    status,
    date,
    time,
  }: {
    studentId: string;
    status: string;
    date: Date | string;
    time: string;
  }) {
    if (status === 'PRESENT') return; // Only alert on Late/Absent

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: true, class: true, section: true },
    });

    if (!student) return;

    const parentEmail = student.parent?.fatherEmail;
    if (parentEmail) {
      await emailQueue.enqueue({
        eventId: `att_${student.id}_${new Date(date).toISOString().split('T')[0]}`,
        eventType: 'ATTENDANCE',
        recipientEmail: parentEmail,
        recipientName: student.parent?.fatherName || 'Parent',
        recipientRole: 'PARENT',
        templateCode: 'ATTENDANCE_ALERT',
        variables: {
          school_name: 'The Hayatabad Model School',
          student_name: student.fullName,
          class_name: student.class.name,
          section_name: student.section.name,
          date: new Date(date).toLocaleDateString('en-GB'),
          time,
          attendance_status: status,
        },
      });
    }
  }
}

export const notificationDispatcher = new NotificationDispatcherService();
