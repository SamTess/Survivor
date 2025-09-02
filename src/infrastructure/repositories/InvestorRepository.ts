import { InvestorApiResponse } from "../../domain/interfaces/Investor";

export interface InvestorRepository {
  upsert(item: InvestorApiResponse): Promise<void>;
}
