import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @openapi
 * /api/maintenance/backfill-roles:
 *   post:
 *     tags:
 *       - Maintenance
 *     summary: Backfill user roles
 *     description: |
 *       Maintenance endpoint to synchronize user roles based on their profile associations.
 *       This endpoint analyzes each user's linked profiles (investor or founder) and updates
 *       their role accordingly:
 *       - Users with investor profiles get role "investor"
 *       - Users with founder profiles get role "founder"
 *       - Users with no profiles get role "visitor"
 *
 *       This is typically used for data migration or fixing role inconsistencies.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Role backfill completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 updatedCount:
 *                   type: integer
 *                   description: Number of users whose roles were updated
 *                   example: 15
 *                 updated:
 *                   type: array
 *                   description: List of users that were updated
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: User ID
 *                         example: 123
 *                       from:
 *                         type: string
 *                         nullable: true
 *                         description: Previous role (null if no role was set)
 *                         example: "visitor"
 *                       to:
 *                         type: string
 *                         description: New role assigned
 *                         enum: [visitor, founder, investor]
 *                         example: "founder"
 *             example:
 *               success: true
 *               updatedCount: 3
 *               updated:
 *                 - id: 123
 *                   from: "visitor"
 *                   to: "founder"
 *                 - id: 124
 *                   from: null
 *                   to: "investor"
 *                 - id: 125
 *                   from: "founder"
 *                   to: "visitor"
 *       500:
 *         description: Internal server error during backfill operation
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
 *                   example: "Backfill failed"
 */
export async function POST() {
  try {
    const updated: { id: number; from: string | null; to: string }[] = [];

    const users = await prisma.s_USER.findMany({ select: { id: true, role: true } });

    for (const u of users) {
      const investor = await prisma.s_INVESTOR.findFirst({ where: { user_id: u.id } });
      const founder = await prisma.s_FOUNDER.findFirst({ where: { user_id: u.id } });
      let to: string | null = null;
      if (investor) to = 'investor';
      else if (founder) to = 'founder';
      else to = 'visitor';

      if (u.role !== to) {
        await prisma.s_USER.update({ where: { id: u.id }, data: { role: to } });
        updated.push({ id: u.id, from: u.role, to });
      }
    }

    return NextResponse.json({ success: true, updatedCount: updated.length, updated });
  } catch (err) {
    console.error('Backfill roles error:', err);
    return NextResponse.json({ success: false, error: 'Backfill failed' }, { status: 500 });
  }
}
