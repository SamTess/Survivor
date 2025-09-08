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
 * @api {post} /auth/request-reset Request Password Reset
 * @apiName RequestPasswordReset
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiDescription Request a password reset link to be sent to the user's email
 *
 * @apiParam {String} email User's email address
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "user@example.com"
 *     }
 *
 * @apiSuccess {String} message Confirmation message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Si cet email existe dans notre système, un lien de réinitialisation a été envoyé."
 *     }
 *
 * @apiError (Error 400) {String} error Email is required
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Email requis"
 *     }
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
