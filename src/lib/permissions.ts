export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'ADMISSION_OFFICER'
  | 'ACCOUNTANT'
  | 'TEACHER'
  | 'LIBRARIAN'
  | 'TRANSPORT_MANAGER'
  | 'STUDENT'
  | 'PARENT'
  | 'STAFF';

export type Permission =
  // Student permissions
  | 'students.view'
  | 'students.create'
  | 'students.update'
  | 'students.archive'
  | 'students.id_card'
  // Admission permissions
  | 'admissions.view'
  | 'admissions.review'
  | 'admissions.approve'
  | 'admissions.reject'
  // Attendance permissions
  | 'attendance.view'
  | 'attendance.mark'
  | 'attendance.edit'
  | 'attendance.qr_scan'
  // Academics & Timetable
  | 'academics.view'
  | 'academics.manage'
  | 'timetable.view'
  | 'timetable.schedule'
  // Examinations & Marks
  | 'exams.view'
  | 'exams.create'
  | 'results.view'
  | 'results.enter'
  | 'results.publish'
  | 'results.report_card'
  // Fees & Finance
  | 'fees.view'
  | 'fees.create'
  | 'fees.update'
  | 'fees.collect_payment'
  | 'fees.receipts'
  // Homework & Materials
  | 'homework.view'
  | 'homework.create'
  | 'homework.submit'
  | 'homework.review'
  // Certificates & Documents
  | 'certificates.view'
  | 'certificates.generate'
  | 'documents.view_private'
  | 'documents.upload'
  // Logistics
  | 'library.manage'
  | 'transport.manage'
  | 'inventory.manage'
  // Admin & Compliance
  | 'reports.view'
  | 'reports.export'
  | 'audit_logs.view'
  | 'users.manage'
  | 'settings.manage';

/**
 * Granular Role to Permission Mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'students.view', 'students.create', 'students.update', 'students.archive', 'students.id_card',
    'admissions.view', 'admissions.review', 'admissions.approve', 'admissions.reject',
    'attendance.view', 'attendance.mark', 'attendance.edit', 'attendance.qr_scan',
    'academics.view', 'academics.manage', 'timetable.view', 'timetable.schedule',
    'exams.view', 'exams.create', 'results.view', 'results.enter', 'results.publish', 'results.report_card',
    'fees.view', 'fees.create', 'fees.update', 'fees.collect_payment', 'fees.receipts',
    'homework.view', 'homework.create', 'homework.submit', 'homework.review',
    'certificates.view', 'certificates.generate', 'documents.view_private', 'documents.upload',
    'library.manage', 'transport.manage', 'inventory.manage',
    'reports.view', 'reports.export', 'audit_logs.view', 'users.manage', 'settings.manage',
  ],

  SCHOOL_ADMIN: [
    'students.view', 'students.create', 'students.update', 'students.id_card',
    'admissions.view', 'admissions.review', 'admissions.approve', 'admissions.reject',
    'attendance.view', 'attendance.mark', 'attendance.edit', 'attendance.qr_scan',
    'academics.view', 'academics.manage', 'timetable.view', 'timetable.schedule',
    'exams.view', 'exams.create', 'results.view', 'results.enter', 'results.publish', 'results.report_card',
    'fees.view', 'fees.create', 'fees.collect_payment', 'fees.receipts',
    'homework.view', 'homework.create', 'homework.review',
    'certificates.view', 'certificates.generate', 'documents.view_private', 'documents.upload',
    'library.manage', 'transport.manage', 'inventory.manage',
    'reports.view', 'reports.export', 'audit_logs.view', 'settings.manage',
  ],

  ADMISSION_OFFICER: [
    'admissions.view', 'admissions.review', 'admissions.approve', 'admissions.reject',
    'students.view', 'students.create', 'students.id_card', 'documents.upload', 'reports.view',
  ],

  ACCOUNTANT: [
    'fees.view', 'fees.create', 'fees.update', 'fees.collect_payment', 'fees.receipts',
    'students.view', 'reports.view', 'reports.export',
  ],

  TEACHER: [
    'attendance.view', 'attendance.mark',
    'timetable.view',
    'exams.view', 'results.view', 'results.enter',
    'homework.view', 'homework.create', 'homework.review',
    'students.view', 'documents.upload',
  ],

  LIBRARIAN: [
    'library.manage', 'students.view', 'reports.view',
  ],

  TRANSPORT_MANAGER: [
    'transport.manage', 'students.view', 'reports.view',
  ],

  STUDENT: [
    'attendance.view', 'timetable.view', 'exams.view', 'results.view',
    'fees.view', 'homework.view', 'homework.submit', 'students.id_card',
  ],

  PARENT: [
    'attendance.view', 'timetable.view', 'exams.view', 'results.view',
    'fees.view', 'homework.view',
  ],

  STAFF: [
    'attendance.view', 'timetable.view',
  ],
};

/**
 * Check if a given role has a specific permission
 */
export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Verify permission assertion or throw unauthorized
 */
export function assertPermission(role: string | undefined | null, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Unauthorized: Role '${role}' lacks permission '${permission}'`);
  }
}
