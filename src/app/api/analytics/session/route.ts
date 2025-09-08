import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";
import { ContentType } from "../../../../domain/enums/Analytics";

/**
 * @api {post} /analytics/session Start Analytics Session
 * @apiName StartSession
 * @apiGroup Analytics
 * @apiVersion 0.1.0
 * @apiDescription Start a new analytics session for tracking user interactions
 *
 * @apiParam {Number} [userId] User ID (optional for anonymous sessions)
 * @apiParam {String} contentType Content type being viewed (STARTUP, NEWS, EVENT, etc.)
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
 *       "contentType": "STARTUP",
 *       "contentId": 5,
 *       "referrerHost": "google.com",
 *       "utmSource": "google"
 *     }
 *
 * @apiSuccess {String} id Session ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "sess_abc123def456"
 *     }
 *
 * @apiError (Error 400) {String} error Error message
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid content type"
 *     }
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
