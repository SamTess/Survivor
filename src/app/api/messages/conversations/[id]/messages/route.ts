import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { Prisma } from '@prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { encryptText, decryptText } from '@/infrastructure/security/crypto';
import { isNonEmptyString, parseIntParam } from '@/utils/validation';

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
  // Reactions aggregate (emoji -> count) per message
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
  // Decrypt content and attach reactions
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
  // Notify Postgres channel for cross-instance realtime
  try {
    await prisma.$executeRawUnsafe(
      `SELECT pg_notify('message_new', $1)`,
      JSON.stringify({ type: 'message:new', conversationId: cid, messageId: msg.id, at: Date.now() })
    );
  } catch {}
  return NextResponse.json({ id: msg.id, sent_at: msg.sent_at, sender_id: msg.sender_id, content, ok: true }, { status: 201 });
}
