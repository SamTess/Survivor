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
