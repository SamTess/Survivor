import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import { hashPassword, signJwt, getAuthSecret } from '../../../../infrastructure/security/auth';
import { normalizeRole } from '../../../../utils/roleUtils';

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body || {};
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
  const existing = await prisma.s_USER.findFirst({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already used' }, { status: 409 });
    const password_hash = hashPassword(password);
    const user = await prisma.s_USER.create({ data: { name, email, password_hash, address: '', role: 'USER' } });
    const token = signJwt({ userId: user.id }, 60 * 60 * 24 * 7, getAuthSecret());
    const normalizedRole = normalizeRole(user.role);
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: normalizedRole });
    res.cookies.set('auth', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', path: '/' });
    return res;
  } catch (e) {
    console.error('Signup error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
