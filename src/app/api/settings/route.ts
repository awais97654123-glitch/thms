import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.schoolSetting.findFirst();
    const sessions = await prisma.academicSession.findMany({ orderBy: { startDate: 'desc' } });
    const gradeRules = await prisma.gradeRule.findMany({ orderBy: { orderIndex: 'asc' } });

    return NextResponse.json({ success: true, setting, sessions, gradeRules });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();

    const existing = await prisma.schoolSetting.findFirst();
    let updated;

    if (existing) {
      updated = await prisma.schoolSetting.update({
        where: { id: existing.id },
        data: {
          schoolName: body.schoolName,
          tagline: body.tagline,
          phone: body.phone,
          email: body.email,
          website: body.website,
          address: body.address,
          principalName: body.principalName,
          currency: body.currency,
          currencySymbol: body.currencySymbol,
        },
      });
    } else {
      updated = await prisma.schoolSetting.create({ data: body });
    }

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Super Admin',
      role: session?.role || 'SUPER_ADMIN',
      action: 'SETTINGS_UPDATED',
      entity: 'SchoolSetting',
      details: 'Updated official school institutional settings',
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
