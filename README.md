<h1 align="center">Survivor Platform</h1>
<p align="center">
	<img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg" style="display:inline-block;" />&nbsp;
	<img alt="Node.js >=20" src="https://img.shields.io/badge/node-%3E=20-brightgreen" style="display:inline-block;" />&nbsp;
	<img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-black" style="display:inline-block;" />&nbsp;
	<img alt="Turbopack Enabled" src="https://img.shields.io/badge/Turbopack-enabled-orange" style="display:inline-block;" />&nbsp;
	<img alt="PostgreSQL 16" src="https://img.shields.io/badge/PostgreSQL-16-blue" style="display:inline-block;" />&nbsp;
	<img alt="Prisma ORM" src="https://img.shields.io/badge/ORM-Prisma-2D3748" style="display:inline-block;" />&nbsp;
	<img alt="Prisma Migrate" src="https://img.shields.io/badge/Prisma-Migrate-2D3748" style="display:inline-block;" />&nbsp;
	<img alt="TypeScript 5.9" src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" style="display:inline-block;" />&nbsp;
	<img alt="TailwindCSS 4" src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss&logoColor=white" style="display:inline-block;" />&nbsp;
	<img alt="Vitest" src="https://img.shields.io/badge/tests-vitest-informational" style="display:inline-block;" />&nbsp;
	<img alt="Coverage" src="https://img.shields.io/badge/coverage-unknown-lightgrey" style="display:inline-block;" />&nbsp;
	<img alt="Swagger Docs" src="https://img.shields.io/badge/API-Swagger-85EA2D?logo=swagger&logoColor=black" style="display:inline-block;" />&nbsp;
	<img alt="Docker Ready" src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" style="display:inline-block;" />&nbsp;
	<img alt="Terraform IaC" src="https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform&logoColor=white" style="display:inline-block;" />&nbsp;
	<img alt="Ansible Automation" src="https://img.shields.io/badge/Ansible-automation-EE0000?logo=ansible&logoColor=white" style="display:inline-block;" />&nbsp;
	<img alt="Conventional Commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673" style="display:inline-block;" />&nbsp;
	<img alt="CI Ready" src="https://img.shields.io/badge/CI-ready-success" style="display:inline-block;" />
</p>
<p align="center">
	An end‑to‑end platform for connecting Startups, Investors and Partners: profile management, opportunity scoring & deal pipeline, events & news publishing, inbound engagement analytics, messaging, media storage, access control and deployment automation – all powered by a clean Onion / Hexagonal style architecture on top of Next.js 15, TypeScript and PostgreSQL (Prisma).
</p>

---

## Table of Contents
1. Vision & Value Proposition
2. Feature Overview
3. Architecture & Design
4. Tech Stack
5. Directory Structure
6. Data Model Highlights
7. Getting Started (Quick Start / Docker)
8. Environment Variables
9. NPM Scripts & Tooling
10. Database & Migrations (Prisma)
11. Seeding, Scoring & Data Pipelines
12. Authentication & Authorization
13. Analytics & Engagement Tracking
14. Media Storage & Quotas
15. API Documentation
16. Testing Strategy
17. Deployment Overview
18. Security Practices
19. Contributing
20. Roadmap Ideas
21. License
22. Commit & Branch Conventions
23. Opportunity Lifecycle
24. Sample API Calls
25. ASCII Architecture Diagram
26. FAQ

---

## 1. Vision & Value Proposition
Survivor centralizes the lifecycle between innovative startups and capital/strategic partners. It streamlines:
- Structured Startup, Investor & Partner profiles.
- Automated opportunity generation & scoring (multi-directional S↔I / S↔P).
- Engagement layer: events, news, follows, likes, bookmarks, shares.
- Conversation & collaboration (messaging + reactions).
- Analytics for acquisition, retention and content performance.
- Secure media storage with quotas.
- Infrastructure automation (Terraform + Ansible + Docker) for reliable delivery.

