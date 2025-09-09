import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { parseIntParam } from '@/utils/validation';

/**
 * @openapi
 * /messages/conversations/{id}/messages/{mid}:
 *   delete:
 *     summary: Delete Message
 *     description: Delete a specific message (only by the message sender)
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
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid conversation or message ID
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
 *         description: Forbidden - not a member of conversation or not message sender
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not allowed"
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not found"
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

export async function DELETE(req: NextRequest, ctx: { params: { id: string; mid: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cid = parseIntParam(ctx.params.id);
  const mid = parseIntParam(ctx.params.mid);
  if (!cid || !mid) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  if (!(await ensureMember(cid, userId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const msg = await prisma.s_MESSAGE.findUnique({ where: { id: mid }, select: { id: true, sender_id: true, conversation_id: true } });
  if (!msg || msg.conversation_id !== cid) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (msg.sender_id !== userId) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  await prisma.s_MESSAGE.delete({ where: { id: mid } });
  try {
    await prisma.$executeRawUnsafe(
      `SELECT pg_notify('message_new', $1)`,
      JSON.stringify({ type: 'message:deleted', conversationId: cid, messageId: mid, at: Date.now() })
    );
  } catch {}
  return NextResponse.json({ ok: true });
}
