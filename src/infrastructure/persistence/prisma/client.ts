import { PrismaClient } from "@prisma/client";

const getDatabaseUrl = (): string => {
	const url = process.env.DATABASE_URL;
	const isTest = !!process.env.VITEST || process.env.NODE_ENV === 'test';

	if (!url) {
		if (isTest) {
			if (!process.env.QUIET_PRISMA_TEST) {
				console.warn('DATABASE_URL absent en test - utilisation d\'un placeholder inactif');
			}
			return 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
		}

		const isBuildTime = process.env.NODE_ENV === 'production' &&
			typeof window === 'undefined' &&
			!process.env.VERCEL &&
			!process.env.RAILWAY_ENVIRONMENT;

		if (isBuildTime) {
			console.warn('DATABASE_URL not available during build time - using placeholder');
			return 'postgresql://placeholder:placeholder@placeholder:5432/placeholder';
		}
		throw new Error("DATABASE_URL environment variable is not set. Please configure your database connection.");
	}
	return url;
};

const isBrowser = typeof window !== 'undefined';
const isEdge = typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge';

let prisma: PrismaClient;
if (isBrowser || isEdge) {
	// Fournit un proxy inerte pour éviter l'erreur "PrismaClient is unable to run in this browser environment".
	prisma = new Proxy({}, {
		get() {
			throw new Error('Prisma désactivé dans le runtime edge/browser');
		}
	}) as unknown as PrismaClient;
} else {
	const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
	prisma = globalForPrisma.prisma ?? new PrismaClient({
		datasources: { db: { url: getDatabaseUrl() } },
	});
	if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export default prisma;