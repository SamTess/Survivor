import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { Prisma } from '@prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { encryptText, decryptText } from '@/infrastructure/security/crypto';
import { isNonEmptyString, parseIntParam } from '@/utils/validation';

/**
 * @api {get} /messages/conversations/:id/messages Get Conversation Messages
 * @apiName GetConversationMessages
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Retrieve all messages in a specific conversation
 *
 * @apiParam {Number} id Conversation ID
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiSuccess {Object[]} messages Array of message objects
 * @apiSuccess {Number} messages.id Message ID
 * @apiSuccess {Number} messages.sender_id Sender user ID
 * @apiSuccess {String} messages.content Decrypted message content
 * @apiSuccess {String} messages.sent_at Send timestamp
 * @apiSuccess {Object} [messages.reactions] Message reactions by emoji
 * @apiSuccess {Number} messages.reactions.emoji Count of reactions for each emoji
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "messages": [
 *         {
 *           "id": 1,
 *           "sender_id": 1,
 *           "content": "Hello everyone!",
 *           "sent_at": "2024-01-15T10:00:00.000Z",
 *           "reactions": {
 *             "👍": 2,
 *             "❤️": 1
 *           }
 *         },
 *         {
 *           "id": 2,
 *           "sender_id": 2,
 *           "content": "Hi there!",
 *           "sent_at": "2024-01-15T10:01:00.000Z"
 *         }
 *       ]
 *     }
 *
 * @apiError (Error 400) {String} error Invalid conversation ID
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 * @apiError (Error 403) {String} error Forbidden - not a member of this conversation
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

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cid = parseIntParam(ctx.params.id);
  if (!cid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  if (!(await ensureMember(cid, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const rows = await prisma.s_MESSAGE.findMany({
    where: { conversation_id: cid },
    orderBy: { sent_at: 'asc' },
    select: { id: true, sender_id: true, content: true, sent_at: true },
  });
  const ids = rows.map((r) => r.id);
  let reactionsMap = new Map<number, Record<string, number>>();
  if (ids.length > 0) {
    try {
      const rx = await prisma.$queryRaw<{ message_id: number; emoji: string; count: number }[]>(Prisma.sql`
        SELECT message_id, emoji, COUNT(*)::int as count
        FROM "S_MESSAGE_REACTION"
        WHERE message_id IN (${Prisma.join(ids)})
        GROUP BY message_id, emoji
      `);
      reactionsMap = rx.reduce((acc, row) => {
        const cur = acc.get(row.message_id) ?? {};
        cur[row.emoji] = (cur[row.emoji] ?? 0) + Number(row.count || 0);
        acc.set(row.message_id, cur);
        return acc;
      }, new Map<number, Record<string, number>>());
    } catch {
      reactionsMap = new Map();
    }
  }
  const messages = rows.map((r) => ({
    id: r.id,
    sender_id: r.sender_id,
    content: safeDecrypt(r.content),
    sent_at: r.sent_at,
    reactions: reactionsMap.get(r.id) || undefined,
  }));
  return NextResponse.json({ messages });
}

function safeDecrypt(payload: string): string {
  try { return decryptText(payload); } catch { return '[unreadable]'; }
}

/**
 * @api {post} /messages/conversations/:id/messages Send Message
 * @apiName SendMessage
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Send a new message to a conversation
 *
 * @apiParam {Number} id Conversation ID
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiParam {String} content Message content (max 5000 characters)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "content": "Hello everyone! How are you doing today?"
 *     }
 *
 * @apiSuccess {Number} id Created message ID
 * @apiSuccess {String} sent_at Send timestamp
 * @apiSuccess {Number} sender_id Sender user ID
 * @apiSuccess {String} content Message content (echoed back)
 * @apiSuccess {Boolean} ok Success status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "id": 15,
 *       "sent_at": "2024-01-15T15:30:00.000Z",
 *       "sender_id": 1,
 *       "content": "Hello everyone! How are you doing today?",
 *       "ok": true
 *     }
 *
 * @apiError (Error 400) {String} error Invalid conversation ID or message content
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 * @apiError (Error 403) {String} error Forbidden - not a member of this conversation
 * @apiError (Error 500) {String} error Encryption error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid content"
 *     }
 */
export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cid = parseIntParam(ctx.params.id);
  if (!cid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  if (!(await ensureMember(cid, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === 'string' ? body.content.slice(0, 5000) : '';
  if (!isNonEmptyString(content, 5000)) return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  let encrypted: string;
  try {
    encrypted = encryptText(content);
  } catch {
    return NextResponse.json({ error: 'Encryption error' }, { status: 500 });
  }
  const msg = await prisma.s_MESSAGE.create({
    data: { conversation_id: cid, sender_id: userId, content: encrypted },
    select: { id: true, sent_at: true, sender_id: true },
  });
  try {
    await prisma.$executeRawUnsafe(
      `SELECT pg_notify('message_new', $1)`,
      JSON.stringify({ type: 'message:new', conversationId: cid, messageId: msg.id, at: Date.now() })
    );
  } catch {}
  return NextResponse.json({ id: msg.id, sent_at: msg.sent_at, sender_id: msg.sender_id, content, ok: true }, { status: 201 });
}
