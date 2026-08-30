export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

export interface DefaultTemplateDefinition {
  code: string;
  name: string;
  category: 'ACADEMICS' | 'FINANCE' | 'ATTENDANCE' | 'ADMISSIONS' | 'EXAMINATIONS' | 'GENERAL';
  subject: string;
  bodyHtml: string;
  variables: TemplateVariable[];
}

export const DEFAULT_TEMPLATES: DefaultTemplateDefinition[] = [
  {
    code: 'HOMEWORK_PUBLISHED',
    name: 'New Homework Assignment Notification',
    category: 'ACADEMICS',
    subject: 'New Homework — {{subject_name}} ({{student_name}} - {{class_name}})',
    bodyHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #1e3a8a; color: #ffffff; padding: 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">{{school_name}}</h1>
    <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Curriculum & Homework Alert</p>
  </div>
  <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
    <p style="font-size: 14px; margin-top: 0;">Dear Parent / Guardian,</p>
    <p style="font-size: 14px;">A new homework assignment has been assigned to <strong>{{student_name}}</strong> in <strong>{{class_name}} ({{section_name}})</strong>.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Subject:</strong> {{subject_name}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Teacher:</strong> {{teacher_name}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Topic / Task:</strong> {{homework_title}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Instructions:</strong> {{homework_desc}}</p>
      <p style="margin: 0; font-size: 14px; color: #b91c1c;"><strong>Submission Due Date:</strong> {{due_date}}</p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{{portal_url}}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">View in Parent Portal</a>
    </div>
  </div>
  <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
    This is an official automated notification from {{school_name}}. Please do not reply directly to this email.
  </div>
</div>
`,
    variables: [
      { key: 'school_name', label: 'School Name', example: 'The Hayatabad Model School' },
      { key: 'student_name', label: 'Student Name', example: 'Hamza Tariq' },
      { key: 'class_name', label: 'Class', example: 'Class 8' },
      { key: 'section_name', label: 'Section', example: 'Section A' },
      { key: 'subject_name', label: 'Subject', example: 'Mathematics' },
      { key: 'teacher_name', label: 'Teacher', example: 'Engr. Farooq Ahmad' },
      { key: 'homework_title', label: 'Homework Title', example: 'Chapter 4 — Exercise 4.2 Proofs' },
      { key: 'homework_desc', label: 'Description', example: 'Factorization questions 1 to 15' },
      { key: 'due_date', label: 'Due Date', example: '2 September 2026' },
      { key: 'portal_url', label: 'Portal URL', example: 'http://localhost:3000/parent' },
    ],
  },
  {
    code: 'FEE_INVOICE',
    name: 'New Fee Invoice Notification',
    category: 'FINANCE',
    subject: 'Fee Voucher Notice — {{student_name}} (Invoice #{{invoice_number}})',
    bodyHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #0f766e; color: #ffffff; padding: 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">{{school_name}}</h1>
    <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Accounts & Fee Voucher Notice</p>
  </div>
  <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
    <p style="font-size: 14px; margin-top: 0;">Dear Parent / Guardian,</p>
    <p style="font-size: 14px;">The monthly fee voucher has been issued for <strong>{{student_name}}</strong> ({{student_id}}), enrolled in <strong>{{class_name}}</strong>.</p>
    
    <div style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Invoice Number:</strong> {{invoice_number}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Billing Month:</strong> {{month_name}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Total Payable:</strong> Rs. {{amount}}</p>
      <p style="margin: 0; font-size: 14px; color: #dc2626;"><strong>Payment Due Date:</strong> {{due_date}}</p>
    </div>

    <p style="font-size: 13px; color: #64748b;">Payments can be deposited at the campus cash counter, through online bank transfer, or via our digital payment gateway.</p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{{portal_url}}" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Download Fee Voucher</a>
    </div>
  </div>
  <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
    {{school_name}} Accounts Department • Phase 4, Hayatabad, Peshawar
  </div>
</div>
`,
    variables: [
      { key: 'school_name', label: 'School Name', example: 'The Hayatabad Model School' },
      { key: 'student_name', label: 'Student Name', example: 'Hamza Tariq' },
      { key: 'student_id', label: 'Student ID', example: 'THMS-2026-000001' },
      { key: 'class_name', label: 'Class', example: 'Class 8' },
      { key: 'invoice_number', label: 'Invoice Number', example: 'INV-2026-000001' },
      { key: 'month_name', label: 'Month', example: 'September 2026' },
      { key: 'amount', label: 'Amount', example: '10,000' },
      { key: 'due_date', label: 'Due Date', example: '10 September 2026' },
      { key: 'portal_url', label: 'Portal URL', example: 'http://localhost:3000/parent' },
    ],
  },
  {
    code: 'PAYMENT_RECEIPT',
    name: 'Fee Payment Receipt Voucher',
    category: 'FINANCE',
    subject: 'Payment Acknowledgment Receipt — {{receipt_number}} ({{student_name}})',
    bodyHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #047857; color: #ffffff; padding: 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">{{school_name}}</h1>
    <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Official Payment Confirmation</p>
  </div>
  <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
    <p style="font-size: 14px; margin-top: 0;">Dear Parent / Guardian,</p>
    <p style="font-size: 14px;">We have successfully received and verified the fee payment for <strong>{{student_name}}</strong> ({{student_id}}).</p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Receipt Number:</strong> {{receipt_number}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Amount Paid:</strong> Rs. {{amount_paid}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Payment Channel:</strong> {{payment_method}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Payment Date:</strong> {{payment_date}}</p>
      <p style="margin: 0; font-size: 14px; color: #047857;"><strong>Remaining Balance:</strong> Rs. {{remaining_balance}}</p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{{portal_url}}" style="display: inline-block; background-color: #047857; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">View 3-Slip Deposit Receipt</a>
    </div>
  </div>
</div>
`,
    variables: [
      { key: 'school_name', label: 'School Name', example: 'The Hayatabad Model School' },
      { key: 'student_name', label: 'Student Name', example: 'Hamza Tariq' },
      { key: 'student_id', label: 'Student ID', example: 'THMS-2026-000001' },
      { key: 'receipt_number', label: 'Receipt No', example: 'REC-2026-000001' },
      { key: 'amount_paid', label: 'Amount Paid', example: '10,000' },
      { key: 'payment_method', label: 'Method', example: 'Bank Transfer (HBL)' },
      { key: 'payment_date', label: 'Date', example: '29 August 2026' },
      { key: 'remaining_balance', label: 'Balance', example: '0' },
      { key: 'portal_url', label: 'Portal URL', example: 'http://localhost:3000/parent' },
    ],
  },
  {
    code: 'ATTENDANCE_ALERT',
    name: 'Student Attendance Notification',
    category: 'ATTENDANCE',
    subject: 'Attendance Notice: {{student_name}} marked {{attendance_status}} on {{date}}',
    bodyHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #b45309; color: #ffffff; padding: 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">{{school_name}}</h1>
    <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Daily Attendance Gate Alert</p>
  </div>
  <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
    <p style="font-size: 14px; margin-top: 0;">Dear Parent / Guardian,</p>
    <p style="font-size: 14px;">This is an automated attendance notice regarding <strong>{{student_name}}</strong> ({{class_name}} - {{section_name}}).</p>
    
    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Date:</strong> {{date}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Time Recorded:</strong> {{time}}</p>
      <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> <span style="font-weight: bold; color: #b45309;">{{attendance_status}}</span></p>
    </div>

    <p style="font-size: 13px; color: #64748b;">If this absence/delay was unexcused, please contact the campus administration or submit a leave request via the parent portal.</p>
  </div>
</div>
`,
    variables: [
      { key: 'school_name', label: 'School Name', example: 'The Hayatabad Model School' },
      { key: 'student_name', label: 'Student Name', example: 'Hamza Tariq' },
      { key: 'class_name', label: 'Class', example: 'Class 8' },
      { key: 'section_name', label: 'Section', example: 'Section A' },
      { key: 'date', label: 'Date', example: '29 August 2026' },
      { key: 'time', label: 'Time', example: '08:35 AM' },
      { key: 'attendance_status', label: 'Status', example: 'LATE' },
    ],
  },
  {
    code: 'ADMISSION_APPROVED',
    name: 'Admission Approval & Enrollment Confirmation',
    category: 'ADMISSIONS',
    subject: 'Admission Confirmed — Welcome to {{school_name}} ({{student_name}})',
    bodyHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #1e3a8a; color: #ffffff; padding: 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 20px;">{{school_name}}</h1>
    <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">Official Admission & Enrollment Letter</p>
  </div>
  <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
    <p style="font-size: 14px; margin-top: 0;">Congratulations!</p>
    <p style="font-size: 14px;">We are pleased to inform you that <strong>{{student_name}}</strong> has been formally enrolled in <strong>{{class_name}} ({{section_name}})</strong> for Academic Session <strong>{{session_name}}</strong>.</p>
    
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Student ID:</strong> {{student_id}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Admission Number:</strong> {{admission_no}}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Assigned Roll Number:</strong> {{roll_no}}</p>
      <p style="margin: 0; font-size: 14px;"><strong>Portal Username:</strong> {{student_id}}</p>
    </div>

    <p style="font-size: 13px; color: #64748b;">The student digital ID card and initial fee voucher have been generated and are now available in your portal.</p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="{{portal_url}}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Access Portal</a>
    </div>
  </div>
</div>
`,
    variables: [
      { key: 'school_name', label: 'School Name', example: 'The Hayatabad Model School' },
      { key: 'student_name', label: 'Student Name', example: 'Hamza Tariq' },
      { key: 'class_name', label: 'Class', example: 'Class 8' },
      { key: 'section_name', label: 'Section', example: 'Section A' },
      { key: 'session_name', label: 'Session', example: '2026-2027' },
      { key: 'student_id', label: 'Student ID', example: 'THMS-2026-000001' },
      { key: 'admission_no', label: 'Admission No', example: 'ADM-2026-000001' },
      { key: 'roll_no', label: 'Roll No', example: '08-A-001' },
      { key: 'portal_url', label: 'Portal URL', example: 'http://localhost:3000/parent' },
    ],
  },
];

/**
 * Interpolate template variables into subject and HTML body
 */
export function interpolateTemplate(
  templateStr: string,
  variables: Record<string, string | number | undefined | null>
): string {
  let result = templateStr;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  return result;
}
