import { PartnerApiResponse } from "../../domain/interfaces/Partner";

export interface PartnerRepository {
  upsert(item: PartnerApiResponse): Promise<void>;
}
