import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import { hashPassword, signJwt, getAuthSecret } from '../../../../infrastructure/security/auth';

interface GlobalWithPrisma {
  prisma?: PrismaClient;
}
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * @api {post} /auth/signup User Registration
 * @apiName RegisterUser
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiDescription Register a new user account
 *
 * @apiParam {String} name User's full name
 * @apiParam {String} email User's email address
 * @apiParam {String} password User's password
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "password": "securepassword123"
 *     }
 *
 * @apiSuccess {Number} id User ID
 * @apiSuccess {String} name User's full name
 * @apiSuccess {String} email User's email address
 * @apiSuccess {String} role User's role
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "role": "USER"
 *     }
 *
 * @apiError (Error 400) {String} error Missing required fields
 * @apiError (Error 409) {String} error Email already in use
 * @apiError (Error 500) {String} error Server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "error": "Email already used"
 *     }
 */
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
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    res.cookies.set('auth', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', path: '/' });
    return res;
  } catch (e) {
    console.error('Signup error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
