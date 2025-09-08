import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { parseIntParam } from '@/utils/validation';

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
