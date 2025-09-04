// Re-export the central Prisma client so that route handlers and other code
// can import with the configured tsconfig path alias `@/lib/prisma`.
import prisma from "@/infrastructure/persistence/prisma/client";
export { prisma };
export default prisma;