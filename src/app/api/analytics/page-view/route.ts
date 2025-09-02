import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";

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
