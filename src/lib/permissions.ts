export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRINCIPAL'
  | 'ADMIN'
  | 'SCHOOL_ADMIN'
  | 'ADMISSION_OFFICER'
  | 'ACCOUNTANT'
  | 'TEACHER'
  | 'LIBRARIAN'
  | 'TRANSPORT_MANAGER'
  | 'HR_MANAGER'
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
  // HR & Staff
  | 'staff.view'
  | 'staff.manage'
  | 'leave.view'
  | 'leave.manage'
  | 'leave.apply'
  // Communication
  | 'announcements.view'
  | 'announcements.create'
  | 'calendar.view'
  | 'calendar.manage'
  | 'support.view'
  | 'support.create'
  | 'support.manage'
  // Admin & Compliance
  | 'reports.view'
  | 'reports.export'
  | 'audit_logs.view'
  | 'users.manage'
  | 'settings.manage';

/**
 * Granular Role to Permission Mapping
 * 
 * Each role gets a specific set of permissions.
 * Backend API routes MUST check permissions via hasPermission() or assertPermission().
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
    'staff.view', 'staff.manage', 'leave.view', 'leave.manage', 'leave.apply',
    'announcements.view', 'announcements.create', 'calendar.view', 'calendar.manage',
    'support.view', 'support.create', 'support.manage',
    'reports.view', 'reports.export', 'audit_logs.view', 'users.manage', 'settings.manage',
  ],

  PRINCIPAL: [
    'students.view', 'students.create', 'students.update', 'students.archive', 'students.id_card',
    'admissions.view', 'admissions.review', 'admissions.approve', 'admissions.reject',
    'attendance.view', 'attendance.mark', 'attendance.edit', 'attendance.qr_scan',
    'academics.view', 'academics.manage', 'timetable.view', 'timetable.schedule',
    'exams.view', 'exams.create', 'results.view', 'results.enter', 'results.publish', 'results.report_card',
    'fees.view', 'fees.create', 'fees.update', 'fees.collect_payment', 'fees.receipts',
    'homework.view', 'homework.create', 'homework.review',
    'certificates.view', 'certificates.generate', 'documents.view_private', 'documents.upload',
    'library.manage', 'transport.manage', 'inventory.manage',
    'staff.view', 'staff.manage', 'leave.view', 'leave.manage',
    'announcements.view', 'announcements.create', 'calendar.view', 'calendar.manage',
    'support.view', 'support.manage',
    'reports.view', 'reports.export', 'audit_logs.view', 'users.manage', 'settings.manage',
  ],

  ADMIN: [
    'students.view', 'students.create', 'students.update', 'students.id_card',
    'admissions.view', 'admissions.review', 'admissions.approve', 'admissions.reject',
    'attendance.view', 'attendance.mark', 'attendance.edit', 'attendance.qr_scan',
    'academics.view', 'academics.manage', 'timetable.view', 'timetable.schedule',
    'exams.view', 'exams.create', 'results.view', 'results.enter', 'results.publish', 'results.report_card',
    'fees.view', 'fees.create', 'fees.collect_payment', 'fees.receipts',
    'homework.view', 'homework.create', 'homework.review',
    'certificates.view', 'certificates.generate', 'documents.view_private', 'documents.upload',
    'library.manage', 'transport.manage', 'inventory.manage',
    'staff.view', 'staff.manage', 'leave.view', 'leave.manage',
    'announcements.view', 'announcements.create', 'calendar.view', 'calendar.manage',
    'support.view', 'support.manage',
    'reports.view', 'reports.export', 'audit_logs.view', 'settings.manage',
  ],

  // Alias for backward compatibility
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
    'staff.view', 'staff.manage', 'leave.view', 'leave.manage',
    'announcements.view', 'announcements.create', 'calendar.view', 'calendar.manage',
    'support.view', 'support.manage',
    'reports.view', 'reports.export', 'audit_logs.view', 'settings.manage',
  ],

  ADMISSION_OFFICER: [
    'admissions.view', 'admissions.review', 'admissions.approve', 'admissions.reject',
    'students.view', 'students.create', 'students.id_card',
    'documents.upload', 'documents.view_private',
    'announcements.view',
    'reports.view',
  ],

  ACCOUNTANT: [
    'fees.view', 'fees.create', 'fees.update', 'fees.collect_payment', 'fees.receipts',
    'students.view',
    'announcements.view',
    'reports.view', 'reports.export',
  ],

  TEACHER: [
    'attendance.view', 'attendance.mark',
    'timetable.view',
    'exams.view', 'results.view', 'results.enter',
    'homework.view', 'homework.create', 'homework.review',
    'students.view',
    'documents.upload',
    'announcements.view',
    'leave.apply', 'leave.view',
    'support.create', 'support.view',
    'calendar.view',
  ],

  LIBRARIAN: [
    'library.manage',
    'students.view',
    'announcements.view',
    'reports.view',
  ],

  TRANSPORT_MANAGER: [
    'transport.manage',
    'students.view',
    'announcements.view',
    'reports.view',
  ],

  HR_MANAGER: [
    'staff.view', 'staff.manage',
    'leave.view', 'leave.manage',
    'students.view',
    'attendance.view',
    'announcements.view',
    'reports.view', 'reports.export',
  ],

  STUDENT: [
    'attendance.view',
    'timetable.view',
    'exams.view', 'results.view', 'results.report_card',
    'fees.view',
    'homework.view', 'homework.submit',
    'students.id_card',
    'announcements.view',
    'calendar.view',
    'support.create', 'support.view',
    'leave.apply', 'leave.view',
  ],

  PARENT: [
    'attendance.view',
    'timetable.view',
    'exams.view', 'results.view', 'results.report_card',
    'fees.view', 'fees.receipts',
    'homework.view',
    'announcements.view',
    'calendar.view',
    'support.create', 'support.view',
  ],

  STAFF: [
    'attendance.view',
    'timetable.view',
    'announcements.view',
    'leave.apply', 'leave.view',
    'support.create', 'support.view',
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
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: string | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: string | undefined | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Verify permission assertion or throw unauthorized
 */
export function assertPermission(role: string | undefined | null, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Unauthorized: Role '${role}' lacks permission '${permission}'`);
  }
}

/**
 * Check if a role is an admin-level role (can access /admin routes)
 */
export function isAdminRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'PRINCIPAL', 'ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_MANAGER', 'HR_MANAGER', 'ADMISSION_OFFICER'].includes(role);
}

/**
 * Get human-readable label for a role
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    PRINCIPAL: 'Principal',
    ADMIN: 'Administrator',
    SCHOOL_ADMIN: 'School Admin',
    ADMISSION_OFFICER: 'Admission Officer',
    ACCOUNTANT: 'Accountant',
    TEACHER: 'Teacher',
    LIBRARIAN: 'Librarian',
    TRANSPORT_MANAGER: 'Transport Manager',
    HR_MANAGER: 'HR Manager',
    STUDENT: 'Student',
    PARENT: 'Parent / Guardian',
    STAFF: 'Staff',
  };
  return labels[role] || role;
}
