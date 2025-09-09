import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { parseIntParam } from '@/utils/validation';

/**
 * @openapi
 * /messages/conversations/{id}/messages/{mid}/reactions:
 *   post:
 *     summary: Add Message Reaction
 *     description: Add an emoji reaction to a message (only for conversation members)
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
 *       - in: path
 *         name: mid
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Message unique ID
 *         example: 15
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 maxLength: 16
 *                 description: Emoji reaction
 *                 example: "👍"
 *           example:
 *             emoji: "👍"
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid ID or emoji
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid emoji"
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

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; mid: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, mid: midParam } = await ctx.params;
  const cid = parseIntParam(id);
  const mid = parseIntParam(midParam);
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
 * @openapi
 *   delete:
 *     summary: Remove Message Reaction
 *     description: Remove an emoji reaction from a message (only for conversation members)
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
 *       - in: path
 *         name: mid
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Message unique ID
 *         example: 15
 *       - in: query
 *         name: emoji
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 16
 *         description: Emoji reaction to remove
 *         example: "👍"
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid ID or emoji
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid emoji"
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
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; mid: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, mid: midParam } = await ctx.params;
  const cid = parseIntParam(id);
  const mid = parseIntParam(midParam);
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
