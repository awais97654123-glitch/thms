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

  // 1. Allow static files, public routes, and auth API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/openapi') ||
    pathname.startsWith('/api/docs') ||
    pathname.startsWith('/admissions/apply') ||
    pathname.startsWith('/admissions/track') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname === '/'
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

  // 3. If accessing /login while already logged in -> auto-redirect to respective portal
  if (pathname === '/login') {
    if (session) {
      if (session.isFirstLogin) {
        return NextResponse.redirect(new URL('/change-password', req.url));
      }
      if (session.role === 'TEACHER') {
        return NextResponse.redirect(new URL('/teacher', req.url));
      }
      if (session.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student', req.url));
      }
      if (session.role === 'PARENT') {
        return NextResponse.redirect(new URL('/parent', req.url));
      }
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // 4. Protected Route Checking (Requires authentication)
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
        // Forbidden: Redirect directly to their own student dashboard
        return NextResponse.redirect(new URL('/student', req.url));
      }
    }

    // B. TEACHER ISOLATION:
    if (session.role === 'TEACHER') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/student') || pathname.startsWith('/parent')) {
        // Forbidden: Redirect directly to teacher portal
        return NextResponse.redirect(new URL('/teacher', req.url));
      }
    }

    // C. PARENT ISOLATION:
    if (session.role === 'PARENT') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/student')) {
        // Forbidden: Redirect directly to parent portal
        return NextResponse.redirect(new URL('/parent', req.url));
      }
    }

    // D. ADMIN AREA RESTRICTION (Only Super Admin & Admin can access /admin):
    if (pathname.startsWith('/admin')) {
      if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ACCOUNTANT' && session.role !== 'LIBRARIAN') {
        // Unauthorized role trying to access admin
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Accountant specific boundaries
      if (session.role === 'ACCOUNTANT' && !pathname.startsWith('/admin/fees') && !pathname.startsWith('/admin/reports') && !pathname.startsWith('/admin/audit-logs') && pathname !== '/admin') {
        return NextResponse.redirect(new URL('/admin/fees', req.url));
      }

      // Librarian specific boundaries
      if (session.role === 'LIBRARIAN' && !pathname.startsWith('/admin/library') && pathname !== '/admin') {
        return NextResponse.redirect(new URL('/admin/library', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/parent/:path*',
    '/login',
    '/change-password',
  ],
};
