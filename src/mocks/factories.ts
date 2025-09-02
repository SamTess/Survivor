// Simple factory helpers to create domain entities for tests/dev without hitting the real DB.
// Pas de lib externe (faker) pour rester léger.

import { User } from "../domain/entities/User";
import { Startup } from "../domain/entities/Startup";

let userIdSeq = 1;
let startupIdSeq = 1;

function nextUserId(): number { return userIdSeq++; }
function nextStartupId(): number { return startupIdSeq++; }

/**
 * Crée un utilisateur en mémoire.
 * - id auto si non fourni
 */
export function makeUser(overrides: Partial<User> = {}): User {
  const id = overrides.id ?? nextUserId();
  return {
    id,
    name: overrides.name ?? `User ${id}`,
    email: overrides.email ?? `user${id}@example.test`,
  };
}

/**
 * Crée une startup alignée sur le schéma (sans champs UI additionnels).
 */
export function makeStartup(overrides: Partial<Startup> = {}): Startup {
  const id = overrides.id ?? nextStartupId();
  return {
    id,
    name: overrides.name ?? `Startup ${id}`,
    legal_status: overrides.legal_status ?? "SAS",
    address: overrides.address ?? "123 Rue de Paris",
    phone: overrides.phone ?? "+33100000000",
    sector: overrides.sector ?? "CleanTech",
    maturity: overrides.maturity ?? "Seed",
    email: overrides.email ?? `contact${id}@startup.test`,
    description: overrides.description ?? "Description de la startup",
    image_data: overrides.image_data ?? undefined,
    created_at: overrides.created_at ?? new Date(),
  };
}

/**
 * Permet de réinitialiser les compteurs entre deux tests.
 */
export function resetFactories() { userIdSeq = 1; startupIdSeq = 1; }

// Utilisation rapide dans un test :
// const u = makeUser();
// const s = makeStartup();
// const custom = makeUser({ name: "Alice" });
