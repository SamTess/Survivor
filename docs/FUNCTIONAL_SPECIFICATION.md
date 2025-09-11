<h1 align="center">Functional Specification – Survivor Platform</h1>

Version: 1.0  
Date: 2025-09-11  
Scope: Next.js web application connecting Startups, Investors and Partners for opportunity generation & management, engagement and analytics.

---

## 1. Product Goal & Vision
Provide a unified platform where:
1. Startups structure their profile, needs and updates.
2. Investors & Partners expose theses, programs or funding / pilot capabilities.
3. A bi‑directional opportunity engine scores and feeds an operational pipeline (NEW → DEAL/LOST).
4. Users interact via social engagement (likes, follows, bookmarks, shares), messaging and events / news.
5. The team operates on acquisition, engagement and conversion metrics.

## 2. Roles & Personae
| Role | Primary Functional Description | Sample Actions |
|------|--------------------------------|---------------|
| Visitor | Not authenticated | View public pages, start basic analytics session |
| Authenticated User (Generic) | Created account (default USER role) | Update user profile, follow entities |
| Startup Owner / Founder | Manages one or more startup profiles | Create/edit profile, publish news, view opportunities |
| Investor | Manages investment focus & funds | See matching startups, manage pipeline |
| Partner | Manages programs / pilot budgets | Publish events / offers, partner pipeline |
| Admin | Supervision & governance | Manage roles, permissions, quotas, security oversight |

## 3. Functional Scope (In / Out)
IN:
- Email + password authentication (httpOnly JWT cookie) & password reset.
- Profiles: Startup, Investor, Partner, Investment Fund.
- Opportunity engine (auto creation + scoring + status + events).
- Social engagement: views, likes, bookmarks, follows, shares.
- Basic messaging (conversations, messages, emoji reactions).
- News & Events (publishing + counters).
- Media storage (files, per‑user quota, public/private visibility).
- Acquisition & content analytics (sessions, interactions, daily aggregates).
- Permissions & roles (granular CRUD flags, roles ref + user_role join).

OUT (current phase):
- Real‑time (WebSocket) messaging (currently not real‑time).
- Payments / billing.
- Advanced moderation / abuse reporting.
- OAuth / MFA (future roadmap).

## 4. Assumptions / Constraints
- PostgreSQL 16 database; referential integrity via Prisma.
- Scalability favors consistency first (vertical scaling + indices) before multi‑region.
- Basic GDPR posture: no unnecessary PII in analytics metadata; IP hashed (sha256).
- Initial SLO target: API p95 latency < 500ms on critical journeys (login, fetch opportunities).
- Initial target volume: 5k users, 50k cumulative opportunities, 1M lightweight analytics events / month.

## 5. Main Entities (Functional View)
- User (S_USER): identity, roles, permissions, quotas.
- Startup / Investor / Partner (S_STARTUP / S_INVESTOR / S_PARTNER): enriched profiles.
- Fund (INVESTMENT_FUND): financial metadata (ticket, AUM, focus).
- Opportunity (OPPORTUNITY): directional relation + score + status + deal/pilot attributes.
- Opportunity Event (OPPORTUNITY_EVENT): pipeline audit (transition, note, rescoring, pilot, deal).
- News & Event (S_NEWS, S_EVENT): publishable content + counters.
- Messages & Reactions (S_MESSAGE, S_MESSAGE_REACTION).
- Engagement (S_LIKE, S_FOLLOW, S_BOOKMARK, derived views).
- Analytics (S_SESSION, S_PAGE_VIEW, S_INTERACTION_EVENT, S_DAILY_* aggregates).
- Media Storage (S_MEDIA_STORAGE, S_USER_STORAGE_QUOTA).
- Feature Vector (FEATURE_VECTOR) for matching & scoring.

## 6. Key User Journeys

