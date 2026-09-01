import { NextResponse } from 'next/server';

// SECURITY: Demo login has been disabled for production.
// All users must authenticate through the standard login flow.

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: 'Demo login is disabled. Please use the standard login at /login' },
    { status: 403 }
  );
}
