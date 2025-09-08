import { NextRequest } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { eventBus } from '@/infrastructure/realtime/eventBus';
import { ensurePgListener } from '@/infrastructure/realtime/pgPubSub';

/**
 * @api {get} /messages/stream Real-time Message Stream
 * @apiName MessageStream
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Establish a Server-Sent Events (SSE) connection for real-time message updates
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiSuccess {Stream} data Server-Sent Events stream
 * @apiSuccess {Object} event Event data object
 * @apiSuccess {String} event.type Event type (ready, message:new, message:deleted, reaction:update, ping)
 * @apiSuccess {Number} [event.conversationId] Conversation ID (for message events)
 * @apiSuccess {Number} [event.messageId] Message ID (for message/reaction events)
 * @apiSuccess {String} [event.emoji] Emoji (for reaction events)
 * @apiSuccess {Boolean} [event.removed] Whether reaction was removed (for reaction events)
 * @apiSuccess {Number} [event.at] Event timestamp
 * @apiSuccess {Number} [event.t] Ping timestamp
 *
 * @apiSuccessExample {text/event-stream} Success-Response:
 *     data: {"type":"ready"}
 *
 *     data: {"type":"message:new","conversationId":1,"messageId":123,"at":1642600000000}
 *
 *     data: {"type":"reaction:update","conversationId":1,"messageId":123,"emoji":"👍","at":1642600000000}
 *
 *     data: {"type":"ping","t":1642600000000}
 *
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 *
 * @apiErrorExample {text/plain} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     unauthorized
 *
 * @apiDescription This endpoint establishes a persistent SSE connection that streams real-time updates for:
 * - New messages in user's conversations
 * - Message deletions
 * - Reaction additions/removals
 * - Connection health checks (ping every 25 seconds)
 *
 * The stream automatically filters events to only include conversations the user is a member of.
 */

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
