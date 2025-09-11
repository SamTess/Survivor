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

  private budgetScoreInvestor(startup: StartupForScoring, funds: InvestmentFund[] | null | undefined): number {
    if (!funds || funds.length === 0) return 0;
    const askMin = startup.ask_min_eur ?? null;
    const askMax = startup.ask_max_eur ?? null;
    if (askMin == null && askMax == null) return 0;
    const now = new Date();
    let best = 0;
    for (const f of funds) {
      const fMin = f.ticket_min_eur ?? null;
      const fMax = f.ticket_max_eur ?? null;
      let base = 0;
      if (fMin != null && fMax != null && askMin != null && askMax != null) {
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
      let avail = 0;
      if (f.investment_period_start && f.investment_period_end) {
        if (now >= f.investment_period_start && now <= f.investment_period_end) {
          avail += 3;
        }
      }
      if (f.dry_powder_eur && f.aum_eur && f.aum_eur > 0) {
        const ratio = Math.max(0, Math.min(1, (f.dry_powder_eur || 0) / f.aum_eur));
        avail += 2 * ratio;
      }
      best = Math.max(best, base + avail);
    }
    return Math.max(0, Math.min(20, best));
  }

  private bestFundMatch(
    startup: StartupForScoring,
    funds: InvestmentFund[] | null | undefined
  ): {
    bestScore: number;
    bestFundId: string | null;
    budgetFit: 'BELOW_RANGE' | 'WITHIN_RANGE' | 'ABOVE_RANGE' | 'UNKNOWN';
    proposedAmount: number | null;
  } {
    if (!funds || funds.length === 0) return { bestScore: 0, bestFundId: null, budgetFit: 'UNKNOWN', proposedAmount: null };
    const askMin = startup.ask_min_eur ?? null;
    const askMax = startup.ask_max_eur ?? null;
    if (askMin == null && askMax == null) return { bestScore: 0, bestFundId: null, budgetFit: 'UNKNOWN', proposedAmount: null };
    let bestScore = -1;
    let bestFundId: string | null = null;
    let bestFit: 'BELOW_RANGE' | 'WITHIN_RANGE' | 'ABOVE_RANGE' | 'UNKNOWN' = 'UNKNOWN';
    let bestProp: number | null = null;
    for (const f of funds) {
      const fMin = f.ticket_min_eur ?? null;
      const fMax = f.ticket_max_eur ?? null;
      let base = 0;
      let fit: 'BELOW_RANGE' | 'WITHIN_RANGE' | 'ABOVE_RANGE' | 'UNKNOWN' = 'UNKNOWN';
      let prop: number | null = null;
      if (fMin != null && fMax != null && askMin != null && askMax != null) {
        const overlapMin = Math.max(askMin, fMin);
        const overlapMax = Math.min(askMax, fMax);
        const overlap = overlapMax >= overlapMin;
        if (overlap) {
          base = 15;
          fit = 'WITHIN_RANGE';
          prop = (overlapMin + overlapMax) / 2;
        } else if (askMax < fMin) {
          const r = Math.max(0, Math.min(1, askMax / fMin));
          base = 15 * r;
          fit = 'BELOW_RANGE';
          prop = askMax;
        } else if (askMin > fMax) {
          const r = Math.max(0, Math.min(1, fMax / askMin));
          base = 15 * r;
          fit = 'ABOVE_RANGE';
          prop = askMin;
        }
      } else if (fMin != null && askMax != null) {
        const r = Math.max(0, Math.min(1, askMax / fMin));
        base = 15 * r;
        fit = askMax < fMin ? 'BELOW_RANGE' : 'UNKNOWN';
        prop = askMax;
      } else if (fMax != null && askMin != null) {
        const r = Math.max(0, Math.min(1, fMax / askMin));
        base = 15 * r;
        fit = askMin > fMax ? 'ABOVE_RANGE' : 'UNKNOWN';
        prop = askMin;
      }
      let avail = 0;
      const now = new Date();
      if (f.investment_period_start && f.investment_period_end) {
        if (now >= f.investment_period_start && now <= f.investment_period_end) {
          avail += 3;
        }
      }
      if (f.dry_powder_eur && f.aum_eur && f.aum_eur > 0) {
        const ratio = Math.max(0, Math.min(1, (f.dry_powder_eur || 0) / f.aum_eur));
        avail += 2 * ratio;
      }
      const score = base + avail;
      if (score > bestScore) {
        bestScore = score;
        bestFundId = f.id;
        bestFit = fit;
        bestProp = prop;
      }
    }
    return { bestScore: Math.max(0, Math.min(20, bestScore)), bestFundId, budgetFit: bestFit, proposedAmount: bestProp };
  }

  private mapRoundStrToEnum(r?: string | null): 'PRE_SEED' | 'SEED' | 'A' | 'B' | 'C' | 'GROWTH' | null {
    if (!r) return null;
    const s = r.toLowerCase().trim();
    if (s.includes('pre') && s.includes('seed')) return 'PRE_SEED';
    if (s === 'seed') return 'SEED';
    if (s === 'a' || s.includes('series a')) return 'A';
    if (s === 'b' || s.includes('series b')) return 'B';
    if (s === 'c' || s.includes('series c')) return 'C';
    if (s.includes('growth') || s.includes('late')) return 'GROWTH';
    return null;
  }

  private pickDealTypeForRound(r?: 'PRE_SEED' | 'SEED' | 'A' | 'B' | 'C' | 'GROWTH' | null): 'SAFE' | 'CONVERTIBLE' | 'EQUITY' {
    if (!r) return 'EQUITY';
    if (r === 'PRE_SEED' || r === 'SEED') return 'SAFE';
    return 'EQUITY';
  }

  private defaultProposedAmountForRound(r?: ReturnType<ScoringService['mapRoundStrToEnum']>): number | null {
    switch (r) {
      case 'PRE_SEED': return 200_000;
      case 'SEED': return 1_000_000;
      case 'A': return 4_000_000;
      case 'B': return 10_000_000;
      case 'C': return 20_000_000;
      case 'GROWTH': return 30_000_000;
      default: return null;
    }
  }

  private inferRoundByAsk(askMin: number | null | undefined, askMax: number | null | undefined): ReturnType<ScoringService['mapRoundStrToEnum']> {
    const min = askMin ?? null;
    const max = askMax ?? null;
    const ref = max ?? min;
    if (ref == null) return null;
    if (ref <= 300_000) return 'PRE_SEED';
    if (ref <= 1_500_000) return 'SEED';
    if (ref <= 5_000_000) return 'A';
    if (ref <= 15_000_000) return 'B';
    return 'GROWTH';
  }

  private inferRoundByMaturity(maturity?: string | null): ReturnType<ScoringService['mapRoundStrToEnum']> {
    if (!maturity) return null;
    const m = maturity.toLowerCase();
    if (/(idea|mvp|proto|early)/.test(m)) return 'PRE_SEED';
    if (/(seed|pre-seed)/.test(m)) return 'SEED';
    if (/(series a|phase a|round a)/.test(m)) return 'A';
    if (/(series b|phase b|round b)/.test(m)) return 'B';
    if (/(series c|phase c|round c)/.test(m)) return 'C';
    if (/(scale|growth|late)/.test(m)) return 'GROWTH';
    return null;
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
    const [inv, startups] = await Promise.all([
      this.investorRepo.getById(investorId),
      this.readRepo ? this.readRepo.getStartupsForScoring() : Promise.resolve([]),
    ]);
    if (!inv || !startups.length) return { created: 0 };
    const iFeat = this.extractInvestorFeatures({ investment_focus: inv.investment_focus, description: inv.description, address: inv.address });
    const invFunds = this.fundRepo ? await this.fundRepo.getByInvestor(investorId) : null;
    const matches: Array<{ targetId: number; score: number; breakdown: ScoreBreakdown; enrich?: { fund_id: string | null; budget_fit: 'BELOW_RANGE' | 'WITHIN_RANGE' | 'ABOVE_RANGE' | 'UNKNOWN'; budget_fit_score: number; proposed_amount_eur: number | null; round: ReturnType<ScoringService['mapRoundStrToEnum']>; deal_type: ReturnType<ScoringService['pickDealTypeForRound']>; } }> = [];
    for (const s of startups) {
      const sFeat = this.extractStartupFeatures(s);
      const { score, breakdown } = this.scorePair({ type: EntityType.INVESTOR, ...iFeat }, { type: EntityType.STARTUP, ...sFeat });
      let budget = 0;
      let enrich: { fund_id: string | null; budget_fit: 'BELOW_RANGE' | 'WITHIN_RANGE' | 'ABOVE_RANGE' | 'UNKNOWN'; budget_fit_score: number; proposed_amount_eur: number | null; round: ReturnType<ScoringService['mapRoundStrToEnum']>; deal_type: ReturnType<ScoringService['pickDealTypeForRound']>; } | undefined;
      if (this.fundRepo) {
        const best = this.bestFundMatch(s, invFunds ?? undefined);
        budget = best.bestScore;
        let roundEnum = this.mapRoundStrToEnum(s.round || null);
        if (!roundEnum) roundEnum = this.inferRoundByAsk(s.ask_min_eur ?? null, s.ask_max_eur ?? null);
        if (!roundEnum) roundEnum = this.inferRoundByMaturity(s.maturity ?? null);
        enrich = {
          fund_id: best.bestFundId,
          budget_fit: best.budgetFit,
          budget_fit_score: Number(budget.toFixed(2)),
          proposed_amount_eur: ((): number | null => {
            const fromBest = best.proposedAmount ?? null;
            if (fromBest != null) return fromBest;
            if (s.ask_min_eur != null && s.ask_max_eur != null) return (Number(s.ask_min_eur) + Number(s.ask_max_eur)) / 2;
            if (s.ask_max_eur != null) return Number(s.ask_max_eur);
            if (s.ask_min_eur != null) return Number(s.ask_min_eur);
            const byRound = this.defaultProposedAmountForRound(roundEnum);
            if (byRound != null) return byRound;
            return 500_000;
          })(),
          round: roundEnum,
          deal_type: this.pickDealTypeForRound(roundEnum),
        };
      }
      const total = Math.min(100, score + budget);
      const fullBreakdown: ScoreBreakdown = { ...breakdown, budget };
      if (total >= minScore) matches.push({ targetId: s.id, score: total, breakdown: fullBreakdown, enrich });
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
        deal_type: m.enrich?.deal_type ?? null,
        round: m.enrich?.round ?? null,
        proposed_amount_eur: m.enrich?.proposed_amount_eur ?? null,
        valuation_pre_money_eur: ((): number | null => {
          const prop = m.enrich?.proposed_amount_eur ?? null;
          if (prop == null) return null;
          if (m.enrich?.round === 'PRE_SEED' || m.enrich?.round === 'SEED') return Math.round(prop * 8);
          return Math.round(prop * 10);
        })(),
        ownership_target_pct: ((): number | null => {
          const prop = m.enrich?.proposed_amount_eur ?? null;
          const val = ((): number | null => {
            if (m.enrich?.round === 'PRE_SEED' || m.enrich?.round === 'SEED') return m.enrich?.proposed_amount_eur ? Math.round(m.enrich.proposed_amount_eur * 8) : null;
            return m.enrich?.proposed_amount_eur ? Math.round(m.enrich.proposed_amount_eur * 10) : null;
          })();
          if (prop == null || val == null || val <= 0) return null;
          const pct = (prop / val) * 100;
          return Math.max(1, Math.min(30, Math.round(pct)));
        })(),
        fund_id: m.enrich?.fund_id ?? null,
        budget_fit: ((): 'BELOW_RANGE' | 'WITHIN_RANGE' | 'ABOVE_RANGE' | 'UNKNOWN' | null => {
          if (m.enrich?.budget_fit) return m.enrich.budget_fit;
          return m.breakdown.budget != null ? 'UNKNOWN' : null;
        })(),
        budget_fit_score: m.enrich?.budget_fit_score ?? (m.breakdown.budget != null ? Number(m.breakdown.budget.toFixed(2)) : null),
        term_deadline: new Date(Date.now() + 1000 * 3600 * 24 * 90),
      });
      await this.opportunityRepo.logEvent({ opportunity_id: op.id, type: 'auto_created', payload: { score: op.score, breakdown: op.score_breakdown, source: 'generateForInvestor' } });
      created++;
    }
    return { created };
  }

  async generateForPartner(partnerId: number, topK = 10, minScore = 45) {
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
