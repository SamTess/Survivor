import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/infrastructure/persistence/prisma/client';

/**
 * @openapi
 * /api/startups/{id}/details:
 *   post:
 *     tags:
 *       - Startups
 *     summary: Create or update startup details
 *     description: |
 *       Create or update detailed information for a startup. This endpoint performs an upsert operation:
 *       - If startup details already exist, they will be updated with the provided data
 *       - If no details exist, a new detail record will be created
 *       - Only provided fields will be updated, others remain unchanged
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Startup unique ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Detailed description of the startup
 *                 example: "We are revolutionizing the AI industry with cutting-edge machine learning solutions for businesses."
 *               website_url:
 *                 type: string
 *                 nullable: true
 *                 format: uri
 *                 description: Official website URL
 *                 example: "https://www.techstartup.com"
 *               social_media_url:
 *                 type: string
 *                 nullable: true
 *                 format: uri
 *                 description: Social media profile URL
 *                 example: "https://twitter.com/techstartup"
 *               project_status:
 *                 type: string
 *                 nullable: true
 *                 description: Current project development status
 *                 example: "MVP_READY"
 *               needs:
 *                 type: string
 *                 nullable: true
 *                 description: What the startup currently needs (funding, talent, partnerships, etc.)
 *                 example: "Series A funding, experienced CTO, strategic partnerships"
 *           example:
 *             description: "We are revolutionizing the AI industry with cutting-edge machine learning solutions for businesses."
 *             website_url: "https://www.techstartup.com"
 *             social_media_url: "https://twitter.com/techstartup"
 *             project_status: "MVP_READY"
 *             needs: "Series A funding, experienced CTO, strategic partnerships"
 *     responses:
 *       200:
 *         description: Startup details created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Detail record ID
 *                       example: 1
 *                     startup_id:
 *                       type: integer
 *                       description: Associated startup ID
 *                       example: 123
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: "We are revolutionizing the AI industry with cutting-edge machine learning solutions for businesses."
 *                     website_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://www.techstartup.com"
 *                     social_media_url:
 *                       type: string
 *                       nullable: true
 *                       example: "https://twitter.com/techstartup"
 *                     project_status:
 *                       type: string
 *                       nullable: true
 *                       example: "MVP_READY"
 *                     needs:
 *                       type: string
 *                       nullable: true
 *                       example: "Series A funding, experienced CTO, strategic partnerships"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:45:00.000Z"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 startup_id: 123
 *                 description: "We are revolutionizing the AI industry with cutting-edge machine learning solutions for businesses."
 *                 website_url: "https://www.techstartup.com"
 *                 social_media_url: "https://twitter.com/techstartup"
 *                 project_status: "MVP_READY"
 *                 needs: "Series A funding, experienced CTO, strategic partnerships"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T14:45:00.000Z"
 *       400:
 *         description: Bad request - Invalid startup ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid startup ID"
 */
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
