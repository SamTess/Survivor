import { EntityType, OpportunityDirection, OpportunityStatus } from "../enums/Opportunities";

export type Opportunity = {
  id: string;
  direction: OpportunityDirection;
  source_type: EntityType;
  source_id: number;
  target_type: EntityType;
  target_id: number;
  score?: number | null;
  score_breakdown?: Record<string, number> | null;
  status: OpportunityStatus;
  reason?: string | null;
  next_action?: string | null;
  owner_user_id?: number | null;
  created_at: Date;
  updated_at: Date;
};

export type OpportunityEvent = {
  id: string;
  opportunity_id: string;
  occurred_at: Date;
  type: string;
  payload?: Record<string, unknown> | null;
};
