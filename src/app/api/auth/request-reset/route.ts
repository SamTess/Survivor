import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PasswordResetService } from '../../../../infrastructure/services/PasswordResetService';
import { EmailService } from '../../../../infrastructure/services/EmailService';

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

/**
 * @openapi
 * /auth/request-reset:
 *   post:
 *     summary: Request Password Reset
 *     description: Request a password reset link to be sent to the user's email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Reset link sent (or would be sent if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Si cet email existe dans notre système, un lien de réinitialisation a été envoyé."
 *       400:
 *         description: Email is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email requis"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const user = await prisma.s_USER.findFirst({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json({
        message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.'
      });
    }

    const resetToken = await passwordResetService.createResetToken(user.id);

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({
        error: 'Error sending email'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.'
    });

  } catch (error) {
    console.error('Error during password reset request:', error);
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
