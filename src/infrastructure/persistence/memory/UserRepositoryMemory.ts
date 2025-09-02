import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../repositories/UserRepository";

// Stockage simple en mémoire. Pas de persistance : reset à chaque restart du process.
export class UserRepositoryMemory implements UserRepository {
  // On peut injecter un tableau initial (ex: pour des tests)
  constructor(private users: User[] = []) {}

  async getById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async save(user: User): Promise<void> {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx === -1) {
      // logique minimale : si pas trouvé on l'ajoute (comportement différent de Prisma.update qui lancerait une erreur)
      this.users.push(user);
    } else {
      this.users[idx] = user;
    }
  }

  // Méthode utilitaire non présente dans l'interface mais pratique pour les tests
  insert(user: User) { this.users.push(user); }
  all(): User[] { return [...this.users]; }
  clear() { this.users.splice(0, this.users.length); }
}
