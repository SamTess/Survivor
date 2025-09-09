import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";

/**
 * @openapi
 * /analytics/page-view:
 *   post:
 *     summary: Record Page View
 *     description: Record a page view event for analytics tracking
 *     tags:
 *       - Analytics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Session ID (optional)
 *                 example: "sess_123"
 *               userId:
 *                 type: integer
 *                 description: User ID (optional for anonymous tracking)
 *                 example: 1
 *               path:
 *                 type: string
 *                 description: Page path that was viewed
 *                 example: "/startups/5"
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
 *     responses:
 *       200:
 *         description: Page view recorded successfully
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
 *                   example: "Path is required"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await analyticsService.recordPageView({
      sessionId: body.sessionId ?? null,
      userId: body.userId ?? null,
      path: body.path,
      referrerHost: body.referrerHost ?? null,
      utmSource: body.utmSource ?? null,
      utmMedium: body.utmMedium ?? null,
      utmCampaign: body.utmCampaign ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
