import { CreateSessionInput, Session } from "../../../domain/entities/analytics/Session";

export interface SessionRepository {
  create(data: CreateSessionInput): Promise<Session>;
  findById(id: string): Promise<Session | null>;
}
