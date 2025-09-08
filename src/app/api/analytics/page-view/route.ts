import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";

/**
 * @api {post} /analytics/page-view Record Page View
 * @apiName RecordPageView
 * @apiGroup Analytics
 * @apiVersion 0.1.0
 * @apiDescription Record a page view event for analytics tracking
 *
 * @apiParam {String} [sessionId] Session ID (optional)
 * @apiParam {Number} [userId] User ID (optional for anonymous tracking)
 * @apiParam {String} path Page path that was viewed
 * @apiParam {String} [referrerHost] Referrer host (optional)
 * @apiParam {String} [utmSource] UTM source parameter (optional)
 * @apiParam {String} [utmMedium] UTM medium parameter (optional)
 * @apiParam {String} [utmCampaign] UTM campaign parameter (optional)
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "sessionId": "sess_123",
 *       "userId": 1,
 *       "path": "/startups/5",
 *       "referrerHost": "google.com",
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
 *       "error": "Path is required"
 *     }
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
