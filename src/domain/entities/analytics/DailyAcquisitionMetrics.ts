export type DailyAcquisitionMetrics = {
  id: string;
  day: Date; // truncated to UTC midnight
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  sessions: number;
  users: number;
  signups: number;
};

export type IncrementAcquisitionMetrics = {
  sessions?: number;
  users?: number;
  signups?: number;
};
