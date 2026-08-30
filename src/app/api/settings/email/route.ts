import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { emailProvider } from '@/lib/email/provider';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let config = await prisma.emailProviderConfig.findFirst();
    if (!config) {
      config = await prisma.emailProviderConfig.create({
        data: {
          providerType: 'SMTP',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          senderName: 'The Hayatabad Model School',
          senderEmail: 'notifications@hayatabadmodel.edu.pk',
          isConfigured: false,
          isEnabled: true,
        },
      });
    }
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch email config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      providerType,
      host,
      port,
      secure,
      authEmail,
      authPassword,
      senderName,
      senderEmail,
      isEnabled,
      notifyHomework,
      notifyFee,
      notifyAttendance,
      notifyExam,
      notifyAdmission,
      notifyAnnounce,
      testEmail,
    } = body;

    // Handle Test Email
    if (testEmail) {
      const testResult = await emailProvider.testConnection(testEmail);
      return NextResponse.json({
        success: testResult.success,
        message: testResult.success ? 'Test email dispatched successfully' : testResult.error,
      });
    }

    // Save Configuration
    let existing = await prisma.emailProviderConfig.findFirst();
    const updateData = {
      providerType: providerType || 'SMTP',
      host: host || 'smtp.gmail.com',
      port: Number(port) || 587,
      secure: Boolean(secure),
      authEmail: authEmail || null,
      authPassword: authPassword || null,
      senderName: senderName || 'The Hayatabad Model School',
      senderEmail: senderEmail || 'notifications@hayatabadmodel.edu.pk',
      isConfigured: Boolean(authEmail && (authPassword || host)),
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      notifyHomework: notifyHomework !== undefined ? Boolean(notifyHomework) : true,
      notifyFee: notifyFee !== undefined ? Boolean(notifyFee) : true,
      notifyAttendance: notifyAttendance !== undefined ? Boolean(notifyAttendance) : true,
      notifyExam: notifyExam !== undefined ? Boolean(notifyExam) : true,
      notifyAdmission: notifyAdmission !== undefined ? Boolean(notifyAdmission) : true,
      notifyAnnounce: notifyAnnounce !== undefined ? Boolean(notifyAnnounce) : true,
    };

    if (existing) {
      existing = await prisma.emailProviderConfig.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      existing = await prisma.emailProviderConfig.create({
        data: updateData,
      });
    }

    await logAuditEvent({
      userName: 'Admin',
      role: 'ADMIN',
      action: 'EMAIL_SETTINGS_UPDATED',
      entity: 'EmailProviderConfig',
      details: `Configured email provider ${providerType} with sender ${senderEmail}`,
    });

    return NextResponse.json({ success: true, config: existing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save email settings' }, { status: 500 });
  }
}
