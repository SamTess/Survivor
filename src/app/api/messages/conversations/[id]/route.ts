import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';

/**
 * @openapi
 * /messages/conversations/{id}:
 *   delete:
 *     summary: Delete Conversation
 *     description: Delete a conversation and all its messages (only for conversation members)
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
 *         description: Conversation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
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
 *       404:
 *         description: Conversation not found
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
