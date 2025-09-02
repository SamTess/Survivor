import { UserRepositoryPrisma } from "../infrastructure/persistence/prisma/UserRepositoryPrisma";
import { UserService } from "../application/services/users/UserService";
import { SessionRepositoryPrisma } from "../infrastructure/persistence/prisma/SessionRepositoryPrisma";
import { InteractionEventRepositoryPrisma } from "../infrastructure/persistence/prisma/InteractionEventRepositoryPrisma";
import { PageViewRepositoryPrisma } from "../infrastructure/persistence/prisma/PageViewRepositoryPrisma";
import { DailyContentMetricsRepositoryPrisma } from "../infrastructure/persistence/prisma/DailyContentMetricsRepositoryPrisma";
import { DailyAcquisitionMetricsRepositoryPrisma } from "../infrastructure/persistence/prisma/DailyAcquisitionMetricsRepositoryPrisma";
import { AnalyticsService } from "../application/services/analytics/AnalyticsService";

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
