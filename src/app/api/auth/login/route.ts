import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, signJwt, getAuthSecret } from '../../../../infrastructure/security/auth';
import { PasswordResetService } from '../../../../infrastructure/services/PasswordResetService';
import { EmailService } from '../../../../infrastructure/services/EmailService';
import { normalizeRole } from '../../../../utils/roleUtils';

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

const passwordResetService = new PasswordResetService();

const emailConfig = {
  host: process.env.EMAIL_HOST || 'localhost',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  from: process.env.EMAIL_FROM || 'noreply@jeb-incubator.com',
  rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED !== 'false',
};

const emailService = new EmailService(emailConfig);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await prisma.s_USER.findFirst({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.password_hash || user.password_hash.trim() === '') {
      try {
        const resetToken = await passwordResetService.createResetToken(user.id);

        if (process.env.NODE_ENV === 'development' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
          const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
          return NextResponse.json({
            error: 'No password set. Reset link has been generated (check server console).',
            requiresPasswordReset: true,
            devMode: true,
            resetUrl: resetUrl
          }, { status: 401 });
        }
        await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);

        return NextResponse.json({
          error: 'No password set. A password creation email has been sent.',
          requiresPasswordReset: true
        }, { status: 401 });
      } catch (emailError) {
        console.error('Password reset email sending error:', emailError);
        return NextResponse.json({
          error: 'No password set. Please contact the administrator.',
          requiresPasswordReset: true
        }, { status: 401 });
      }
    }

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signJwt({ userId: user.id }, 60 * 60 * 24 * 7, getAuthSecret());
    const normalizedRole = normalizeRole(user.role);
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: normalizedRole });
    res.cookies.set('auth', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', path: '/' });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