## 2. Feature Overview
| Domain | Key Capabilities |
| ------ | ---------------- |
| Authentication | JWT (httpOnly cookie), middleware gatekeeping, password reset workflow. |
| User Entities | Users + roles + permissions + founders mapping. |
| Startup Profiles | Core & extended details, funding asks, founders, news feed. |
| Investors & Funds | Investor profiles, investment focus, funds metadata (AUM, ticket ranges). |
| Partners | Partnership types, pilot budgets, programs. |
| Opportunity Engine | Multi-entity directional opportunities with score, status pipeline, events audit trail. |
| Events & News | Publishing with engagement counters. |
| Messaging | Conversations, messages, emoji reactions. |
| Social / Engagement | Views, likes, bookmarks, follows, shares with daily aggregated metrics. |
| Analytics | Sessions, interaction events, UTM attribution, acquisition & content daily metrics. |
| Feature Vectors | TF‑IDF / tag storage per entity for matching & scoring enrichment. |
| Media Storage | Managed per‑user quota + metadata + public/private flag. |
| Role & Permission System | Roles reference, granular CRUD flags, user-role join table. |
| Deployment | Local Docker, staging & production automation, health checks, infra as code. |

## 3. Architecture & Design
Survivor applies an Onion / Clean Architecture layering:
- Domain (`src/domain`): Pure models, enums, repository contracts.
- Application (`src/application`): Use cases / services orchestrating domain logic.
- Infrastructure (`src/infrastructure`): Adapters (Prisma repos, security, email, storage, etc.).
- Presentation (`src/app` + UI components): Next.js App Router pages, API route handlers, React components.
- Composition (`src/composition`): Dependency injection / container wiring (see `instrumentation.ts`).

Cross-cutting concerns: authentication middleware (`middleware.ts`), analytics tracking, email, logging.

### High-Level Data Flow
1. User action (UI / API route) → Application Service (use case)
2. Service invokes Domain logic + Repositories (Prisma)
3. Side effects (events, metrics, feature vectors, media) recorded in dedicated tables
4. Aggregators / scripts build derived data (opportunity scores, daily metrics)
5. UI queries lean, pre‑indexed tables for fast dashboards.

### Why Next.js 15 + Turbopack?
Fast dev iterations, hybrid rendering, edge‑friendly middleware, co-location of API handlers and UI.

### Scalability Considerations
- Typed schema via Prisma for strong relational integrity.
- Clear separation allows swapping infrastructure (e.g. storage provider) with minimal impact.
- Event & metrics tables built for analytical extensions (indices prepared for common queries).

## 4. Tech Stack
| Layer | Technology |
|-------|------------|
| Web Framework | Next.js 15 (App Router, Middleware) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 + Typography plugin |
| DB | PostgreSQL 16 |
| ORM | Prisma 6.x |
| Auth | JWT (HMAC), Scrypt hashing |
| Testing | Vitest |
| Docs | Swagger (generated), Markdown knowledge base (`/docs`) |
| Scripts | tsx runtime utilities |
| Deployment | Docker, Terraform, Ansible |

## 5. Directory Structure (Excerpt)
```
public/                # Static assets
prisma/                # Prisma schema & migrations
src/
	app/                 # Next.js routes & API endpoints
	application/         # Use cases / services
	domain/              # Domain models & contracts
	infrastructure/      # Repositories, adapters, security, emails
	composition/         # DI container bootstrap
	components/          # UI building blocks
	utils/ | lib/        # Shared helpers
	__tests__/           # Vitest test suites
Docker/                # Dockerfiles & compose files
terraform/             # Infra as code
ansible/               # Provisioning & deployment automation
docs/                  # Architecture & feature documentation
```

