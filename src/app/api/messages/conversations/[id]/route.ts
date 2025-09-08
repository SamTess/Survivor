import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';

/**
 * @api {delete} /messages/conversations/:id Delete Conversation
 * @apiName DeleteConversation
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Delete a conversation and all its messages (only for conversation members)
 *
 * @apiParam {Number} id Conversation unique ID
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiSuccess {Boolean} ok Operation success status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ok": true
 *     }
 *
 * @apiError (Error 400) {String} error Invalid conversation ID
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 * @apiError (Error 403) {String} error Forbidden - not a member of this conversation
 * @apiError (Error 404) {String} error Conversation not found
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "Forbidden"
 *     }
 */

function getUserId(req: NextRequest): number | null {
  const token = req.cookies.get('auth')?.value;
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  const payload = verifyJwt(token, secret);
  return payload?.userId ?? null;
}

async function ensureMember(conversationId: number, userId: number): Promise<boolean> {
  const link = await prisma.s_CONVERSATION_USER.findUnique({
    where: { conversation_id_user_id: { conversation_id: conversationId, user_id: userId } },
  });
  return !!link;
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cid = Number.parseInt(ctx.params.id, 10);
  if (!Number.isFinite(cid) || cid <= 0) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const exists = await prisma.s_CONVERSATION.findUnique({ where: { id: cid }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await ensureMember(cid, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.s_CONVERSATION.delete({ where: { id: cid } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
