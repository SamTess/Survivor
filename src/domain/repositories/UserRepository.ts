import { User } from "../interfaces/User";

export interface UserRepository {
  // Create
  create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
  
  // Read
  getById(id: number): Promise<User | null>;
  getAll(): Promise<User[]>;
  getByEmail(email: string): Promise<User | null>;
  getByRole(role: string): Promise<User[]>;
  getFounders(): Promise<User[]>;
  getInvestors(): Promise<User[]>;
  search(query: string): Promise<User[]>;
  
  // Update
  update(id: number, user: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null>;
  
  // Delete
  delete(id: number): Promise<boolean>;
  
  // Pagination
  getPaginated(page: number, limit: number): Promise<{ users: User[], total: number }>;
  
  // Authentication related
  getUserWithPassword(email: string): Promise<User & { password_hash: string } | null>;
  updatePassword(id: number, passwordHash: string): Promise<boolean>;
}