## 6. Data Model Highlights
The Prisma schema (`prisma/schema.prisma`) defines rich relational entities. Key groups:
- Core Entities: `S_USER`, `S_STARTUP`, `S_INVESTOR`, `S_PARTNER`, `INVESTMENT_FUND`.
- Opportunity Engine: `OPPORTUNITY`, `OPPORTUNITY_EVENT` (status changes, rescoring, notes, deals, pilot start, etc.).
- Engagement & Social: `S_SESSION`, `S_INTERACTION_EVENT`, `S_PAGE_VIEW`, `S_FOLLOW`, `S_LIKE`, `S_BOOKMARK`, daily aggregates (`S_DAILY_CONTENT_METRICS`, `S_DAILY_ACQUISITION_METRICS`).
- Messaging: `S_CONVERSATION`, `S_CONVERSATION_USER`, `S_MESSAGE`, `S_MESSAGE_REACTION`.
- Security & Access: `S_PERMISSION`, `S_USER_ROLE`, `S_ROLES_REF`, `S_PASSWORD_RESET`.
- Media & Storage: `S_MEDIA_STORAGE`, `S_USER_STORAGE_QUOTA`.
- Matching / ML: `FEATURE_VECTOR` (tags + tfidf JSON for rank scoring).

Indices and unique constraints are defined to optimize common queries (status filtering, event timelines, content performance slices, UTM attribution analysis).

### Simplified ERD (Key Entities)
```
S_USER ──< S_USER_ROLE
	│ ──< S_PERMISSION
	│ ──< S_MESSAGE (sender)
	│ ──< S_MEDIA_STORAGE
	│ ──< S_PASSWORD_RESET
	│ ──< S_SESSION ──< S_PAGE_VIEW
	│             └──< S_INTERACTION_EVENT
S_STARTUP ──< S_STARTUP_DETAIL
	│ ──< S_FOUNDER >── S_USER
	│ ──< S_NEWS
S_INVESTOR ──< INVESTMENT_FUND
S_PARTNER
OPPORTUNITY ──< OPPORTUNITY_EVENT
FEATURE_VECTOR (by entity_type + entity_id)
Engagement: S_LIKE / S_FOLLOW / S_BOOKMARK (polymorphic contentType+contentId)
```

## 7. Getting Started
### Prerequisites
- Node.js ≥ 20
- npm ≥ 10
- Docker (optional but recommended for parity)

### Quick (Local, No Docker)
```
cp example_env .env        # Adjust values
npm install
npm run dev                # Starts Next.js on :3000
```
Visit: http://localhost:3000

### With Docker (Dev)
```
cd Docker
docker compose up -d
```
Health check: `curl http://localhost:3000/api/health`

### Database Migrations
```
npm run migrate:dev
```

## 8. Environment Variables (Core)
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string (Prisma datasource). |
| AUTH_SECRET | HMAC secret for JWT signing (change in production). |
| NEXT_PUBLIC_APP_URL | Public base URL for links. |
| NODE_ENV | `development` / `production`. |
| (Optional) EMAIL_* | Outgoing email / password reset if configured. |
| (Optional) EXTERNAL_API_* | Integrations & enrichment scripts. |

Store secrets outside VCS (e.g. `.env`, vault, cloud secrets). Never commit real credentials.

### Example `.env` (Development)
```
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/survivor_dev
AUTH_SECRET=change_me_for_dev_only
NEXT_PUBLIC_APP_URL=http://localhost:3000
EXTERNAL_API_BASE_URL=https://api.example.com
EXTERNAL_API_KEY=dev_key_here
```

## 9. NPM Scripts & Tooling
| Script | Purpose |
| ------ | ------- |
| dev | Start dev server (Turbopack). |
| build / build:legacy | Production build (Turbopack or classic). |
| start | Run compiled app. |
| test / test:watch | Vitest test suites. |
| migrate:dev / migrate:prod | Prisma migrations (dev deploy vs production). |
| docs:* | Generate & serve Swagger API docs (`docs/api`). |
| pipeline:opps | Build feature vectors, generate & enrich investor opportunities. |
| seed:* | Seed funds / startup deals. |
| cleanup-tokens | Maintenance script (token cleanup, sessions). |
| health-check | Programmatic availability check script. |

## 10. Database & Migrations
Prisma manages schema & migrations located in `prisma/migrations/`.
```
npx prisma migrate dev          # Create/apply in dev
npx prisma migrate deploy       # Deploy existing migrations in prod
npx prisma studio               # (Optional) Visual explore
```

