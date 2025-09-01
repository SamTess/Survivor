import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
	datasources: {
		db: {
			url: (() => {
				if (!process.env.DATABASE_URL) {
					throw new Error("DATABASE_URL environment variable is not set. Please configure your database connection.");
				}
				return process.env.DATABASE_URL;
			})(),
		},
	},
});

export default prisma;