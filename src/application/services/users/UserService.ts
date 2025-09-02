import { UserRepository } from "../../../infrastructure/repositories/sync/UserRepository";
import { User } from "../../../domain/entities/User";

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getUserById(id: number): Promise<User | null> {
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid id");
    return this.repo.getById(id);
  }

  async updateEmail(id: number, email: string): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) throw new Error("User not found");
    user.email = email.trim();
    await this.repo.save(user);
  }
}
