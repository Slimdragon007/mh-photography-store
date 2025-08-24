import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = hashPassword(password);
  return hash === ADMIN_PASSWORD_HASH;
}

export async function createSession(): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('admin-session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
  return sessionId;
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  return !!session?.value;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
}

