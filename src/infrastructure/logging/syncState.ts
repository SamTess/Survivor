export interface SyncItemError {
  scope: string;
  page: number;
  index: number;
  id?: unknown;
  message: string;
  stack?: string;
  at: string; // ISO date
}

export interface SyncRunSummary {
  scope: string;
  startedAt: string;
  finishedAt?: string;
  pages: number;
  items: number;
  errors: SyncItemError[];
  aborted?: boolean;
  note?: string;
}

export const syncState = {
  runs: [] as SyncRunSummary[],
  lastError: undefined as SyncItemError | undefined,
  push(run: SyncRunSummary) {
    if (this.runs.length > 25) this.runs.shift();
    this.runs.push(run);
  },
  recordError(err: SyncItemError) {
    this.lastError = err;
    const current = this.runs[this.runs.length - 1];
    if (current && current.scope === err.scope) {
      current.errors.push(err);
    }
  },
};