### 6.1. Sign Up & Login
Goal: Convert a visitor into an active user.
Flow:
1. Visitor opens /signup → form (name, email, password, optional intended role).
2. Submit → API creates S_USER (scrypt hash) + base role.
3. Redirect to dashboard (httpOnly JWT cookie issued).
4. On /login → validate & reissue cookie.
Exceptions / Errors:
- Existing email → targeted error message.
- Wrong password → internal counter (future brute force throttle).
Success Metric: activation rate (authenticated sessions / signups) > 70%.

### 6.2. Password Reset
1. User clicks “Forgot password”.
2. Provides email → generate unique token (S_PASSWORD_RESET) expiring (e.g. 30 min).
3. Email (script) with link /reset?token=…
4. New password submission → invalidate token (used=true) + hash rotation.
5. Auto login (optional) or redirect /login.

### 6.3. Create / Update Startup Profile
1. Authenticated founder chooses “Create Startup”.
2. Fills basics (name, sector, maturity, contact, pitch & use of funds).
3. Adds extended details (website, needs) + linked founders (S_FOUNDER).
4. Save → feature vector generation (later pipeline script) + counters initialization.
5. Optional News publication for visibility.
KPIs: profile completeness (% key fields), time to first generated opportunity.

### 6.4. Investor Profile & Funds
1. Investor creates/edits profile (sector, geo, stage focus, type, description).
2. Adds one or more funds (ticket_min/max, vintage, dry powder, sector_focus).
3. Opportunity pipeline surfaces matches (after feature vector build + generation scripts).
4. Can adjust focus → rescoring (RESCORED event created).

### 6.5. Opportunity Generation & Management
Sources: pipeline script (automatic) or future manual creation.
Lifecycle:
1. NEW opportunity created (score & optional breakdown).
2. Authorized user moves status: QUALIFIED → CONTACTED → IN_DISCUSSION → PILOT → DEAL / LOST.
3. Each transition or note creates timestamped OPPORTUNITY_EVENT.
4. Capture financial attributes (proposed_amount, valuation, round, budget_fit, pilot_budget_fit, deadlines).
5. DEAL or LOST freezes progression; later notes still possible (post‑mortem insights).
KPIs: conversion (NEW→DEAL), average duration per stage, opportunity volume by direction.

### 6.6. Social Engagement (Like, Follow, Bookmark, Share)
1. User clicks action on a card (Startup / Event / News / User).
2. API records interaction (S_INTERACTION_EVENT) + S_LIKE / S_FOLLOW / S_BOOKMARK rows if applicable.
3. Increment real‑time counters (derived or direct columns) + update daily aggregates.
4. Reversal (unlike/unfollow) removes corresponding row.
Purpose: qualify interest & refine future scoring.
KPIs: engagement by content type, views→likes ratio, follower growth.

### 6.7. Publish News & Events
1. Startup owner or partner opens “Publish”.
2. Fills title + description (+ date / location for Event).
3. Stored (S_NEWS / S_EVENT) initializing counters to 0.
4. Views & interactions fueled via analytics + direct interactions.
5. Editing possible (no version history in MVP).

### 6.8. Messaging & Reactions
1. User initiates conversation (S_CONVERSATION) adding participants.
2. Sends message → stored in S_MESSAGE (timestamp, sender_id).
3. Emoji reactions (S_MESSAGE_REACTION) added (uniqueness per message/user/emoji).
4. (Future) Push / notification update.
KPIs: active messages / active users, median first reply time.

### 6.9. Media Upload & Quotas
1. User opens “Media” interface.
2. Upload file (validate size < remaining quota, allowed MIME type).
3. Persist metadata (S_MEDIA_STORAGE) + update quota (S_USER_STORAGE_QUOTA.used_bytes).
4. Quota exceeded → block + message.
5. Deleting file releases space.

### 6.10. Analytics (Session → Interaction → Aggregates)
1. Page load: POST /api/analytics/session (ContentType=PAGE) → session id.
2. Page view(s): POST /api/analytics/page-view (path, sessionId).
3. Interactions: POST /api/analytics/interaction.
4. Service increments daily aggregates (content + acquisition) and entity counters.
5. Dashboard (future) will read aggregates for charts.
KPIs: daily sessions, new session ratio, signups, views per content, CAC proxy (future).

