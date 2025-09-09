import { EntityType, OpportunityDirection, OpportunityStatus } from "../../../domain/enums/Opportunities";
import { OpportunityRepository, ScoreBreakdown } from "../../../domain/repositories/OpportunityRepository";
import { InvestorRepository } from "../../../domain/repositories/InvestorRepository";
import { PartnerRepository } from "../../../domain/repositories/PartnerRepository";
import { StartupRepository } from "../../../domain/repositories/StartupRepository";
import { OpportunityReadRepository, StartupForScoring } from "../../../domain/repositories/OpportunityReadRepository";
import { InvestmentFundRepository } from "../../../domain/repositories/InvestmentFundRepository";
import { InvestmentFund } from "../../../domain/interfaces/InvestmentFund";

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
  private readonly fundRepo?: InvestmentFundRepository,
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

  // Budget/fund fit sub-score for Startup ↔ Investor (0..20)
  private budgetScoreInvestor(startup: StartupForScoring, funds: InvestmentFund[] | null | undefined): number {
    if (!funds || funds.length === 0) return 0;
    const askMin = startup.ask_min_eur ?? null;
    const askMax = startup.ask_max_eur ?? null;
    if (askMin == null && askMax == null) return 0;

    const now = new Date();
    let best = 0; // keep best across funds
    for (const f of funds) {
      const fMin = f.ticket_min_eur ?? null;
      const fMax = f.ticket_max_eur ?? null;

      let base = 0; // 0..15 based on ticket overlap/distance
      if (fMin != null && fMax != null && askMin != null && askMax != null) {
        // overlap check
        const overlap = !(askMax < fMin || askMin > fMax);
        if (overlap) {
          base = 15;
        } else if (askMax < fMin) {
          const r = Math.max(0, Math.min(1, askMax / fMin));
          base = 15 * r;
        } else if (askMin > fMax) {
          const r = Math.max(0, Math.min(1, fMax / askMin));
          base = 15 * r;
        }
      } else if (fMin != null && askMax != null) {
        const r = Math.max(0, Math.min(1, askMax / fMin));
        base = 15 * r;
      } else if (fMax != null && askMin != null) {
        const r = Math.max(0, Math.min(1, fMax / askMin));
        base = 15 * r;
      } else {
        base = 0;
      }

      // availability bonuses up to 5
      let avail = 0;
      // +3 if we're within investment period
      if (f.investment_period_start && f.investment_period_end) {
        if (now >= f.investment_period_start && now <= f.investment_period_end) {
          avail += 3;
        }
      }
      // +2 scaled by dry powder ratio
      if (f.dry_powder_eur && f.aum_eur && f.aum_eur > 0) {
        const ratio = Math.max(0, Math.min(1, (f.dry_powder_eur || 0) / f.aum_eur));
        avail += 2 * ratio;
      }

      best = Math.max(best, base + avail);
    }
    return Math.max(0, Math.min(20, best));
  }

  private scorePair(
    A: { type: EntityType; country?: string | null; tags: Set<string>; tfidfVec: number[]; maturity?: string | null; needsText?: string | null; signals?: { views: number; likes: number; bookmarks: number; createdAt: Date } | null; focusText?: string | null; },
    B: { type: EntityType; country?: string | null; tags: Set<string>; tfidfVec: number[]; maturity?: string | null; needsText?: string | null; signals?: { views: number; likes: number; bookmarks: number; createdAt: Date } | null; focusText?: string | null; }
  ) {
    const sTags = 40 * jaccard(A.tags, B.tags);
    const sText = 25 * cosine(A.tfidfVec, B.tfidfVec);
    const aIsStartup = A.type === EntityType.STARTUP;
    const bIsStartup = B.type === EntityType.STARTUP;
    const sStage = aIsStartup
      ? 15 * (this.stageHeuristic(A.needsText ?? null, A.maturity ?? null, B.focusText ?? null) / 15)
      : bIsStartup
        ? 15 * (this.stageHeuristic(B.needsText ?? null, B.maturity ?? null, A.focusText ?? null) / 15)
        : 0;
    const sGeo = geoScore(A.country, B.country);
    const sEng = aIsStartup ? engagementBonus(A.signals) : (bIsStartup ? engagementBonus(B.signals) : 0);

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
      // Budget/fund fit
      let budget = 0;
      if (this.fundRepo) {
        const funds = await this.fundRepo.getByInvestor(inv.id);
        budget = this.budgetScoreInvestor(startup, funds);
      }
      const total = Math.min(100, score + budget);
      const fullBreakdown: ScoreBreakdown = { ...breakdown, budget };
      if (total >= minScore) matches.push({ direction: 'S->I' as OpportunityDirection, targetType: 'INVESTOR' as EntityType, targetId: inv.id, score: total, breakdown: fullBreakdown });
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
  status: (m.score >= 70 ? 'qualified' : 'new') as unknown as OpportunityStatus,
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

  async generateForInvestor(investorId: number, topK = 10, minScore = 45) {
    // Load investor and all startups
    const [inv, startups] = await Promise.all([
      this.investorRepo.getById(investorId),
      this.readRepo ? this.readRepo.getStartupsForScoring() : Promise.resolve([]),
    ]);
    if (!inv || !startups.length) return { created: 0 };
  const iFeat = this.extractInvestorFeatures({ investment_focus: inv.investment_focus, description: inv.description, address: inv.address });
  const invFunds = this.fundRepo ? await this.fundRepo.getByInvestor(investorId) : null;
    const matches: Array<{ targetId: number; score: number; breakdown: ScoreBreakdown }> = [];
    for (const s of startups) {
      const sFeat = this.extractStartupFeatures(s);
      const { score, breakdown } = this.scorePair({ type: EntityType.INVESTOR, ...iFeat }, { type: EntityType.STARTUP, ...sFeat });
      // Budget/fund fit once per investor, reuse cached funds if possible
      let budget = 0;
      if (this.fundRepo) {
        budget = this.budgetScoreInvestor(s, invFunds ?? undefined);
      }
      const total = Math.min(100, score + budget);
      const fullBreakdown: ScoreBreakdown = { ...breakdown, budget };
      if (total >= minScore) matches.push({ targetId: s.id, score: total, breakdown: fullBreakdown });
    }
    matches.sort((a, b) => b.score - a.score);
    const top = matches.slice(0, topK);
    let created = 0;
    for (const m of top) {
      const op = await this.opportunityRepo.upsertUnique({
        direction: 'I->S' as OpportunityDirection,
        source_type: 'INVESTOR' as EntityType,
        source_id: investorId,
        target_type: 'STARTUP' as EntityType,
        target_id: m.targetId,
        score: +m.score.toFixed(2),
        score_breakdown: m.breakdown as unknown as Record<string, number>,
        status: (m.score >= 70 ? 'qualified' : 'new') as unknown as OpportunityStatus,
      });
      await this.opportunityRepo.logEvent({ opportunity_id: op.id, type: 'auto_created', payload: { score: op.score, breakdown: op.score_breakdown, source: 'generateForInvestor' } });
      created++;
    }
    return { created };
  }

  async generateForPartner(partnerId: number, topK = 10, minScore = 45) {
    // Load partner and all startups
    const [par, startups] = await Promise.all([
      this.partnerRepo.getById(partnerId),
      this.readRepo ? this.readRepo.getStartupsForScoring() : Promise.resolve([]),
    ]);
    if (!par || !startups.length) return { created: 0 };
    const pFeat = this.extractPartnerFeatures({ partnership_type: par.partnership_type, description: par.description, address: par.address });
    const matches: Array<{ targetId: number; score: number; breakdown: ScoreBreakdown }> = [];
    for (const s of startups) {
      const sFeat = this.extractStartupFeatures(s);
  const { score, breakdown } = this.scorePair({ type: EntityType.PARTNER, ...pFeat }, { type: EntityType.STARTUP, ...sFeat });
      if (score >= minScore) matches.push({ targetId: s.id, score, breakdown });
    }
    matches.sort((a, b) => b.score - a.score);
    const top = matches.slice(0, topK);
    let created = 0;
    for (const m of top) {
      const op = await this.opportunityRepo.upsertUnique({
        direction: 'P->S' as OpportunityDirection,
        source_type: 'PARTNER' as EntityType,
        source_id: partnerId,
        target_type: 'STARTUP' as EntityType,
        target_id: m.targetId,
        score: +m.score.toFixed(2),
        score_breakdown: m.breakdown as unknown as Record<string, number>,
        status: (m.score >= 70 ? 'qualified' : 'new') as unknown as OpportunityStatus,
      });
      await this.opportunityRepo.logEvent({ opportunity_id: op.id, type: 'auto_created', payload: { score: op.score, breakdown: op.score_breakdown, source: 'generateForPartner' } });
      created++;
    }
    return { created };
  }
}
