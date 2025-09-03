import { UserRepositoryPrisma } from "../infrastructure/persistence/prisma/UserRepositoryPrisma";
import { UserService } from "../application/services/users/UserService";
import { SessionRepositoryPrisma } from "../infrastructure/persistence/prisma/sync/SessionRepositoryPrisma";
import { InteractionEventRepositoryPrisma } from "../infrastructure/persistence/prisma/analytics/InteractionEventRepositoryPrisma";
import { PageViewRepositoryPrisma } from "../infrastructure/persistence/prisma/analytics/PageViewRepositoryPrisma";
import { DailyContentMetricsRepositoryPrisma } from "../infrastructure/persistence/prisma/analytics/DailyContentMetricsRepositoryPrisma";
import { DailyAcquisitionMetricsRepositoryPrisma } from "../infrastructure/persistence/prisma/analytics/DailyAcquisitionMetricsRepositoryPrisma";
import { AnalyticsService } from "../application/services/analytics/AnalyticsService";
import { ExternalApiClient } from "../infrastructure/external/ExternalApiClient";
import { StartupRepositoryPrisma } from "../infrastructure/persistence/prisma/sync/StartupRepositoryPrisma";
import { InvestorRepositoryPrisma } from "../infrastructure/persistence/prisma/sync/InvestorRepositoryPrisma";
import { PartnerRepositoryPrisma } from "../infrastructure/persistence/prisma/sync/PartnerRepositoryPrisma";
import { EventRepositoryPrisma } from "../infrastructure/persistence/prisma/sync/EventRepositoryPrisma";
import { ExternalUserRepositoryPrisma } from "../infrastructure/persistence/prisma/sync/ExternalUserRepositoryPrisma";
import { ExternalSyncService } from "../application/services/sync/ExternalSyncService";
import { NewsRepositoryPrisma } from "../infrastructure/persistence/prisma/sync/NewsRepositoryPrisma";
import { ensureExternalSyncSchedulerInstance } from "../application/services/sync/ExternalSyncScheduler";

const userRepo = new UserRepositoryPrisma();
export const userService = new UserService(userRepo);
const sessionRepo = new SessionRepositoryPrisma();
const interactionRepo = new InteractionEventRepositoryPrisma();
const pageViewRepo = new PageViewRepositoryPrisma();
const dailyContentRepo = new DailyContentMetricsRepositoryPrisma();
const dailyAcquisitionRepo = new DailyAcquisitionMetricsRepositoryPrisma();
export const analyticsService = new AnalyticsService(
	sessionRepo,
	interactionRepo,
	pageViewRepo,
	dailyContentRepo,
	dailyAcquisitionRepo
);

const externalBase = process.env.EXTERNAL_API_BASE_URL || "";
const externalKey = process.env.EXTERNAL_API_KEY || "";
const externalClient = new ExternalApiClient(externalBase, externalKey);
const startupRepo = new StartupRepositoryPrisma();
const investorRepo = new InvestorRepositoryPrisma();
const partnerRepo = new PartnerRepositoryPrisma();
const eventRepo = new EventRepositoryPrisma();
const extUserRepo = new ExternalUserRepositoryPrisma();
const newsRepo = new NewsRepositoryPrisma();
export const externalSyncService = new ExternalSyncService(
	externalClient,
	startupRepo,
	investorRepo,
	partnerRepo,
	eventRepo,
	extUserRepo,
	newsRepo
);

if (process.env.SYNC_AUTO !== "0") {
	const g = globalThis as unknown as { __syncSchedulerStarted?: boolean };
	if (!g.__syncSchedulerStarted) {
		const intervalMs = parseInt(process.env.SYNC_INTERVAL_MS || "3600000", 10);
		const scheduler = ensureExternalSyncSchedulerInstance(externalSyncService, intervalMs, { details: true, images: true });
		scheduler.start();
		g.__syncSchedulerStarted = true;
	}
}