## 7. Key Business Rules
- Opportunity uniqueness on (direction, source_type, source_id, target_type, target_id) (prevents duplicate pipeline entries).
- Opportunity status progression in defined order; rollback limited (allowed via NOTE + new status if business rationale—TBD).
- Password reset token single use & invalid after expiry → invalidate upon use.
- Message reaction uniqueness (message_id, user_id, emoji) → toggle via deletion.
- Like / Follow / Bookmark: composite id prevents duplicates; re‑click = remove.
- Storage quota: upload denied if used_bytes + file_size > max_bytes.
- Daily aggregate (day, contentType, contentId) unique for atomic increment.

## 8. Permissions (Simplified Functional View)
| Action | Minimum Role | Notes |
|--------|--------------|-------|
| Create Startup | USER | Becomes implicit owner/founder |
| Publish Startup News | Startup Owner | |
| Create Partner Event | Partner Owner | |
| Update Opportunity Status | Owning role / Admin | To refine for multi‑ownership |
| Manage Roles & Permissions | Admin | Future admin UI |
| Delete Another's Media | Admin | Audit log recommended |

## 9. Non‑Functional
| Domain | Initial Requirement |
|--------|---------------------|
| Performance | p95 < 500ms on critical endpoints; mandatory pagination |
| Scalability | Indices on filtered columns (status, occurredAt, contentType) + separated ETL scripts |
| Security | httpOnly JWT, scrypt hashing, Secure cookies in prod, input validation (to extend) |
| Resilience | Idempotent pipeline scripts, atomic migrations |
| Observability | /api/health check; opportunity & auth event logs |
| Compliance | Hashed IP + data minimization; future tracking consent |
| Maintainability | Onion architecture separation of domains / infra / presentation |

## 10. Success Indicators (Alpha Phase)
- Signup→complete startup profile rate ≥ 40%.
- ≥ 60% of opportunities reach at least QUALIFIED.
- Median NEW→CONTACTED duration < 7 days.
- Content view → interaction (like/bookmark/follow) ratio ≥ 5%.
- 5xx errors < 0.5% of requests.

## 11. Error Handling & UI Feedback (Summary)
| Case | User Message | Technical Strategy |
|------|--------------|--------------------|
| Email already used | "Email already registered" | 409 / server-side validation |
| Invalid auth | "Invalid credentials" | 401 + no password detail |
| Media quota exceeded | "Quota reached" | Reject upload pre‑persistence |
| Unauthorized action | "Insufficient permission" | 403 + audit log (future) |
| Duplicate opportunity | Silent or message | DB unique constraint |

## 12. Glossary
- Opportunity: Potential collaboration / investment proposition linking two entities.
- Opportunity Score: Computed value (0–100) derived from tag similarity, focus, financial matching.
- Pipeline: Standardized opportunity status sequence.
- Feature Vector: Representation (tags + tfidf) stored for matching.
- Interaction: User event (LIKE, FOLLOW, BOOKMARK, SHARE, SIGNUP, etc.).

## 13. Open Points / Future Decisions
| Topic | Question | Status |
|-------|----------|--------|
| Opportunity status downgrade | Allow IN_DISCUSSION → QUALIFIED rollback? | TBD |
| Logical vs physical message deletion | Need soft delete? | To frame |
| Analytics retention policy | Purge > 12 months? | To define |
| Real‑time notifications | SSE vs WebSocket | To evaluate |
| Analytics cookie consent | Banner required? | Market dependent |

## 14. Functional Roadmap (Brief)
- SSO / OAuth (GitHub, Google).
- Analytics dashboard (aggregate visualization).
- Hybrid recommendation engine (collaborative + content).
- Feature flags & A/B testing.
- Advanced pipeline filters (owner, round, budget fit).
