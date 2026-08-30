import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'the_hayatabad_model_school_super_secret_jwt_key_2026_erp'
);

const COOKIE_NAME = 'thms_session';

interface SessionPayload {
  userId: string;
  username: string;
  role: string;
  fullName?: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  isFirstLogin: boolean;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static resources and auth APIs are always allowed
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/openapi') ||
    pathname.startsWith('/api/docs') ||
    pathname.startsWith('/admissions/apply') ||
    pathname.startsWith('/admissions/track') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/school-logo.png') ||
    pathname.startsWith('/google-services.json') ||
    pathname.startsWith('/firebase-messaging-sw.js')
  ) {
    return NextResponse.next();
  }

  // 2. Read Session Cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;
  let session: SessionPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as unknown as SessionPayload;
    } catch {
      session = null;
    }
  }

  // Helper for role-based portal destination
  const getRoleDestination = (s: SessionPayload) => {
    if (s.isFirstLogin) return '/change-password';
    if (s.role === 'TEACHER') return '/teacher';
    if (s.role === 'STUDENT') return '/student';
    if (s.role === 'PARENT') return '/parent';
    if (s.role === 'ACCOUNTANT') return '/admin/fees';
    if (s.role === 'LIBRARIAN') return '/admin/library';
    return '/admin';
  };

  // 3. PERSISTENT LOGGED-IN SESSION ROUTING:
  // If user is already logged in and accesses root "/" or "/login", redirect directly to their active portal
  if (pathname === '/' || pathname === '/login') {
    if (session) {
      const destination = getRoleDestination(session);
      return NextResponse.redirect(new URL(destination, req.url));
    }
    // Unlogged / First-time user: Show public school website or login screen normally
    return NextResponse.next();
  }

  // 4. Protected Route Enforcement (Requires authentication)
  const isProtected =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/parent') ||
    pathname.startsWith('/change-password');

  if (isProtected) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Force password change on first login
    if (session.isFirstLogin && pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', req.url));
    }

    // -------------------------------------------------------------
    // STRICT ROLE ISOLATION RULES (Zero Cross-Portal Access)
    // -------------------------------------------------------------

    // A. STUDENT ISOLATION:
    if (session.role === 'STUDENT') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/parent')) {
        return NextResponse.redirect(new URL('/student', req.url));
      }
    }

    // B. TEACHER ISOLATION:
    if (session.role === 'TEACHER') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/student') || pathname.startsWith('/parent')) {
        return NextResponse.redirect(new URL('/teacher', req.url));
      }
    }

    // C. PARENT ISOLATION:
    if (session.role === 'PARENT') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/student')) {
        return NextResponse.redirect(new URL('/parent', req.url));
      }
    }

    // D. ADMIN AREA RESTRICTION (Only Super Admin & Admin can access /admin):
    if (pathname.startsWith('/admin')) {
      if (
        session.role !== 'SUPER_ADMIN' &&
        session.role !== 'ADMIN' &&
        session.role !== 'ACCOUNTANT' &&
        session.role !== 'LIBRARIAN'
      ) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      if (
        session.role === 'ACCOUNTANT' &&
        !pathname.startsWith('/admin/fees') &&
        !pathname.startsWith('/admin/reports') &&
        !pathname.startsWith('/admin/audit-logs') &&
        pathname !== '/admin'
      ) {
        return NextResponse.redirect(new URL('/admin/fees', req.url));
      }

      if (
        session.role === 'LIBRARIAN' &&
        !pathname.startsWith('/admin/library') &&
        pathname !== '/admin'
      ) {
        return NextResponse.redirect(new URL('/admin/library', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/change-password',
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/parent/:path*',
  ],
};
