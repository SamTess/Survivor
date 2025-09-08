import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { isNonEmptyString } from '@/utils/validation';

/**
 * @api {get} /messages/conversations Get User Conversations
 * @apiName GetConversations
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Retrieve all conversations for the authenticated user
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiSuccess {Object[]} conversations Array of conversation objects
 * @apiSuccess {Number} conversations.id Conversation ID
 * @apiSuccess {String} conversations.name Conversation name (optional)
 * @apiSuccess {String} conversations.created_at Creation timestamp
 * @apiSuccess {Object[]} conversations.users Array of conversation participants
 * @apiSuccess {Number} conversations.users.user_id User ID
 * @apiSuccess {Object} conversations.users.user User object
 * @apiSuccess {Number} conversations.users.user.id User ID
 * @apiSuccess {String} conversations.users.user.name User name
 * @apiSuccess {Object[]} conversations.messages Array of last message (if any)
 * @apiSuccess {Number} conversations.messages.id Message ID
 * @apiSuccess {String} conversations.messages.sent_at Send timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "conversations": [
 *         {
 *           "id": 1,
 *           "name": "Project Discussion",
 *           "created_at": "2024-01-15T10:00:00.000Z",
 *           "users": [
 *             {
 *               "user_id": 1,
 *               "user": {
 *                 "id": 1,
 *                 "name": "John Doe"
 *               }
 *             },
 *             {
 *               "user_id": 2,
 *               "user": {
 *                 "id": 2,
 *                 "name": "Jane Smith"
 *               }
 *             }
 *           ],
 *           "messages": [
 *             {
 *               "id": 5,
 *               "sent_at": "2024-01-15T10:30:00.000Z"
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Unauthorized"
 *     }
 */

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

/**
 * @api {post} /messages/conversations Create New Conversation
 * @apiName CreateConversation
 * @apiGroup Messages
 * @apiVersion 0.1.0
 * @apiDescription Create a new conversation with specified participants
 *
 * @apiHeader {String} Cookie Authentication cookie with JWT token
 *
 * @apiParam {Number[]} participantIds Array of user IDs to include in conversation
 * @apiParam {String} [name] Optional conversation name
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "participantIds": [2, 3, 5],
 *       "name": "Project Team Discussion"
 *     }
 *
 * @apiSuccess {Object} conversation Created conversation object
 * @apiSuccess {Number} conversation.id Conversation ID
 * @apiSuccess {String} conversation.name Conversation name (if provided)
 * @apiSuccess {String} conversation.created_at Creation timestamp
 * @apiSuccess {Object[]} conversation.users Array of conversation participants
 * @apiSuccess {Number} conversation.users.user_id User ID
 * @apiSuccess {Object} conversation.users.user User object
 * @apiSuccess {Number} conversation.users.user.id User ID
 * @apiSuccess {String} conversation.users.user.name User name
 * @apiSuccess {Object[]} conversation.messages Array of messages (empty for new conversation)
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "conversation": {
 *         "id": 15,
 *         "name": "Project Team Discussion",
 *         "created_at": "2024-01-15T15:00:00.000Z",
 *         "users": [
 *           {
 *             "user_id": 1,
 *             "user": {
 *               "id": 1,
 *               "name": "Current User"
 *             }
 *           },
 *           {
 *             "user_id": 2,
 *             "user": {
 *               "id": 2,
 *               "name": "John Doe"
 *             }
 *           }
 *         ],
 *         "messages": []
 *       }
 *     }
 *
 * @apiError (Error 400) {String} error Missing or invalid participant IDs
 * @apiError (Error 401) {String} error Unauthorized - authentication required
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "participantIds required"
 *     }
 */
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
