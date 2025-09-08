import { NextRequest } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { eventBus } from '@/infrastructure/realtime/eventBus';
import { ensurePgListener } from '@/infrastructure/realtime/pgPubSub';

function getUserId(req: NextRequest): number | null {
  const token = req.cookies.get('auth')?.value;
  const secret = process.env.AUTH_SECRET || 'dev-secret';
  const payload = verifyJwt(token, secret);
  return payload?.userId ?? null;
}

export async function GET(req: NextRequest) {
  await ensurePgListener();
  const userId = getUserId(req);
  if (!userId) {
    return new Response('unauthorized', { status: 401 });
  }
  const links = await prisma.s_CONVERSATION_USER.findMany({ where: { user_id: userId }, select: { conversation_id: true } });
  const convoSet = new Set<number>(links.map(l => l.conversation_id));
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      const write = (data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      write({ type: 'ready' });
      const unsubscribe = eventBus.subscribe((evt) => {
        if (convoSet.has(evt.conversationId)) write(evt);
      });

      const interval = setInterval(() => write({ type: 'ping', t: Date.now() }), 25000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        unsubscribe();
        try { controller.close(); } catch {}
      };
      req.signal?.addEventListener('abort', close);
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
