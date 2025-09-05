import { User } from "../../../domain/entities/User";

export interface UserRepository {
  getById(id: number): Promise<User | null>;
  save(user: User): Promise<void>;
}