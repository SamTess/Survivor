import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PasswordResetService } from '../../../../infrastructure/services/PasswordResetService';
import { hashPassword } from '../../../../infrastructure/security/auth';

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

const passwordResetService = new PasswordResetService();

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Reset user password using a valid reset token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *                 example: "abc123def456"
 *               password:
 *                 type: string
 *                 description: New password (minimum 8 characters)
 *                 minLength: 8
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Missing token/password or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token and password are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body || {};

    if (!token || !password) {
      return NextResponse.json({
        error: 'Token and password are required'
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({
        error: 'Password must contain at least 8 characters'
      }, { status: 400 });
    }

    const { userId, valid } = await passwordResetService.validateResetToken(token);

    if (!valid) {
      return NextResponse.json({
        error: 'Invalid or expired token'
      }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    await prisma.s_USER.update({
      where: { id: userId },
      data: { password_hash: hashedPassword }
    });

    await passwordResetService.useResetToken(token);

    return NextResponse.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error during password reset:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * @openapi
 * /auth/reset-password:
 *   get:
 *     summary: Validate Reset Token
 *     description: Validate if a password reset token is still valid
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *         example: "abc123def456"
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   description: Whether the token is valid
 *                   example: true
 *       400:
 *         description: Token is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        error: 'Token is required'
      }, { status: 400 });
    }

    const result = await passwordResetService.validateResetToken(token);

    return NextResponse.json({ valid: result.valid });

  } catch (error) {
    console.error('❌ Error during token validation:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
