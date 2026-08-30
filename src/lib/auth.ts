import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import prisma from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'the_hayatabad_model_school_super_secret_jwt_key_2026_erp'
);

export const COOKIE_NAME = 'thms_session';

export interface UserSession {
  userId: string;
  username: string;
  role: string;
  email?: string;
  fullName?: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  isFirstLogin: boolean;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<UserSession | null> {
  try {
    let token: string | undefined;

    if (req?.cookies) {
      token = req.cookies.get(COOKIE_NAME)?.value;
    }

    if (!token && req?.headers) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
        if (match) token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      try {
        const cookieStore = cookies();
        token = cookieStore.get(COOKIE_NAME)?.value;
      } catch {
        // Ignored in non-request contexts
      }
    }

    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getDetailedUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: {
        include: {
          class: true,
          section: true,
          session: true,
          parent: true,
        },
      },
      teacher: {
        include: {
          managedSections: {
            include: { class: true },
          },
          subjects: {
            include: { class: true },
          },
        },
      },
      parent: {
        include: {
          students: {
            include: {
              class: true,
              section: true,
              session: true,
            },
          },
        },
      },
      staff: true,
    },
  });
}
