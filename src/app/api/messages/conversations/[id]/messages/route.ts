import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { Prisma } from '@prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { encryptText, decryptText } from '@/infrastructure/security/crypto';
import { isNonEmptyString, parseIntParam } from '@/utils/validation';

/**
 * @openapi
 * /messages/conversations/{id}/messages:
 *   get:
 *     summary: Get Conversation Messages
 *     description: Retrieve all messages in a specific conversation (only for conversation members)
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Conversation unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Message unique ID
 *                         example: 1
 *                       sender_id:
 *                         type: integer
 *                         description: Sender user ID
 *                         example: 1
 *                       content:
 *                         type: string
 *                         description: Decrypted message content
 *                         example: "Hello everyone!"
 *                       sent_at:
 *                         type: string
 *                         format: date-time
 *                         description: Send timestamp
 *                         example: "2024-01-15T10:00:00.000Z"
 *                       reactions:
 *                         type: object
 *                         description: Message reactions by emoji (optional)
 *                         additionalProperties:
 *                           type: integer
 *                         example:
 *                           "👍": 2
 *                           "❤️": 1
 *       400:
 *         description: Invalid conversation ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid id"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - not a member of this conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
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

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const cid = parseIntParam(id);
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
 * @openapi
 * /messages/conversations/{id}/messages:
 *   post:
 *     summary: Send Message
 *     description: Send a new message to a conversation (only for conversation members)
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Conversation unique ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 description: Message content (will be encrypted)
 *                 example: "Hello everyone! How are you doing today?"
 *           example:
 *             content: "Hello everyone! How are you doing today?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Created message ID
 *                   example: 15
 *                 sent_at:
 *                   type: string
 *                   format: date-time
 *                   description: Send timestamp
 *                   example: "2024-01-15T15:30:00.000Z"
 *                 sender_id:
 *                   type: integer
 *                   description: Sender user ID
 *                   example: 1
 *                 content:
 *                   type: string
 *                   description: Message content (echoed back)
 *                   example: "Hello everyone! How are you doing today?"
 *                 ok:
 *                   type: boolean
 *                   description: Success status
 *                   example: true
 *       400:
 *         description: Invalid conversation ID or message content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid content"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - not a member of this conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *       500:
 *         description: Encryption error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Encryption error"
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const cid = parseIntParam(id);
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
