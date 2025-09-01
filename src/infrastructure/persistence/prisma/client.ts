import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DATABASE_URL || 'postgresql://default_user:default_password@localhost:5432/default_db',
		},
	},
});

export default prisma;