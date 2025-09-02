import { NewsApiResponse, NewsDetailApiResponse } from "../../../domain/interfaces/News";

export interface NewsRepository {
  upsert(item: NewsApiResponse | NewsDetailApiResponse): Promise<void>;
  saveImage(newsId: number, data: Buffer): Promise<void>;
}
