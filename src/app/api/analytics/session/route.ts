import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "../../../../composition/container";
import { ContentType } from "../../../../domain/enums/Analytics";

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
