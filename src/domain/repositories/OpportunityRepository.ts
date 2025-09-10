import { Opportunity, OpportunityEvent } from "../entities/Opportunity";
import { EntityType, OpportunityStatus } from "../enums/Opportunities";

export interface OpportunityRepository {
  upsertUnique(op: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Opportunity>;
  getById(id: string): Promise<Opportunity | null>;
  listByStatus(status: OpportunityStatus, page: number, limit: number): Promise<{ items: Opportunity[]; total: number }>;
  listForEntity(entityType: EntityType, entityId: number, page: number, limit: number): Promise<{ items: Opportunity[]; total: number }>;
  updateStatus(id: string, status: OpportunityStatus, reason?: string | null): Promise<Opportunity | null>;
  logEvent(evt: Omit<OpportunityEvent, 'id' | 'occurred_at'> & { occurred_at?: Date }): Promise<OpportunityEvent>;
  updateFields(
    id: string,
    data: {
      deal_type?: string | null;
      round?: string | null;
      proposed_amount_eur?: number | null;
      valuation_pre_money_eur?: number | null;
      ownership_target_pct?: number | null;
      fund_id?: string | null;
      budget_fit?: string | null;
      budget_fit_score?: number | null;
      pilot_estimated_cost_eur?: number | null;
      pilot_budget_fit?: string | null;
      term_deadline?: Date | null;
    }
  ): Promise<Opportunity | null>;
}

export type ScoreBreakdown = {
  tags: number;
  text: number;
  stage: number;
  geo: number;
  engagement: number;
  budget?: number;
};

export interface OpportunityScoringService {
  scorePair(
    A: {
      type: EntityType; id: number; country?: string | null; tags: Set<string>; tfidfVec: number[]; maturity?: string | null; needsText?: string | null; signals?: { views: number; likes: number; bookmarks: number; createdAt: Date } | null;
    },
    B: {
      type: EntityType; id: number; country?: string | null; tags: Set<string>; tfidfVec: number[]; maturity?: string | null; focusText?: string | null;
    }
  ): { score: number; breakdown: ScoreBreakdown };
}
