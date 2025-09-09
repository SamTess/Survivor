export type StartupForScoring = {
  id: number;
  sector?: string | null;
  description?: string | null;
  maturity?: string | null;
  address?: string | null;
  created_at?: Date | null;
  viewsCount?: number;
  likesCount?: number;
  bookmarksCount?: number;
  details: Array<{ needs?: string | null }>;
};

export interface OpportunityReadRepository {
  getStartupForScoring(id: number): Promise<StartupForScoring | null>;
}