## 11. Seeding, Scoring & Data Pipelines
Scripts (in `scripts/`):
- `build-feature-vectors.ts` → Computes TF‑IDF/tag vectors into `FEATURE_VECTOR`.
- `generate-investor-opps.ts` / `enrich-opportunities-finance.ts` → Creates & enriches cross-entity opportunities.
- `seed-funds.ts`, `seed-startup-deals.ts` → Populate baseline financial & deal data.
- `pipeline:opps` (composite) orchestrates a full scoring/enrichment pass.

## 12. Authentication & Authorization
- JWT stored in httpOnly `auth` cookie; middleware (`middleware.ts`) protects non‑public paths and redirects unauthenticated users to `/login` (with `next` param).
- Password hashing: Node `crypto.scrypt`.
- Extendable for MFA / OAuth providers or rotating secrets.
- Permissions: `S_PERMISSION` per user CRUD flags + role layering via `S_USER_ROLE` and definitions in `S_ROLES_REF`.
- Password reset workflow stored in `S_PASSWORD_RESET` with token & expiry.

## 13. Analytics & Engagement Tracking
Instrumentation captures:
- Sessions (`S_SESSION`) + UTM & referrer data.
- Interaction events per content (`S_INTERACTION_EVENT`).
- Page views (`S_PAGE_VIEW`).
- Aggregation tables (`S_DAILY_CONTENT_METRICS`, `S_DAILY_ACQUISITION_METRICS`) for reporting & dashboard queries.
Use these to build funnels: acquisition → engagement → conversion.

## 14. Media Storage & Quotas
`S_MEDIA_STORAGE` stores file metadata; `S_USER_STORAGE_QUOTA` tracks used bytes vs ceiling (default 2GB). Replace local disk adapter with S3/GCS by implementing a new infrastructure provider and keeping domain contracts stable.

## 15. API Documentation
Swagger docs are generated via `npm run docs:generate` and served locally (`npm run docs:serve`).
Generated outputs live in `docs/api/`. Update OpenAPI generation logic in `scripts/generate-swagger-docs.ts`.

## 16. Testing Strategy
- Framework: Vitest.
- Location: `src/__tests__/` (mirrors feature areas: analytics, api, auth, services, etc.).
- Recommended: add fast unit tests for domain services + integration tests for API routes (using `supertest`).
Run all: `npm test`.

## 17. Deployment Overview
Comprehensive instructions: see `DEPLOYMENT.md`.
Summary:
- Local: Docker Compose (`Docker/docker-compose.yml`).
- Staging / Production: Terraform provisions infra → Ansible deploys app → Docker Compose runs services.
- Health endpoint: `/api/health`.
Scripts: `terraform/deploy.sh`, `ansible/deploy.sh`, `scripts/full-deploy.sh`.

## 18. Security Practices
- Rotate `AUTH_SECRET` & database credentials; never reuse across environments.
- Principle of Least Privilege: restrict DB user grants.
- Enforce HTTPS in production (reverse proxy / load balancer not shown here).
- Sanitize user input & validate payloads (extend with Zod / class-validator if needed).
- Set secure cookie flags in production (`Secure`, `SameSite=Strict`).
- Monitor dependencies (`npm audit`) and upgrade frequently.

### Security Checklist (Operational)
- [ ] All secrets stored in a secret manager (not plaintext on server).
- [ ] Production cookies have `Secure`, `HttpOnly`, `SameSite=Strict`.
- [ ] DB user limited to required schemas only.
- [ ] Regular dependency scan (CI job advisable).
- [ ] Password reset tokens single‑use & expired pruned (see `cleanup-tokens`).
- [ ] Log review policy (retention + rotation) in place.
- [ ] Infrastructure access via SSH key; no password auth.
- [ ] Backups tested for restore integrity.
- [ ] Metrics / health endpoints protected or rate limited.

## 19. Contributing
1. Fork & branch: `feat/<short-description>`.
2. Add/Update tests for new logic.
3. Run: `npm run lint && npm test`.
4. Ensure migrations are intentional (avoid unrelated drift).
5. Open a PR with a concise summary + screenshots (UI changes) + migration notes.

### Style Guidelines
- Consistent TypeScript strictness.
- Keep domain pure (no external imports except types).
- Avoid business logic leakage into UI components.
- Name migrations descriptively (timestamp + intent).

