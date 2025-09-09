/**
 * Utility functions for role management and normalization
 */

export type UserRole = 'user' | 'admin' | 'investor' | 'founder';
export type DatabaseRole = 'USER' | 'ADMIN' | 'INVESTOR' | 'FOUNDER';

/**
 * Type guard to check if a string is a valid DatabaseRole
 * @param role - The role string to check
 * @returns True if the role is a valid DatabaseRole
 */
function isDatabaseRole(role: string): role is DatabaseRole {
  return ['USER', 'ADMIN', 'INVESTOR', 'FOUNDER'].includes(role as DatabaseRole);
}

/**
 * Normalizes a database role to the frontend UserRole format
 * @param dbRole - The role from the database (uppercase)
 * @returns The normalized role for the frontend
 */
export function normalizeRole(dbRole: string | null | undefined): UserRole {
  if (!dbRole) return 'user';

  const upperRole = dbRole.toUpperCase();

  if (!isDatabaseRole(upperRole)) {
    return 'user';
  }

  switch (upperRole) {
    case 'ADMIN':
      return 'admin';
    case 'INVESTOR':
      return 'investor';
    case 'FOUNDER':
      return 'founder';
    case 'USER':
    default:
      return 'user';
  }
}

/**
 * Converts a normalized role back to database format (for storage)
 * @param normalizedRole - The normalized role from frontend
 * @returns The role in database format (uppercase)
 */
export function denormalizeRole(normalizedRole: UserRole): DatabaseRole {
  switch (normalizedRole) {
    case 'admin':
      return 'ADMIN';
    case 'investor':
      return 'INVESTOR';
    case 'founder':
      return 'FOUNDER';
    case 'user':
    default:
      return 'USER';
  }
}
