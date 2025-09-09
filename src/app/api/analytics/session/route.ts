import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";
import { ContentType } from "../../../../domain/enums/Analytics";

/**
 * @openapi
 * /analytics/session:
 *   post:
 *     summary: Start Analytics Session
 *     description: Start a new analytics session for tracking user interactions
 *     tags:
 *       - Analytics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentType
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID (optional for anonymous sessions)
 *                 example: 1
 *               contentType:
 *                 type: string
 *                 description: Content type being viewed
 *                 enum: [STARTUP, NEWS, EVENT, USER, FOUNDER, PARTNER]
 *                 example: "STARTUP"
 *               contentId:
 *                 type: integer
 *                 description: Content ID (optional)
 *                 example: 5
 *               metadata:
 *                 type: object
 *                 description: Additional metadata (optional)
 *                 example: {"page": "landing"}
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
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Session ID
 *                   example: "sess_abc123def456"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid content type"
 */
export async function POST(req: NextRequest) {
  try {
  const body = await req.json();
    const session = await analyticsService.startSession({
      userId: body.userId ?? null,
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
    return NextResponse.json({ id: session.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
