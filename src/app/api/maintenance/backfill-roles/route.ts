import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
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
