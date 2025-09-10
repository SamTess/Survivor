import { NextRequest } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { eventBus } from '@/infrastructure/realtime/eventBus';
import { ensurePgListener } from '@/infrastructure/realtime/pgPubSub';

/**
 * @openapi
 * /messages/stream:
 *   get:
 *     summary: Real-time Message Stream
 *     description: |
 *       Establish a Server-Sent Events (SSE) connection for real-time message updates.
 *
 *       This endpoint provides a persistent SSE connection that streams real-time updates for:
 *       - New messages in user's conversations
 *       - Message deletions
 *       - Reaction additions/removals
 *       - Connection health checks (ping every 25 seconds)
 *
 *       The stream automatically filters events to only include conversations the user is a member of.
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Server-Sent Events stream established successfully
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: |
 *                 Server-Sent Events stream with JSON data objects.
 *
 *                 Event types:
 *                 - `ready`: Connection established
 *                 - `message:new`: New message posted
 *                 - `message:deleted`: Message was deleted
 *                 - `reaction:update`: Reaction added or removed
 *                 - `ping`: Keepalive ping (every 25 seconds)
 *             examples:
 *               ready:
 *                 summary: Connection ready
 *                 value: 'data: {"type":"ready"}'
 *               new_message:
 *                 summary: New message event
 *                 value: 'data: {"type":"message:new","conversationId":1,"messageId":123,"at":1642600000000}'
 *               reaction_update:
 *                 summary: Reaction update event
 *                 value: 'data: {"type":"reaction:update","conversationId":1,"messageId":123,"emoji":"👍","at":1642600000000}'
 *               message_deleted:
 *                 summary: Message deleted event
 *                 value: 'data: {"type":"message:deleted","conversationId":1,"messageId":123,"at":1642600000000}'
 *               ping:
 *                 summary: Keepalive ping
 *                 value: 'data: {"type":"ping","t":1642600000000}'
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: "text/event-stream"
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: "no-cache, no-transform"
 *           Connection:
 *             schema:
 *               type: string
 *               example: "keep-alive"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "unauthorized"
 *     x-codeSamples:
 *       - lang: JavaScript
 *         label: EventSource Connection
 *         source: |
 *           const eventSource = new EventSource('/messages/stream');
 *
 *           eventSource.onmessage = function(event) {
 *             const data = JSON.parse(event.data);
 *             console.log('Received event:', data);
 *
 *             switch(data.type) {
 *               case 'ready':
 *                 console.log('Stream connection ready');
 *                 break;
 *               case 'message:new':
 *                 console.log('New message in conversation', data.conversationId);
 *                 break;
 *               case 'reaction:update':
 *                 console.log('Reaction update:', data.emoji, data.removed ? 'removed' : 'added');
 *                 break;
 *               case 'ping':
 *                 console.log('Keepalive ping received');
 *                 break;
 *             }
 *           };
 *
 *           eventSource.onerror = function(event) {
 *             console.error('EventSource error:', event);
 *           };
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
