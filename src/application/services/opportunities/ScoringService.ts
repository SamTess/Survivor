import { EntityType, OpportunityDirection, OpportunityStatus } from "../../../domain/enums/Opportunities";
import { OpportunityRepository, ScoreBreakdown } from "../../../domain/repositories/OpportunityRepository";
import { InvestorRepository } from "../../../domain/repositories/InvestorRepository";
import { PartnerRepository } from "../../../domain/repositories/PartnerRepository";
import { StartupRepository } from "../../../domain/repositories/StartupRepository";
import { OpportunityReadRepository, StartupForScoring } from "../../../domain/repositories/OpportunityReadRepository";

type Vec = number[];

const cosine = (a: Vec, b: Vec): number => {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
};

const jaccard = (A: Set<string>, B: Set<string>): number => {
  if (!A.size && !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / new Set([...A, ...B]).size;
};

const geoScore = (a?: string | null, b?: string | null): number => {
  if (!a || !b) return 0;
  if (a === b) return 10;
  const fr = new Set(['France','Belgium','Switzerland','Luxembourg','Canada']);
  return (fr.has(a) && fr.has(b)) ? 5 : 0;
};

const engagementBonus = (signals?: { views: number; likes: number; bookmarks: number; createdAt: Date } | null): number => {
  if (!signals) return 0;
  const norm = (x: number) => Math.min(1, Math.log1p(Math.max(0, x)) / Math.log(100 + 1));
  const z = 0.5 * norm(signals.views) + 1.0 * norm(signals.likes) + 1.5 * norm(signals.bookmarks);
  const ageDays = (Date.now() - new Date(signals.createdAt).getTime()) / (1000 * 3600 * 24);
  const decay = Math.exp(-0.02 * Math.max(0, ageDays));
  return Math.min(10, 10 * z * decay);
};

export class ScoringService {
  constructor(
    private readonly opportunityRepo: OpportunityRepository,
  private readonly startupRepo: StartupRepository,
    private readonly investorRepo: InvestorRepository,
    private readonly partnerRepo: PartnerRepository,
  private readonly readRepo?: OpportunityReadRepository,
  ) {}

  // Placeholder feature extraction. In a next iteration, persist vectors/tags.
  private extractStartupFeatures(s: StartupForScoring) {
    const text = `${s.sector || ''} ${s.description || ''} ${(s.details?.[0]?.needs) || ''}`.toLowerCase();
    const tags = new Set(text.split(/[^a-z0-9+]+/).filter(Boolean));
    const tfidfVec: number[] = Array.from({ length: 32 }, (_, i) => ((text.charCodeAt(i % text.length) || 0) % 17) / 17);
    const country = (s.address || '').split(',').pop()?.trim() || null;
    const signals = { views: s.viewsCount || 0, likes: s.likesCount || 0, bookmarks: s.bookmarksCount || 0, createdAt: s.created_at || new Date() };
    return { tags, tfidfVec, country, maturity: s.maturity || null, needsText: s.details?.[0]?.needs || null, signals };
  }

  private extractInvestorFeatures(i: { investment_focus?: string | null; description?: string | null; address?: string | null; }) {
    const text = `${i.investment_focus || ''} ${i.description || ''}`.toLowerCase();
    const tags = new Set(text.split(/[^a-z0-9+]+/).filter(Boolean));
    const tfidfVec: number[] = Array.from({ length: 32 }, (_, k) => ((text.charCodeAt(k % text.length) || 0) % 13) / 13);
    const country = (i.address || '').split(',').pop()?.trim() || null;
    return { tags, tfidfVec, country, focusText: i.investment_focus || null };
  }

  private extractPartnerFeatures(p: { partnership_type?: string | null; description?: string | null; address?: string | null; }) {
    const text = `${p.partnership_type || ''} ${p.description || ''}`.toLowerCase();
    const tags = new Set(text.split(/[^a-z0-9+]+/).filter(Boolean));
    const tfidfVec: number[] = Array.from({ length: 32 }, (_, k) => ((text.charCodeAt(k % text.length) || 0) % 11) / 11);
    const country = (p.address || '').split(',').pop()?.trim() || null;
    return { tags, tfidfVec, country, focusText: p.partnership_type || null };
  }

  private stageHeuristic(needs: string | null | undefined, maturity: string | null | undefined, focusText: string | null | undefined): number {
    const sNeeds = (needs || '').toLowerCase();
    const oFocus = (focusText || '').toLowerCase();
    const good = ['seed','pre-seed','series a','pilot','gtm','distribution','integration'];
    const hit = good.some((g) => sNeeds.includes(g) && oFocus.includes(g));
    if (hit) return 15;
    if (maturity && /early|mvp|idea/.test(maturity) && /early|seed/.test(oFocus)) return 8;
    return 0;
  }

  private scorePair(A: { type: EntityType; country?: string | null; tags: Set<string>; tfidfVec: number[]; maturity?: string | null; needsText?: string | null; signals?: { views: number; likes: number; bookmarks: number; createdAt: Date } | null; },
                    B: { type: EntityType; country?: string | null; tags: Set<string>; tfidfVec: number[]; focusText?: string | null; }) {
    const sTags = 40 * jaccard(A.tags, B.tags);
    const sText = 25 * cosine(A.tfidfVec, B.tfidfVec);
    const sStage = 15 * (this.stageHeuristic(A.needsText, A.maturity, B.focusText) / 15);
    const sGeo = geoScore(A.country, B.country);
    const sEng = engagementBonus(A.signals);

    const score = Math.min(100, sTags + sText + sStage + sGeo + sEng);
    const breakdown: ScoreBreakdown = { tags: sTags, text: sText, stage: sStage, geo: sGeo, engagement: sEng };
    return { score, breakdown };
  }

  async generateForStartup(startupId: number, topK = 10, minScore = 45) {
    const startup = this.readRepo ? await this.readRepo.getStartupForScoring(startupId) : null;
    if (!startup) return { created: 0 };
    const sFeat = this.extractStartupFeatures(startup);

    // Respect de l'architecture oignon: lecture via repositories domaine (infra injectée)
    const [investors, partners] = await Promise.all([
      this.investorRepo.getAll(),
      this.partnerRepo.getAll(),
    ]);

  const matches: Array<{ direction: OpportunityDirection; targetType: EntityType; targetId: number; score: number; breakdown: ScoreBreakdown }>=[];

    for (const inv of investors) {
      const iFeat = this.extractInvestorFeatures({
        investment_focus: inv.investment_focus,
        description: inv.description,
        address: inv.address,
      });
  const { score, breakdown } = this.scorePair({ type: 'STARTUP' as EntityType, ...sFeat }, { type: 'INVESTOR' as EntityType, ...iFeat });
  if (score >= minScore) matches.push({ direction: 'S->I' as OpportunityDirection, targetType: 'INVESTOR' as EntityType, targetId: inv.id, score, breakdown });
    }
    for (const par of partners) {
      const pFeat = this.extractPartnerFeatures({
        partnership_type: par.partnership_type,
        description: par.description,
        address: par.address,
      });
  const { score, breakdown } = this.scorePair({ type: 'STARTUP' as EntityType, ...sFeat }, { type: 'PARTNER' as EntityType, ...pFeat });
  if (score >= minScore) matches.push({ direction: 'S->P' as OpportunityDirection, targetType: 'PARTNER' as EntityType, targetId: par.id, score, breakdown });
    }

    matches.sort((a, b) => b.score - a.score);
    const top = matches.slice(0, topK);

    let created = 0;
    for (const m of top) {
      const op = await this.opportunityRepo.upsertUnique({
  direction: m.direction,
  source_type: 'STARTUP' as EntityType,
        source_id: startupId,
  target_type: m.targetType,
        target_id: m.targetId,
        score: +m.score.toFixed(2),
        score_breakdown: m.breakdown as unknown as Record<string, number>,
  status: 'new' as unknown as OpportunityStatus,
      });
      // Journaliser l'événement de création/maj automatique
      await this.opportunityRepo.logEvent({
        opportunity_id: op.id,
        type: 'auto_created',
        payload: { score: op.score, breakdown: op.score_breakdown, source: 'generateForStartup' },
      });
      created++;
    }
    return { created };
  }
}
