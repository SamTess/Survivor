import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

/**
 * @api {post} /auth/logout User Logout
 * @apiName LogoutUser
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiDescription Log out a user by clearing the authentication cookie
 *
 * @apiSuccess {Boolean} ok Success status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ok": true
 *     }
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('auth', '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
