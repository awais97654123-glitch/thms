import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { jwtVerify } from 'jose';
import { hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'the_hayatabad_model_school_super_secret_jwt_key_2026_erp'
);

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Verify token
    let payload: any;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired password reset link. Please request a new one.' }, { status: 400 });
    }

    if (payload.purpose !== 'PASSWORD_RESET' || !payload.userId) {
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 });
    }

    const newPasswordHash = await hashPassword(newPassword.trim());

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        passwordHash: newPasswordHash,
        isFirstLogin: false,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.username,
      role: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'User',
      entityId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
