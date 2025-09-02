# Analytics - Developer Guide

This document explains the architecture, usage, and extension points of the analytics module (sessions, page views, interactions, daily metrics) implemented with an Onion Architecture inside the Next.js app.

## Goals
- Track sessions (origin, UTM attribution, device UA hash potential).
- Record page views.
- Record user interactions (click, like, bookmark, share, follow, signup, etc.).
- Aggregate daily content metrics (views, likes, etc.) and acquisition metrics (sessions, users, signups).

## Architecture (Onion)
Layer | Location | Role
------|----------|-----
Domain (types/enums) | `src/domain/entities/analytics` & `src/domain/enums/Analytics.ts` | Pure business models (no infra coupling).
Use Cases / Services | `src/application/services/analytics/AnalyticsService.ts` | Orchestrates business logic.
Repository Interfaces | `src/infrastructure/repositories/analytics` | Persistence contracts.
Prisma Implementations | `src/infrastructure/persistence/prisma/*RepositoryPrisma.ts` | Concrete DB access.
Composition | `src/composition/container.ts` | Wires real implementations.
API Adapters | `src/app/api/analytics/*/route.ts` | Next.js routes calling the service.

## Domain Enums
`ContentType`: USER, STARTUP, EVENT, NEWS, PAGE  
`EventType`: VIEW, CLICK, LIKE, BOOKMARK, SHARE, FOLLOW, UNFOLLOW, SIGNUP, LOGIN, COMMENT

## Exposed Service
`AnalyticsService` (`AnalyticsService.ts`)
- `startSession(input: CreateSessionInput): Promise<Session>`
  - Creates a session, increments acquisition metrics (sessions + users if `userId` provided).
- `recordPageView(input: RecordPageViewInput): Promise<void>`
  - Saves a page view. If the path matches `/startup|news|event/:id`, increments `views` for that content item.
- `recordInteraction(input: RecordInteractionInput): Promise<void>`
  - Stores an interaction event and updates content metrics (clicks, likes, bookmarks, shares, followers) depending on `eventType`.
  - If `eventType` = SIGNUP, also increments acquisition metrics (signups + users if `userId`).

## Key Input Types
```
CreateSessionInput {
  userId?: number | null
  contentType: ContentType
  contentId?: number | null
  metadata?: Record<string, unknown> | null
  ip?: string | null  // hashed (sha256) in repository
  userAgent?: string | null
  referrerHost?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmTerm?: string | null
  utmContent?: string | null
}

RecordPageViewInput {
  sessionId?: string | null
  userId?: number | null
  path: string
  referrerHost?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
}

RecordInteractionInput {
  userId?: number | null
  sessionId?: string | null
  eventType: EventType
  contentType: ContentType
  contentId?: number | null
  metadata?: Record<string, unknown> | null
  ip?: string | null
  userAgent?: string | null
  referrerHost?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmTerm?: string | null
  utmContent?: string | null
}
```

## API Endpoints
All are JSON POST endpoints.

1. `POST /api/analytics/session`
   - Minimal body: `{ "contentType":"PAGE" }`
   - Response: `{ id: string }` (session identifier)
2. `POST /api/analytics/page-view`
   - Body: `{ "sessionId":"<uuid>", "path":"/startups/123" }`
   - Response: `{ ok: true }`
3. `POST /api/analytics/interaction`
   - Body: `{ "sessionId":"<uuid>", "eventType":"LIKE", "contentType":"STARTUP", "contentId":123 }`
   - Response: `{ ok: true }`

Useful headers: `x-forwarded-for` (IP), `User-Agent` (auto). IP is sha256 hashed before storage.

## Client Usage Example
```ts
// Create a session early (e.g. in a root client component / layout)
const sessionResp = await fetch('/api/analytics/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contentType: 'PAGE', utmSource: getParam('utm_source') })
});
const { id: sessionId } = await sessionResp.json();

// Record a page view
await fetch('/api/analytics/page-view', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId, path: window.location.pathname })
});

// Record a like interaction
await fetch('/api/analytics/interaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId, eventType: 'LIKE', contentType: 'STARTUP', contentId: 123 })
});
```

## Adding a New Event Type
1. Add value to `schema.prisma` `EventType` enum + run migration.
2. Add value to `src/domain/enums/Analytics.ts`.
3. Update `recordInteraction` mapping if it affects metrics.
4. (Optional) Update client instrumentation.

## Adding a New Content Type
1. Add value to `ContentType` enum in `schema.prisma` + migration.
2. Add value in `src/domain/enums/Analytics.ts`.
3. Extend path parsing regex (in `recordPageView`) or implement explicit mapping.
4. Use `dailyContent.increment` where relevant.

## Security & Privacy
- IP anonymized via sha256 hash. Not fully irreversible (dictionary risk) – consider salting if stricter privacy required.
- Do not put extra PII into `metadata` (caller responsibility).
- Consider opt‑in / consent (cookie banner) before triggering endpoints.

## Current Limitations
- No per-day per-user/session deduplication (raw counts).
- Simple regex path → content mapping.
- No schema validation yet (recommend adding Zod or similar).
- No read/query endpoints for aggregated metrics.

## Improvement Ideas
- GET endpoints for daily summaries (filters by date range, content, UTM).
- Track `lastActivityAt` / session duration.
- Client-side batching to reduce request volume.
- Queue/worker for async aggregation or enrichment.
- Salt & rotate IP hash.

## Recommended Tests
- `startSession` increments acquisition (sessions, conditional users).
- `recordPageView` increments views when path matches.
- `recordInteraction` updates appropriate counters per `EventType`.

## Fast Extension Points
- New per-content counter: add column to `S_DAILY_CONTENT_METRICS`, update repository + increments in service.
- Real-time dashboards: introduce cache (e.g. Redis) + background flush to Prisma.

---
Contact: Open a ticket or ask in channel #analytics.
