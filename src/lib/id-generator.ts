import prisma from './db';
import crypto from 'crypto';

export async function generateStudentId(year: number = 2026): Promise<string> {
  const count = await prisma.student.count();
  let seq = count + 1;
  let candidate = `THMS-${year}-${seq.toString().padStart(6, '0')}`;

  while (await prisma.student.findUnique({ where: { studentId: candidate } }) ||
         await prisma.user.findUnique({ where: { username: candidate } })) {
    seq++;
    candidate = `THMS-${year}-${seq.toString().padStart(6, '0')}`;
  }

  return candidate;
}

export async function generateAdmissionNumber(year: number = 2026): Promise<string> {
  const count = await prisma.student.count();
  let seq = count + 1;
  let candidate = `ADM-${year}-${seq.toString().padStart(6, '0')}`;

  while (await prisma.student.findUnique({ where: { admissionNo: candidate } })) {
    seq++;
    candidate = `ADM-${year}-${seq.toString().padStart(6, '0')}`;
  }

  return candidate;
}

export async function generateApplicationNumber(year: number = 2026): Promise<string> {
  const count = await prisma.admissionApplication.count();
  let seq = count + 1;
  let candidate = `THMS-APP-${year}-${seq.toString().padStart(4, '0')}`;

  while (await prisma.admissionApplication.findUnique({ where: { applicationNo: candidate } })) {
    seq++;
    candidate = `THMS-APP-${year}-${seq.toString().padStart(4, '0')}`;
  }

  return candidate;
}

export async function generateRollNumber(classId: string, sectionId: string): Promise<string> {
  const classObj = await prisma.class.findUnique({ where: { id: classId } });
  const sectionObj = await prisma.section.findUnique({ where: { id: sectionId } });
  
  const classCode = classObj?.code ? classObj.code.replace('C', '') : '00';
  const sectionLetter = sectionObj?.name ? sectionObj.name.replace('Section ', '').trim().charAt(0) : 'A';
  
  const studentCount = await prisma.student.count({
    where: {
      classId,
      sectionId,
    },
  });

  const nextRoll = (studentCount + 1).toString().padStart(3, '0');
  return `${classCode}-${sectionLetter}-${nextRoll}`;
}

export async function generateInvoiceNumber(year: number = 2026): Promise<string> {
  const count = await prisma.feeInvoice.count();
  let seq = count + 1;
  let candidate = `INV-${year}-${seq.toString().padStart(6, '0')}`;

  while (await prisma.feeInvoice.findUnique({ where: { invoiceNo: candidate } })) {
    seq++;
    candidate = `INV-${year}-${seq.toString().padStart(6, '0')}`;
  }

  return candidate;
}

export async function generateReceiptNumber(year: number = 2026): Promise<string> {
  const count = await prisma.payment.count();
  let seq = count + 1;
  let candidate = `REC-${year}-${seq.toString().padStart(6, '0')}`;

  while (await prisma.payment.findUnique({ where: { receiptNo: candidate } })) {
    seq++;
    candidate = `REC-${year}-${seq.toString().padStart(6, '0')}`;
  }

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
