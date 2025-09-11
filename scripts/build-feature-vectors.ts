/*
  Build FEATURE_VECTOR for STARTUP/INVESTOR/PARTNER.
  - Tokenize text fields, compute simple TF-IDF across each entity type corpus
  - Upsert into FEATURE_VECTOR (tags + tfidf JSON)

  Usage:
    npm run features:build
*/
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

type Doc = { id: number; type: 'STARTUP' | 'INVESTOR' | 'PARTNER'; tags: string[]; text: string };
const STOP = new Set([
  'the','a','an','and','or','of','to','in','on','for','with','by','from','is','are','was','were','be','as','at','it','that','this','these','those','we','you','they','our','their','your','&','/','\\','-','–','—','(',')','[',']','{','}',':',';','.',',','!','?','"','\'','’','“','”'
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP.has(t));
}

function tfidf(docs: Doc[]): Array<{ id: number; type: Doc['type']; tags: string[]; vec: Array<{ term: string; w: number }> }> {
  const df = new Map<string, number>();
  const tokenized: Array<{ id: number; type: Doc['type']; tags: string[]; tokens: string[] }> = [];
  for (const d of docs) {
    const tokens = tokenize(d.text);
    tokenized.push({ id: d.id, type: d.type, tags: d.tags, tokens });
    const uniq = new Set(tokens);
    for (const t of uniq) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = docs.length || 1;
  const out: Array<{ id: number; type: Doc['type']; tags: string[]; vec: Array<{ term: string; w: number }> }> = [];
  for (const d of tokenized) {
    const tf = new Map<string, number>();
    for (const t of d.tokens) tf.set(t, (tf.get(t) || 0) + 1);
    const vec: Array<{ term: string; w: number }> = [];
    for (const [term, f] of tf) {
      const idf = Math.log((N + 1) / (1 + (df.get(term) || 0))) + 1; // smoothed IDF
      vec.push({ term, w: (f / d.tokens.length) * idf });
    }
    vec.sort((a, b) => b.w - a.w);
    out.push({ id: d.id, type: d.type, tags: d.tags, vec: vec.slice(0, 32) });
  }
  return out;
}

async function loadDocs(): Promise<Doc[]> {
  const [startups, investors, partners] = await Promise.all([
    prisma.s_STARTUP.findMany({ include: { details: true } }),
    prisma.s_INVESTOR.findMany(),
    prisma.s_PARTNER.findMany(),
  ]);

  const sDocs: Doc[] = startups.map(s => ({
    id: s.id,
    type: 'STARTUP',
    tags: [s.sector, s.maturity].filter(Boolean) as string[],
    text: [s.name, s.sector, s.maturity, s.address, s.description, ...(s.details?.map(d => d.needs || '') || [])].filter(Boolean).join(' '),
  }));
  const iDocs: Doc[] = investors.map(i => ({
    id: i.id,
    type: 'INVESTOR',
    tags: [i.investor_type || '', i.investment_focus || ''].filter(Boolean),
    text: [i.name, i.address, i.description, i.investment_focus].filter(Boolean).join(' '),
  }));
  const pDocs: Doc[] = partners.map(p => ({
    id: p.id,
    type: 'PARTNER',
    tags: [p.partnership_type || ''].filter(Boolean),
    text: [p.name, p.address, p.description, p.partnership_type].filter(Boolean).join(' '),
  }));
  return [...sDocs, ...iDocs, ...pDocs];
}

async function main() {
  const docs = await loadDocs();
  if (!docs.length) {
    console.log('No entities found.');
    return;
  }
  const vecs = tfidf(docs);
  let upserted = 0;
  for (const v of vecs) {
    // Raw SQL upsert (avoid Prisma delegate casing issues)
    await (prisma as unknown as { $executeRawUnsafe: (sql: string, ...params: unknown[]) => Promise<unknown> }).$executeRawUnsafe(
      `INSERT INTO "FEATURE_VECTOR" (id, entity_type, entity_id, tags, tfidf, updated_at, created_at)
       VALUES ($1, $2::"EntityType", $3, $4::text[], $5::jsonb, NOW(), NOW())
       ON CONFLICT (entity_type, entity_id) DO UPDATE SET
         tags = EXCLUDED.tags,
         tfidf = EXCLUDED.tfidf,
         updated_at = NOW();`,
      randomUUID(),
      v.type,
      v.id,
      v.tags,
      JSON.stringify(v.vec)
    );
    upserted++;
  }
  console.log(`Feature vectors upserted: ${upserted}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
