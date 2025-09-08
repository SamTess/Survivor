import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '../../../../infrastructure/security/auth';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * @api {get} /auth/me Get Current User
 * @apiName GetCurrentUser
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiDescription Get information about the currently authenticated user
 * 
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 * 
 * @apiSuccess {Number} id User ID
 * @apiSuccess {String} name User's full name
 * @apiSuccess {String} email User's email address
 * @apiSuccess {String} role User's role (ADMIN, MODERATOR, USER)
 * @apiSuccess {String[]} permissions User's permissions
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "name": "John Doe",
 *       "email": "user@example.com",
 *       "role": "USER",
 *       "permissions": ["read:profile", "write:profile"]
 *     }
 * 
 * @apiError (Error 401) {String} error Unauthorized - invalid or missing token
 * @apiError (Error 404) {String} error User not found
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "unauthorized"
 *     }
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  const payload = verifyJwt(token, secret);
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const user = await prisma.s_USER.findUnique({ where: { id: payload.userId }, include: { permissions: true } });
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const role = (['ADMIN','MODERATOR','USER'].includes(user.role) ? user.role : 'USER') as 'ADMIN' | 'MODERATOR' | 'USER';
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role, permissions: user.permissions.map(p => p.name) });
}
