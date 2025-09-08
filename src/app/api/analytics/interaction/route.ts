import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";
import { ContentType, EventType } from "../../../../domain/enums/Analytics";

/**
 * @api {post} /analytics/interaction Record User Interaction
 * @apiName RecordInteraction
 * @apiGroup Analytics
 * @apiVersion 0.1.0
 * @apiDescription Record a user interaction event for analytics tracking
 * 
 * @apiParam {Number} [userId] User ID (optional for anonymous tracking)
 * @apiParam {String} [sessionId] Session ID (optional)
 * @apiParam {String} eventType Event type (e.g., CLICK, VIEW, DOWNLOAD)
 * @apiParam {String} contentType Content type (STARTUP, NEWS, EVENT, etc.)
 * @apiParam {Number} [contentId] Content ID (optional)
 * @apiParam {Object} [metadata] Additional metadata (optional)
 * @apiParam {String} [referrerHost] Referrer host (optional)
 * @apiParam {String} [utmSource] UTM source parameter (optional)
 * @apiParam {String} [utmMedium] UTM medium parameter (optional)
 * @apiParam {String} [utmCampaign] UTM campaign parameter (optional)
 * @apiParam {String} [utmTerm] UTM term parameter (optional)
 * @apiParam {String} [utmContent] UTM content parameter (optional)
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "userId": 1,
 *       "sessionId": "sess_123",
 *       "eventType": "CLICK",
 *       "contentType": "STARTUP",
 *       "contentId": 5,
 *       "metadata": {"button": "like"},
 *       "utmSource": "google"
 *     }
 * 
 * @apiSuccess {Boolean} ok Success status
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ok": true
 *     }
 * 
 * @apiError (Error 400) {String} error Error message
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid event type"
 *     }
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