## 20. Roadmap Ideas (Non-Exhaustive)
- OAuth providers (GitHub, Google) & MFA.
- Advanced recommendation engine (hybrid content + collaborative filtering).
- Real-time messaging via WebSocket / SSE.
- API rate limiting & global error observability.
- S3 / Object storage abstraction for media.
- Analytics dashboards (DataViz / BI integration).
- Role-based UI gating & feature flags.

## 21. License
Released under the MIT License – see `LICENSE` for full text.

---

## Quick Reference Cheat Sheet
| Action | Command |
| ------ | ------- |
| Start Dev | `npm run dev` |
| Run Tests | `npm test` |
| Migrate Dev | `npm run migrate:dev` |
| Build | `npm run build` |
| Generate Docs | `npm run docs:generate` |
| Opportunity Pipeline | `npm run pipeline:opps` |

---

### Support & Questions
Open an issue or start a discussion if you need clarification on architecture, data model decisions, or extension points.

Happy building! 🚀

---

## 22. Commit & Branch Conventions
Use concise, conventional commits (helps changelog & automation):
```
feat: add investor fund vintage filtering
fix: correct opportunity budget fit calculation
perf: index opportunity status for dashboard query
refactor: extract media storage quota logic
test: add unit tests for password reset expiry
docs: update deployment prerequisites
chore: bump prisma to 6.15.1
```
Branches:
```
main            # Production
development     # Staging / integration
feature/<slug>  # New features
fix/<slug>      # Patches
chore/<slug>    # Tooling / deps
```

## 23. Opportunity Lifecycle
Typical progression managed via `OPPORTUNITY.status` and logged in `OPPORTUNITY_EVENT`:
```
NEW → QUALIFIED → CONTACTED → IN_DISCUSSION → PILOT → DEAL
											    └──────────────→ LOST
```
Events (`OPPORTUNITY_EVENT.type`) capture transitions, rescoring, meetings, pilot start, deal signed, and free‑form notes for auditability.

## 24. Sample API Calls
Authentication:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
	-H 'Content-Type: application/json' \
	-d '{"name":"Alice","email":"alice@example.com","password":"Secret123!"}'

curl -X POST http://localhost:3000/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"alice@example.com","password":"Secret123!"}' -i
```
Fetch startups:
```bash
curl http://localhost:3000/api/startups?limit=20
```
Create (example - ensure auth cookie):
```bash
curl -X POST http://localhost:3000/api/opportunities \
	-H 'Content-Type: application/json' \
	-d '{"direction":"S_TO_I","source_type":"STARTUP","source_id":1,"target_type":"INVESTOR","target_id":5}'
```

## 25. ASCII Architecture Diagram
```
						┌────────────────────────────┐
						│        Presentation        │
						│  Next.js Pages & API Routes│
						└─────────────┬──────────────┘
									  │ (calls)
						┌─────────────▼──────────────┐
						│       Application Layer    │
						│  Services / Use Cases      │
						└─────────────┬──────────────┘
									  │ (interfaces)
						┌─────────────▼──────────────┐
						│          Domain            │
						│  Entities / Contracts      │
						└─────────────┬──────────────┘
									  │ (adapters)
						┌─────────────▼──────────────┐
						│       Infrastructure       │
						│ Prisma Repos / Email / Auth│
						└─────────────┬──────────────┘
									  │ (SQL)
						┌─────────────▼──────────────┐
						│       PostgreSQL 16        │
						└────────────────────────────┘
```

## 26. FAQ
**Q: Where do I add a new repository implementation?**
`src/infrastructure/<context>/` then expose via the composition container.
**Q: How do I add a new entity?**
Add to `schema.prisma` → run `npx prisma migrate dev` → create domain model/interface → repository + service.
**Q: How to regenerate API docs?**
`npm run docs:generate` then `npm run docs:serve`.
**Q: Why an Onion approach instead of plain MVC?**
To isolate core business logic from framework churn and external service variance.
**Q: How to improve scoring?**
Extend `FEATURE_VECTOR` generation script with additional semantic / numeric signals, recalc via `pipeline:opps`.


