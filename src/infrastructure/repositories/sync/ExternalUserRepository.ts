import { UserApiResponse } from "../../../domain/interfaces/User";

export interface ExternalUserRepository {
  upsert(item: UserApiResponse): Promise<void>;
  saveImage(userId: number, data: Buffer): Promise<void>;
}
