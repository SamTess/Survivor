import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User Logout
 *     description: Log out a user by clearing the authentication cookie
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth', '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
