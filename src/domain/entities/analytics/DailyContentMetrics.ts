import { ContentType } from "../../enums/Analytics";

export type DailyContentMetrics = {
  id: string;
  day: Date;
  contentType: ContentType;
  contentId: number;
  views: number;
  uniqueUsers: number;
  clicks: number;
  likes: number;
  bookmarks: number;
  shares: number;
  followers: number;
};

export type IncrementContentMetrics = {
  views?: number;
  uniqueUsers?: number;
  clicks?: number;
  likes?: number;
  bookmarks?: number;
  shares?: number;
  followers?: number;
};
