import { PrismaClient } from "@prisma/client";

const getDatabaseUrl = (): string => {
	const url = process.env.DATABASE_URL;
	const isTest = !!process.env.VITEST || process.env.NODE_ENV === 'test';

	if (!url) {
		// Autoriser un placeholder silencieux en test (les tests unitaires n'accèdent souvent pas réellement à la DB)
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

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({
	datasources: {
		db: {
			url: getDatabaseUrl(),
		},
	},
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;