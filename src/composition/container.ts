import { UserRepositoryPrisma } from "../infrastructure/persistence/prisma/UserRepositoryPrisma";
import { UserService } from "../application/services/users/UserService";
import { SessionRepositoryPrisma } from "../infrastructure/persistence/prisma/SessionRepositoryPrisma";
import { InteractionEventRepositoryPrisma } from "../infrastructure/persistence/prisma/InteractionEventRepositoryPrisma";
import { PageViewRepositoryPrisma } from "../infrastructure/persistence/prisma/PageViewRepositoryPrisma";
import { DailyContentMetricsRepositoryPrisma } from "../infrastructure/persistence/prisma/DailyContentMetricsRepositoryPrisma";
import { DailyAcquisitionMetricsRepositoryPrisma } from "../infrastructure/persistence/prisma/DailyAcquisitionMetricsRepositoryPrisma";
import { AnalyticsService } from "../application/services/analytics/AnalyticsService";
import { ExternalApiClient } from "../infrastructure/external/ExternalApiClient";
import { StartupRepositoryPrisma } from "../infrastructure/persistence/prisma/StartupRepositoryPrisma";
import { InvestorRepositoryPrisma } from "../infrastructure/persistence/prisma/InvestorRepositoryPrisma";
import { PartnerRepositoryPrisma } from "../infrastructure/persistence/prisma/PartnerRepositoryPrisma";
import { EventRepositoryPrisma } from "../infrastructure/persistence/prisma/EventRepositoryPrisma";
import { ExternalUserRepositoryPrisma } from "../infrastructure/persistence/prisma/ExternalUserRepositoryPrisma";
import { ExternalSyncService } from "../application/services/sync/ExternalSyncService";
import { NewsRepositoryPrisma } from "../infrastructure/persistence/prisma/NewsRepositoryPrisma";

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

