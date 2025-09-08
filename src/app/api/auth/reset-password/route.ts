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
 * @api {post} /auth/reset-password Reset Password
 * @apiName ResetPassword
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiDescription Reset user password using a valid reset token
 *
 * @apiParam {String} token Password reset token
 * @apiParam {String} password New password (minimum 8 characters)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "token": "abc123def456",
 *       "password": "newSecurePassword123"
 *     }
 *
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Password updated successfully"
 *     }
 *
 * @apiError (Error 400) {String} error Missing token/password or invalid token
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Token and password are required"
 *     }
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
 * @api {get} /auth/reset-password Validate Reset Token
 * @apiName ValidateResetToken
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiDescription Validate if a password reset token is still valid
 *
 * @apiParam {String} token Password reset token (as query parameter)
 *
 * @apiParamExample {url} Request-Example:
 *     /auth/reset-password?token=abc123def456
 *
 * @apiSuccess {Boolean} valid Whether the token is valid
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "valid": true
 *     }
 *
 * @apiError (Error 400) {String} error Token is required
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Token is required"
 *     }
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
