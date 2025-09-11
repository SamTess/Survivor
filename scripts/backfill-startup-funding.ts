/*
  Backfill script for S_STARTUP funding fields starting from ask_currency.
  - Targets rows where ask_currency IS NULL.
  - Fills: ask_currency, ask_min, ask_max, ask_min_eur, ask_max_eur, use_of_funds, revenue_arr_eur, runway_months.

  Usage:
    - Ensure DATABASE_URL is set (e.g. via .env)
    - Run: npm run backfill:startup-funding
*/

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::bigint AS count
     FROM "S_STARTUP"
     WHERE ask_currency IS NULL
        OR fundraising_status IS NULL
        OR "round" IS NULL
        OR ask_min IS NULL
        OR ask_max IS NULL
        OR ask_min_eur IS NULL
        OR ask_max_eur IS NULL
        OR use_of_funds IS NULL
        OR revenue_arr_eur IS NULL
        OR runway_months IS NULL;`
  )) as Array<{ count: bigint | number | string }>;
  const toBackfill = Number(before[0]?.count ?? 0);

  if (!toBackfill) {
    console.log("No startups to backfill. Exiting.");
    return;
  }

  console.log(`Will backfill ${toBackfill} startups…`);

  const sql = `
WITH gen AS (
  SELECT id,
         (ARRAY['EUR','USD','GBP','CHF'])[(1 + floor(random()*4))::int]::char(3) AS currency,
         (round((50000 + random()*(2000000-50000)) / 100) * 100)::numeric(18,2) AS ask_min
  FROM "S_STARTUP"
  WHERE ask_currency IS NULL
     OR fundraising_status IS NULL
     OR "round" IS NULL
     OR ask_min IS NULL
     OR ask_max IS NULL
     OR ask_min_eur IS NULL
     OR ask_max_eur IS NULL
     OR use_of_funds IS NULL
     OR revenue_arr_eur IS NULL
     OR runway_months IS NULL
),
gen2 AS (
  SELECT id,
         currency,
         ask_min,
         GREATEST(
           ask_min + (
             round(((10000 + (random()*(500000-10000)))::numeric) / 100) * 100
           )::numeric,
           round(ask_min * ((1.1::numeric) + (random()::numeric)*(2.5::numeric - 1.1::numeric)), 2)
         )::numeric(18,2) AS ask_max
  FROM gen
),
rates AS (
  SELECT 'EUR'::char(3) AS c, 1.0::numeric AS r
  UNION ALL SELECT 'USD'::char(3), 0.92
  UNION ALL SELECT 'GBP'::char(3), 1.17
  UNION ALL SELECT 'CHF'::char(3), 1.02
),
calc AS (
  SELECT g2.id,
         g2.currency,
         g2.ask_min,
         g2.ask_max,
         round((g2.ask_min * rates.r)::numeric, 2) AS ask_min_eur,
         round((g2.ask_max * rates.r)::numeric, 2) AS ask_max_eur,
         round((random()::numeric*2500000)::numeric, 2) AS revenue_arr_eur,
         (6 + floor(random() * (24-6+1)))::int AS runway_months,
     (ARRAY['not_raising','preparing','raising','closed'])[(1 + floor(random()*4))::int] AS fundraising_status,
     (ARRAY['pre-seed','seed','A','B','C','growth'])[(1 + floor(random()*6))::int] AS round_val,
         (
           (ARRAY['Hiring','Marketing','Sales','Product','R&D','Operations','Regulatory','International expansion','Infrastructure'])[(1 + floor(random()*9))::int]
           || ', '
           || (ARRAY['Hiring','Marketing','Sales','Product','R&D','Operations','Regulatory','International expansion','Infrastructure'])[(1 + floor(random()*9))::int]
           || CASE WHEN random() < 0.5 THEN '' ELSE ', '
                || (ARRAY['Hiring','Marketing','Sales','Product','R&D','Operations','Regulatory','International expansion','Infrastructure'])[(1 + floor(random()*9))::int]
              END
         ) AS use_of_funds
  FROM gen2 g2
  JOIN rates ON rates.c = g2.currency
)
UPDATE "S_STARTUP" s
 SET ask_currency       = COALESCE(s.ask_currency, calc.currency),
   ask_min            = COALESCE(s.ask_min, calc.ask_min),
   ask_max            = COALESCE(s.ask_max, calc.ask_max),
   ask_min_eur        = COALESCE(s.ask_min_eur, calc.ask_min_eur),
   ask_max_eur        = COALESCE(s.ask_max_eur, calc.ask_max_eur),
   use_of_funds       = COALESCE(s.use_of_funds, calc.use_of_funds),
   revenue_arr_eur    = COALESCE(s.revenue_arr_eur, calc.revenue_arr_eur),
   runway_months      = COALESCE(s.runway_months, calc.runway_months),
   fundraising_status = COALESCE(s.fundraising_status, calc.fundraising_status),
   "round"            = COALESCE(s."round", calc.round_val)
FROM calc
WHERE s.id = calc.id;
`;

  await prisma.$executeRawUnsafe(sql);

  const after = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::bigint AS count
     FROM "S_STARTUP"
     WHERE ask_currency IS NULL
        OR fundraising_status IS NULL
        OR "round" IS NULL
        OR ask_min IS NULL
        OR ask_max IS NULL
        OR ask_min_eur IS NULL
        OR ask_max_eur IS NULL
        OR use_of_funds IS NULL
        OR revenue_arr_eur IS NULL
        OR runway_months IS NULL;`
  )) as Array<{ count: bigint | number | string }>;
  const remaining = Number(after[0]?.count ?? 0);

  console.log(`Backfill complete. Updated ~${toBackfill - remaining} startups (remaining ${remaining}).`);
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
