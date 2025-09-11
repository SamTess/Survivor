export interface InvestmentFund {
  id: string;
  investor_id: number;
  name: string;
  vintage?: number | null;
  aum_eur?: number | null;
  dry_powder_eur?: number | null;
  investment_period_start?: Date | null;
  investment_period_end?: Date | null;
  ticket_min_eur?: number | null;
  ticket_max_eur?: number | null;
  follow_on_ratio?: number | null;
  sector_focus?: string[];
  geo_focus?: string[];
  stage_focus?: string[];
}
