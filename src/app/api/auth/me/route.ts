import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '../../../../infrastructure/security/auth';

interface GlobalWithPrisma { prisma?: PrismaClient }
const globalForPrisma = global as unknown as GlobalWithPrisma;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get Current User
 *     description: Get information about the currently authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: User ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: User's full name
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User's email address
 *                   example: "user@example.com"
 *                 role:
 *                   type: string
 *                   enum: [ADMIN, MODERATOR, USER]
 *                   description: User's role
 *                   example: "USER"
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: User's permissions
 *                   example: ["read:profile", "write:profile"]
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "not found"
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
