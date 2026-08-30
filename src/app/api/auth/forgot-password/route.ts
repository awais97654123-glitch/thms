import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SignJWT } from 'jose';
import { sendEmail } from '@/lib/email/provider';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'the_hayatabad_model_school_super_secret_jwt_key_2026_erp'
);

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier || !identifier.trim()) {
      return NextResponse.json({ error: 'Please provide your Username, Student ID, or Registered Email.' }, { status: 400 });
    }

    const trimmed = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmed },
          { email: trimmed },
          { student: { studentId: trimmed } },
          { student: { admissionNo: trimmed } },
          { teacher: { employeeId: trimmed } },
        ],
      },
      include: {
        student: true,
        teacher: true,
        parent: true,
      },
    });

    if (!user) {
      // Return ambiguous message for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this identifier, a password reset link has been generated.',
      });
    }

    // Generate single-use signed 15-minute token
    const resetToken = await new SignJWT({
      userId: user.id,
      username: user.username,
      purpose: 'PASSWORD_RESET',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    const resetUrl = `${req.nextUrl.origin}/reset-password?token=${resetToken}`;

    // If user has email or parent has email, attempt email dispatch
    const targetEmail = user.email || user.parent?.fatherEmail || (user.student ? `${user.username}@hayatabadmodel.edu.pk` : null);

    if (targetEmail && targetEmail.includes('@')) {
      try {
        await sendEmail({
          to: targetEmail,
          subject: 'Password Reset Request — The Hayatabad Model School',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #1e3a8a;">The Hayatabad Model School</h2>
              <p>Hello <strong>${user.student?.fullName || user.teacher?.fullName || user.parent?.fatherName || user.username}</strong>,</p>
              <p>We received a request to reset the password for your portal account (Username: <strong>${user.username}</strong>).</p>
              <p style="margin: 24px 0;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Reset Your Password
                </a>
              </p>
              <p style="color: #64748b; font-size: 12px;">This reset link is valid for 15 minutes. If you did not make this request, please ignore this email.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Failed to send reset email:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetUrl, // Provided for direct verification / offline testing
      maskedTarget: targetEmail ? `${targetEmail.slice(0, 3)}***@${targetEmail.split('@')[1] || 'domain'}` : user.username,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 });
  }
}
