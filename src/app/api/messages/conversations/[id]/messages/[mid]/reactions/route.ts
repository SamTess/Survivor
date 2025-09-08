import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { parseIntParam } from '@/utils/validation';

/**
 * @api {post} /messages/conversations/:id/messages/:mid/reactions Add Message Reaction
 * @apiName AddMessageReaction
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Add an emoji reaction to a message
 *
 * @apiParam {Number} id Conversation ID
 * @apiParam {Number} mid Message ID
 * @apiParam {String} emoji Emoji reaction (max 16 characters)
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "emoji": "👍"
 *     }
 *
 * @apiSuccess {Boolean} ok Operation success status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ok": true
 *     }
 *
 * @apiError (Error 400) {String} error Invalid ID or emoji
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 * @apiError (Error 403) {String} error Forbidden - not a member of this conversation
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid emoji"
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

export async function POST(req: NextRequest, ctx: { params: { id: string; mid: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cid = parseIntParam(ctx.params.id);
  const mid = parseIntParam(ctx.params.mid);
  if (!cid || !mid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  if (!(await ensureMember(cid, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const emoji = typeof body?.emoji === 'string' ? body.emoji.slice(0, 16) : '';
  if (!emoji) return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
  await prisma.$executeRawUnsafe(
    `INSERT INTO "S_MESSAGE_REACTION" (message_id, user_id, emoji)
     VALUES ($1, $2, $3)
     ON CONFLICT (message_id, user_id, emoji) DO NOTHING`,
    mid, userId, emoji
  );
  try {
    await prisma.$executeRawUnsafe(
      `SELECT pg_notify('message_new', $1)`,
      JSON.stringify({ type: 'reaction:update', conversationId: cid, messageId: mid, emoji, at: Date.now() })
    );
  } catch {}
  return NextResponse.json({ ok: true });
}

/**
 * @api {delete} /messages/conversations/:id/messages/:mid/reactions Remove Message Reaction
 * @apiName RemoveMessageReaction
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Remove an emoji reaction from a message
 *
 * @apiParam {Number} id Conversation ID
 * @apiParam {Number} mid Message ID
 * @apiQuery {String} emoji Emoji reaction to remove
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
 * @apiError (Error 400) {String} error Invalid ID or emoji
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 * @apiError (Error 403) {String} error Forbidden - not a member of this conversation
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid emoji"
 *     }
 */
export async function DELETE(req: NextRequest, ctx: { params: { id: string; mid: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cid = parseIntParam(ctx.params.id);
  const mid = parseIntParam(ctx.params.mid);
  if (!cid || !mid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  if (!(await ensureMember(cid, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const emoji = searchParams.get('emoji') || '';
  if (!emoji) return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
  await prisma.$executeRawUnsafe(
    `DELETE FROM "S_MESSAGE_REACTION" WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
    mid, userId, emoji
  );
  try {
    await prisma.$executeRawUnsafe(
      `SELECT pg_notify('message_new', $1)`,
      JSON.stringify({ type: 'reaction:update', conversationId: cid, messageId: mid, emoji, at: Date.now(), removed: true })
    );
  } catch {}
  return NextResponse.json({ ok: true });
}
