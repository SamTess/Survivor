import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";
import { ContentType, EventType } from "../../../../domain/enums/Analytics";

/**
 * @openapi
 * /analytics/interaction:
 *   post:
 *     summary: Record User Interaction
 *     description: Record a user interaction event for analytics tracking
 *     tags:
 *       - Analytics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - contentType
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID (optional for anonymous tracking)
 *                 example: 1
 *               sessionId:
 *                 type: string
 *                 description: Session ID (optional)
 *                 example: "sess_123"
 *               eventType:
 *                 type: string
 *                 description: Event type
 *                 enum: [CLICK, VIEW, DOWNLOAD, LIKE, SHARE, COMMENT]
 *                 example: "CLICK"
 *               contentType:
 *                 type: string
 *                 description: Content type
 *                 enum: [STARTUP, NEWS, EVENT, USER, FOUNDER, PARTNER]
 *                 example: "STARTUP"
 *               contentId:
 *                 type: integer
 *                 description: Content ID (optional)
 *                 example: 5
 *               metadata:
 *                 type: object
 *                 description: Additional metadata (optional)
 *                 example: {"button": "like"}
 *               referrerHost:
 *                 type: string
 *                 description: Referrer host (optional)
 *                 example: "google.com"
 *               utmSource:
 *                 type: string
 *                 description: UTM source parameter (optional)
 *                 example: "google"
 *               utmMedium:
 *                 type: string
 *                 description: UTM medium parameter (optional)
 *                 example: "cpc"
 *               utmCampaign:
 *                 type: string
 *                 description: UTM campaign parameter (optional)
 *                 example: "spring_sale"
 *               utmTerm:
 *                 type: string
 *                 description: UTM term parameter (optional)
 *                 example: "startup"
 *               utmContent:
 *                 type: string
 *                 description: UTM content parameter (optional)
 *                 example: "logolink"
 *     responses:
 *       200:
 *         description: Interaction recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid event type"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await analyticsService.recordInteraction({
      userId: body.userId ?? null,
      sessionId: body.sessionId ?? null,
      eventType: body.eventType as EventType,
      contentType: body.contentType as ContentType,
      contentId: body.contentId ?? null,
      metadata: body.metadata ?? null,
  ip: req.headers.get("x-forwarded-for")?.split(",")[0] || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
      referrerHost: body.referrerHost ?? null,
      utmSource: body.utmSource ?? null,
      utmMedium: body.utmMedium ?? null,
      utmCampaign: body.utmCampaign ?? null,
      utmTerm: body.utmTerm ?? null,
      utmContent: body.utmContent ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
