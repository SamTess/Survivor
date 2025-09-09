import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '../../../../infrastructure/security/auth';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  const payload = verifyJwt(token, secret);
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const user = await prisma.s_USER.findUnique({ where: { id: payload.userId }, include: { permissions: true } });
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const role = (['ADMIN','MODERATOR'].includes(user.role) ? user.role : 'visitor') as 'ADMIN' | 'MODERATOR' | 'visitor';
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role, permissions: user.permissions.map(p => p.name) });
}
