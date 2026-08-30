import prisma from './db';
import crypto from 'crypto';

export async function generateStudentId(year: number = 2026): Promise<string> {
  // Find highest existing student ID for the year
  const prefix = `THMS-${year}-`;
  const latestStudent = await prisma.student.findFirst({
    where: {
      studentId: { startsWith: prefix },
    },
    orderBy: { studentId: 'desc' },
    select: { studentId: true },
  });

  let nextSeq = 1;
  if (latestStudent?.studentId) {
    const parts = latestStudent.studentId.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const candidate = `THMS-${year}-${nextSeq.toString().padStart(6, '0')}`;
  return candidate;
}

export async function generateAdmissionNumber(year: number = 2026): Promise<string> {
  const prefix = `ADM-${year}-`;
  const latestStudent = await prisma.student.findFirst({
    where: {
      admissionNo: { startsWith: prefix },
    },
    orderBy: { admissionNo: 'desc' },
    select: { admissionNo: true },
  });

  let nextSeq = 1;
  if (latestStudent?.admissionNo) {
    const parts = latestStudent.admissionNo.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const candidate = `ADM-${year}-${nextSeq.toString().padStart(6, '0')}`;
  return candidate;
}

export async function generateApplicationNumber(year: number = 2026): Promise<string> {
  const prefix = `THMS-APP-${year}-`;
  const latestApp = await prisma.admissionApplication.findFirst({
    where: {
      applicationNo: { startsWith: prefix },
    },
    orderBy: { applicationNo: 'desc' },
    select: { applicationNo: true },
  });

  let nextSeq = 1;
  if (latestApp?.applicationNo) {
    const parts = latestApp.applicationNo.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const candidate = `THMS-APP-${year}-${nextSeq.toString().padStart(4, '0')}`;
  return candidate;
}

export async function generateRollNumber(classId: string, sectionId: string): Promise<string> {
  const [classObj, sectionObj, studentCount] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId }, select: { code: true } }),
    prisma.section.findUnique({ where: { id: sectionId }, select: { name: true } }),
    prisma.student.count({ where: { classId, sectionId } }),
  ]);
  
  const classCode = classObj?.code ? classObj.code.replace('C', '') : '00';
  const sectionLetter = sectionObj?.name ? sectionObj.name.replace('Section ', '').trim().charAt(0) : 'A';
  const nextRoll = (studentCount + 1).toString().padStart(3, '0');
  
  return `${classCode}-${sectionLetter}-${nextRoll}`;
}

export async function generateInvoiceNumber(year: number = 2026): Promise<string> {
  const prefix = `INV-${year}-`;
  const latestInv = await prisma.feeInvoice.findFirst({
    where: {
      invoiceNo: { startsWith: prefix },
    },
    orderBy: { invoiceNo: 'desc' },
    select: { invoiceNo: true },
  });

  let nextSeq = 1;
  if (latestInv?.invoiceNo) {
    const parts = latestInv.invoiceNo.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const candidate = `INV-${year}-${nextSeq.toString().padStart(6, '0')}`;
  return candidate;
}

export async function generateReceiptNumber(year: number = 2026): Promise<string> {
  const prefix = `REC-${year}-`;
  const latestPayment = await prisma.payment.findFirst({
    where: {
      receiptNo: { startsWith: prefix },
    },
    orderBy: { receiptNo: 'desc' },
    select: { receiptNo: true },
  });

  let nextSeq = 1;
  if (latestPayment?.receiptNo) {
    const parts = latestPayment.receiptNo.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const candidate = `REC-${year}-${nextSeq.toString().padStart(6, '0')}`;
  return candidate;
}

export async function generateCertificateNumber(type: string, year: number = 2026): Promise<string> {
  const count = await prisma.certificate.count();
  const nextSeq = (count + 1).toString().padStart(5, '0');
  const typePrefix = type.substring(0, 3).toUpperCase();
  return `THMS-${typePrefix}-${year}-${nextSeq}`;
}

export function generateQrToken(studentId: string): string {
  const randomSalt = crypto.randomBytes(8).toString('hex');
  return `THMS-QR-${studentId}-${randomSalt}`;
}
