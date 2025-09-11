import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';
import { verifyJwt } from '@/infrastructure/security/auth';
import { isNonEmptyString } from '@/utils/validation';

/**
 * @openapi
 * /messages/conversations:
 *   get:
 *     summary: Get User Conversations
 *     description: Retrieve all conversations for the authenticated user
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Conversation ID
 *                         example: 1
 *                       name:
 *                         type: string
 *                         nullable: true
 *                         description: Conversation name (optional)
 *                         example: "Project Discussion"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                         example: "2024-01-15T10:00:00.000Z"
 *                       users:
 *                         type: array
 *                         description: Array of conversation participants
 *                         items:
 *                           type: object
 *                           properties:
 *                             user_id:
 *                               type: integer
 *                               description: User ID
 *                               example: 1
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 name:
 *                                   type: string
 *                                   example: "John Doe"
 *                       messages:
 *                         type: array
 *                         description: Array of last message (if any)
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: Message ID
 *                               example: 5
 *                             sent_at:
 *                               type: string
 *                               format: date-time
 *                               description: Send timestamp
 *                               example: "2024-01-15T10:30:00.000Z"
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
 * @openapi
 * /messages/conversations:
 *   post:
 *     summary: Create New Conversation
 *     description: Create a new conversation with specified participants
 *     tags:
 *       - Messages
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantIds
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of user IDs to include in conversation
 *                 example: [2, 3, 5]
 *               name:
 *                 type: string
 *                 description: Optional conversation name
 *                 example: "Project Team Discussion"
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Conversation ID
 *                       example: 15
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       description: Conversation name (if provided)
 *                       example: "Project Team Discussion"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                       example: "2024-01-15T15:00:00.000Z"
 *                     users:
 *                       type: array
 *                       description: Array of conversation participants
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             description: User ID
 *                             example: 1
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: "Current User"
 *                     messages:
 *                       type: array
 *                       description: Array of messages (empty for new conversation)
 *                       items:
 *                         type: object
 *                       example: []
 *       400:
 *         description: Missing or invalid participant IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum: ["participantIds required", "Need at least 2 participants"]
 *                   example: "participantIds required"
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
