import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const openApiDoc = {
    openapi: '3.0.3',
    info: {
      title: 'The Hayatabad Model School — Central Management ERP API',
      version: '1.0.0',
      description:
        'Official REST API documentation for The Hayatabad Model School Management ERP, covering Admissions, Students, QR Attendance, Timetables, Examinations, Fees, Homework, and Multi-Portal Authentication.',
      contact: {
        name: 'IT & Admissions Office',
        email: 'info@hayatabadmodel.edu.pk',
        url: 'https://hayatabadmodel.edu.pk',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local Enterprise Development Server',
      },
      {
        url: 'https://school.hayatabadmodel.edu.pk/api',
        description: 'Production Cloud Cluster',
      },
    ],
    paths: {
      '/auth/login': {
        post: {
          summary: 'User Login & Session Token Generation',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: {
                    username: { type: 'string', example: 'admin' },
                    password: { type: 'string', example: 'Admin@123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Authenticated successfully with HTTP-only cookie' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/admissions': {
        get: {
          summary: 'List Admission Applications Queue',
          tags: ['Admissions'],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', example: 'SUBMITTED' } },
            { name: 'q', in: 'query', schema: { type: 'string', example: 'Bilal' } },
          ],
          responses: { 200: { description: 'List of admission applications' } },
        },
        post: {
          summary: 'Submit New Online Admission Application',
          tags: ['Admissions'],
          responses: { 200: { description: 'Application submitted with tracking code' } },
        },
      },
      '/admissions/{id}/enroll': {
        post: {
          summary: '1-Click Approve & Enroll Student Engine',
          tags: ['Admissions'],
          description:
            'Atomic transaction generating Student record, Roll number, ID card, QR token, parent account, and initial fee voucher.',
          responses: { 200: { description: 'Student successfully enrolled' } },
        },
      },
      '/attendance/qr-scan': {
        post: {
          summary: 'Process Live QR Attendance Scan',
          tags: ['Attendance'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['qrToken'],
                  properties: {
                    qrToken: { type: 'string', example: 'THMS-QR-2026-000001' },
                    deviceKey: { type: 'string', example: 'GATE-SCANNER-01' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Attendance recorded successfully' } },
        },
      },
      '/students': {
        get: {
          summary: 'List Enrolled Students Directory',
          tags: ['Students'],
          parameters: [
            { name: 'classId', in: 'query', schema: { type: 'string' } },
            { name: 'q', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Array of student records' } },
        },
      },
      '/fees/invoices': {
        get: {
          summary: 'List Fee Invoices & Financial Ledger',
          tags: ['Fees & Payments'],
          responses: { 200: { description: 'Invoices with financial metrics' } },
        },
        post: {
          summary: 'Create Fee Invoice Voucher',
          tags: ['Fees & Payments'],
          responses: { 200: { description: 'Invoice created' } },
        },
      },
      '/fees/payments': {
        post: {
          summary: 'Record Fee Payment & Issue 3-Copy Voucher Receipt',
          tags: ['Fees & Payments'],
          responses: { 200: { description: 'Payment recorded and receipt generated' } },
        },
      },
      '/examinations/marks': {
        get: {
          summary: 'Fetch Examination Subject Marks Matrix',
          tags: ['Examinations'],
          responses: { 200: { description: 'Marks sheet' } },
        },
        post: {
          summary: 'Record Subject Marks with Automated BISE Grade & GPA Calculation',
          tags: ['Examinations'],
          responses: { 200: { description: 'Marks saved' } },
        },
      },
      '/certificates': {
        post: {
          summary: 'Generate Verifiable School Certificate (Bonafide, Character, SLC)',
          tags: ['Certificates'],
          responses: { 200: { description: 'Certificate generated with QR authentication token' } },
        },
      },
      '/timetable': {
        post: {
          summary: 'Schedule Period with Timetable Conflict Detection Engine',
          tags: ['Academics'],
          responses: { 200: { description: 'Period scheduled without conflicts' } },
        },
      },
    },
  };

  return NextResponse.json(openApiDoc);
}
