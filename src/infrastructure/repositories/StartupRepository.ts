import { StartupDetailApiResponse, StartupListApiResponse, StartupFounder } from "../../domain/interfaces/Startup";

export interface StartupRepository {
  upsertList(item: StartupListApiResponse): Promise<void>;
  upsertDetail(item: StartupDetailApiResponse): Promise<void>;
  upsertFounders(founders: StartupFounder[], startupId: number): Promise<void>;
}
