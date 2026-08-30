import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { DEFAULT_TEMPLATES, interpolateTemplate } from '@/lib/email/templates';
import { emailProvider } from '@/lib/email/provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let templates = await prisma.notificationTemplate.findMany({
      orderBy: { name: 'asc' },
    });

    if (templates.length === 0) {
      // Seed default templates
      for (const def of DEFAULT_TEMPLATES) {
        await prisma.notificationTemplate.create({
          data: {
            code: def.code,
            name: def.name,
            category: def.category,
            subject: def.subject,
            bodyHtml: def.bodyHtml,
            variablesJson: JSON.stringify(def.variables),
            isDefault: true,
          },
        });
      }
      templates = await prisma.notificationTemplate.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, subject, bodyHtml, testEmail, sampleVariables } = body;

    // If testing template
    if (testEmail && subject && bodyHtml) {
      const interpolatedSubject = interpolateTemplate(subject, sampleVariables || {});
      const interpolatedBody = interpolateTemplate(bodyHtml, sampleVariables || {});

      const result = await emailProvider.sendEmail({
        to: testEmail,
        toName: 'Test Recipient',
        subject: `[PREVIEW] ${interpolatedSubject}`,
        html: interpolatedBody,
      });

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Template preview dispatched to test email' : result.error,
      });
    }

    // Save template
    if (id) {
      const updated = await prisma.notificationTemplate.update({
        where: { id },
        data: {
          subject,
          bodyHtml,
          isDefault: false,
        },
      });
      return NextResponse.json({ success: true, template: updated });
    }

    return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update template' }, { status: 500 });
  }
}
