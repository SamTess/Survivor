import { UserRepositoryPrisma } from "../infrastructure/persistence/prisma/users/UserRepositoryPrisma";
import { UserService } from "../application/services/users/UserService";

const userRepo = new UserRepositoryPrisma();
export const userService = new UserService(userRepo);