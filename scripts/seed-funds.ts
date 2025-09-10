/*
  Seed basic INVESTMENT_FUND entries for investors lacking funds
  - Creates 1-2 funds per investor with reasonable ticket ranges
  Usage:
    npm run seed:funds            # seed for all investors without funds
    INVESTOR_ID=18 npm run seed:funds  # seed only for investor 18
*/
import prisma from "../src/infrastructure/persistence/prisma/client";

function rand(min: number, max: number) { return Math.floor(min + Math.random() * (max - min + 1)); }

async function seedForInvestor(investorId: number) {
  const rows = await (prisma as unknown as { $queryRawUnsafe: <T=unknown>(sql: string, ...params: unknown[]) => Promise<T> }).$queryRawUnsafe<Array<{ count: bigint | number | string }>>(`SELECT COUNT(*)::bigint AS count FROM "INVESTMENT_FUND" WHERE investor_id = $1;`, investorId);
  const has = Number(rows[0]?.count ?? 0);
  if (has > 0) return 0;
  const now = new Date();
  const periodStart = new Date(now.getFullYear() - 1, 0, 1);
  const periodEnd = new Date(now.getFullYear() + 1, 11, 31);
  const min = rand(100_000, 500_000);
  const max = min + rand(500_000, 4_500_000);
  await (prisma as unknown as { $queryRawUnsafe: (sql: string, ...params: unknown[]) => Promise<unknown> }).$queryRawUnsafe(
    `INSERT INTO "INVESTMENT_FUND" (id, investor_id, name, vintage, aum_eur, dry_powder_eur, investment_period_start, investment_period_end, ticket_min_eur, ticket_max_eur, follow_on_ratio, sector_focus, geo_focus, stage_focus, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 0.30, ARRAY['SaaS','AI'], ARRAY['EU'], ARRAY['seed','A'], NOW(), NOW());`,
    investorId,
    `Fund ${investorId} Seed I`,
    rand(2018, 2025),
    max * 100,
    max * 80,
    periodStart,
    periodEnd,
    min,
    max
  );
  return 1;
}

async function main() {
  const envId = process.env.INVESTOR_ID ? Number(process.env.INVESTOR_ID) : undefined;
  if (envId && Number.isFinite(envId)) {
    const c = await seedForInvestor(envId);
    console.log(`Seeded ${c} fund(s) for investor #${envId}`);
    return;
  }
  const investors = await prisma.s_INVESTOR.findMany({ select: { id: true } });
  let total = 0;
  for (const inv of investors) total += await seedForInvestor(inv.id);
  console.log(`Seeded funds for ${total} investors`);
}

main().catch(e => { console.error(e); process.exit(1); });
