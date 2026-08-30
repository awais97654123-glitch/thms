import prisma from './db';
import crypto from 'crypto';

export async function generateStudentId(year: number = 2026): Promise<string> {
  const count = await prisma.student.count({
    where: { studentId: { startsWith: `THMS-${year}-` } },
  });
  let nextSeq = count + 1;
  let candidate = `THMS-${year}-${nextSeq.toString().padStart(6, '0')}`;
  while (await prisma.student.findUnique({ where: { studentId: candidate } })) {
    nextSeq++;
    candidate = `THMS-${year}-${nextSeq.toString().padStart(6, '0')}`;
  }
  return candidate;
}

export async function generateAdmissionNumber(year: number = 2026): Promise<string> {
  const count = await prisma.student.count({
    where: { admissionNo: { startsWith: `ADM-${year}-` } },
  });
  let nextSeq = count + 1;
  let candidate = `ADM-${year}-${nextSeq.toString().padStart(6, '0')}`;
  while (await prisma.student.findUnique({ where: { admissionNo: candidate } })) {
    nextSeq++;
    candidate = `ADM-${year}-${nextSeq.toString().padStart(6, '0')}`;
  }
  return candidate;
}

export async function generateApplicationNumber(year: number = 2026): Promise<string> {
  const count = await prisma.admissionApplication.count({
    where: { applicationNo: { startsWith: `THMS-APP-${year}-` } },
  });
  let nextSeq = count + 1;
  let candidate = `THMS-APP-${year}-${nextSeq.toString().padStart(6, '0')}`;
  while (await prisma.admissionApplication.findUnique({ where: { applicationNo: candidate } })) {
    nextSeq++;
    candidate = `THMS-APP-${year}-${nextSeq.toString().padStart(6, '0')}`;
  }
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
  const count = await prisma.feeInvoice.count({
    where: { invoiceNo: { startsWith: `INV-${year}-` } },
  });
  let nextSeq = count + 1;
  let candidate = `INV-${year}-${nextSeq.toString().padStart(6, '0')}`;
  while (await prisma.feeInvoice.findUnique({ where: { invoiceNo: candidate } })) {
    nextSeq++;
    candidate = `INV-${year}-${nextSeq.toString().padStart(6, '0')}`;
  }
  return candidate;
}

export async function generateReceiptNumber(year: number = 2026): Promise<string> {
  const count = await prisma.payment.count({
    where: { receiptNo: { startsWith: `REC-${year}-` } },
  });
  let nextSeq = count + 1;
  let candidate = `REC-${year}-${nextSeq.toString().padStart(6, '0')}`;
  while (await prisma.payment.findUnique({ where: { receiptNo: candidate } })) {
    nextSeq++;
    candidate = `REC-${year}-${nextSeq.toString().padStart(6, '0')}`;
  }
  return candidate;
}

export async function generateCertificateNumber(type: string, year: number = 2026): Promise<string> {
  const count = await prisma.certificate.count();
  let nextSeq = count + 1;
  const typePrefix = type.substring(0, 3).toUpperCase();
  let candidate = `THMS-${typePrefix}-${year}-${nextSeq.toString().padStart(5, '0')}`;
  while (await prisma.certificate.findUnique({ where: { certificateNo: candidate } })) {
    nextSeq++;
    candidate = `THMS-${typePrefix}-${year}-${nextSeq.toString().padStart(5, '0')}`;
  }
  return candidate;
}

export function generateQrToken(studentId: string): string {
  const randomSalt = crypto.randomBytes(8).toString('hex');
  return `THMS-QR-${studentId}-${randomSalt}`;
}
