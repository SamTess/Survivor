import { UserRepository } from "../../../domain/repositories/UserRepository";
import { User } from "../../../domain/interfaces/User";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    if (!user.name || !user.email || !user.role) {
      throw new Error("Name, email, and role are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error("Invalid email format");
    }

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return this.userRepository.create(user);
  }

  async getUserById(id: number): Promise<User | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid user ID");
    }

    return this.userRepository.getById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.getAll();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email");
    }

    return this.userRepository.getByEmail(email);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    if (!role || role.trim().length === 0) {
      throw new Error("Role cannot be empty");
    }

    return this.userRepository.getByRole(role.trim());
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    if (startDate > endDate) {
      throw new Error("Start date cannot be after end date");
    }

    return this.userRepository.getByDateRange(startDate, endDate);
  }

  async getFounders(): Promise<User[]> {
    return this.userRepository.getFounders();
  }

  async getInvestors(): Promise<User[]> {
    return this.userRepository.getInvestors();
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    return this.userRepository.search(query.trim());
  }

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid user ID");
    }

    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error("Invalid email format");
      }

      const existingUser = await this.userRepository.getByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email already used by another user");
      }
    }

    const existing = await this.userRepository.getById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    return this.userRepository.update(id, updates);
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid user ID");
    }

    const existing = await this.userRepository.getById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    return this.userRepository.delete(id);
  }

  async getUsersPaginated(page: number, limit: number): Promise<{ users: User[], total: number }> {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Page must be a positive integer");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    return this.userRepository.getPaginated(page, limit);
  }

  // Legacy method for backward compatibility
  async updateEmail(id: number, email: string): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid user ID");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const user = await this.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.update(id, { email: email.trim() });
  }

  async getUserWithPassword(email: string): Promise<User & { password_hash: string } | null> {
    return this.userRepository.getUserWithPassword(email);
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid user ID");
    }

    if (!passwordHash || passwordHash.length < 8) {
      throw new Error("Password hash is required");
    }

    return this.userRepository.updatePassword(id, passwordHash);
  }
}
