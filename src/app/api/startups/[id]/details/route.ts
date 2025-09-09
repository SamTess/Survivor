import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const startupId = parseInt(paramId);
    if (isNaN(startupId)) {
      return NextResponse.json({ success: false, error: 'Invalid startup ID' }, { status: 400 });
    }

    const body = await request.json();
    const { description, website_url, social_media_url, project_status, needs } = body || {};

    const existing = await prisma.s_STARTUP_DETAIL.findFirst({ where: { startup_id: startupId } });

    let detail;
    if (existing) {
      detail = await prisma.s_STARTUP_DETAIL.update({
        where: { id: existing.id },
        data: {
          description: description ?? existing.description,
          website_url: website_url ?? existing.website_url,
          social_media_url: social_media_url ?? existing.social_media_url,
          project_status: project_status ?? existing.project_status,
          needs: needs ?? existing.needs,
        },
      });
    } else {
      detail = await prisma.s_STARTUP_DETAIL.create({
        data: {
          startup_id: startupId,
          description: description ?? null,
          website_url: website_url ?? null,
          social_media_url: social_media_url ?? null,
          project_status: project_status ?? null,
          needs: needs ?? null,
        },
      });
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    console.error('Error upserting startup details:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save details' },
      { status: 400 }
    );
  }
}
