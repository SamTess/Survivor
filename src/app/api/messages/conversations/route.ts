import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { isNonEmptyString } from '@/utils/validation';

function getUserId(req: NextRequest): number | null {
  const token = req.cookies.get('auth')?.value;
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  const payload = verifyJwt(token, secret);
  return payload?.userId ?? null;
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const convos = await prisma.s_CONVERSATION.findMany({
    where: { users: { some: { user_id: userId } } },
    include: {
      users: { include: { user: { select: { id: true, name: true } } } },
      messages: { orderBy: { sent_at: 'desc' }, take: 1, select: { id: true, sent_at: true } },
    },
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json({ conversations: convos });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { participantIds, name } = body as { participantIds?: number[]; name?: string };
  if (!Array.isArray(participantIds) || participantIds.length < 1) {
    return NextResponse.json({ error: 'participantIds required' }, { status: 400 });
  }
  const uniqueIds = Array.from(new Set([userId, ...participantIds.filter((n) => Number.isInteger(n) && n > 0)]));
  if (uniqueIds.length < 2) return NextResponse.json({ error: 'Need at least 2 participants' }, { status: 400 });
  const convo = await prisma.s_CONVERSATION.create({ data: { name: isNonEmptyString(name ?? '') ? name : null } });
  await prisma.s_CONVERSATION_USER.createMany({ data: uniqueIds.map((uid) => ({ conversation_id: convo.id, user_id: uid })) });
  const full = await prisma.s_CONVERSATION.findUnique({
    where: { id: convo.id },
    include: { users: { include: { user: { select: { id: true, name: true } } } }, messages: { orderBy: { sent_at: 'desc' }, take: 1, select: { id: true, sent_at: true } } }
  });
  return NextResponse.json({ conversation: full }, { status: 201 });
}
