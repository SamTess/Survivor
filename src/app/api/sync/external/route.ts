import { NextRequest, NextResponse } from "next/server";
import { externalSyncService } from "../../../../composition/container";
import { syncState } from "../../../../infrastructure/logging/syncState";

/**
 * @openapi
 * /api/sync/external:
 *   post:
 *     tags:
 *       - Sync
 *     summary: Sync external data
 *     description: Synchronize data from external sources (requires authentication token if configured)
 *     parameters:
 *       - in: header
 *         name: x-sync-token
 *         required: false
 *         schema:
 *           type: string
 *         description: Sync authentication token (required if SYNC_TRIGGER_TOKEN is set)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 default: 100
 *                 description: Maximum number of records to sync per resource
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [all, startups, investors, partners, events, users, news]
 *                 default: ["all"]
 *                 description: Resources to sync (startups, investors, partners, events, users, news, or "all")
 *           example:
 *             limit: 50
 *             resources: ["startups", "investors", "events"]
 *     responses:
 *       200:
 *         description: Sync operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 resources:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of resources that were synchronized
 *                   example: ["startups", "investors", "events"]
 *                 durationMs:
 *                   type: integer
 *                   description: Sync operation duration in milliseconds
 *                   example: 2340
 *             example:
 *               ok: true
 *               resources: ["startups", "investors", "events"]
 *               durationMs: 2340
 *       401:
 *         description: Unauthorized - missing or invalid sync token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error during sync
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error during sync"
 */
export async function POST(req: NextRequest) {
  try {
    const tokenRequired = process.env.SYNC_TRIGGER_TOKEN;
    if (tokenRequired) {
      const header = req.headers.get("x-sync-token");
      if (header !== tokenRequired) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

  type SyncBody = { limit?: number; resources?: unknown };
  let body: SyncBody = {};
  try { body = (await req.json()) as SyncBody; } catch { /* empty body */ }
  const limit = typeof body.limit === "number" && body.limit > 0 ? body.limit : 100;
  const resourcesInput = Array.isArray(body.resources) ? (body.resources as unknown[]).map(String) : ["all"];
  const resources = resourcesInput.includes("all") ? ["startups","investors","partners","events","users","news"] : resourcesInput;

    const startedAt = Date.now();
    const executed: string[] = [];

    for (const r of resources) {
      if (r === "startups") { await externalSyncService.syncStartups(limit); executed.push("startups"); }
      else if (r === "investors") { await externalSyncService.syncInvestors(limit); executed.push("investors"); }
      else if (r === "partners") { await externalSyncService.syncPartners(limit); executed.push("partners"); }
      else if (r === "events") { await externalSyncService.syncEvents(limit); executed.push("events"); }
      else if (r === "users") { await externalSyncService.syncUsers(limit); executed.push("users"); }
      else if (r === "news") { await externalSyncService.syncNews(limit); executed.push("news"); }
    }

    externalSyncService.reconcileFoundersMissingUser().catch(() => { /* ignore errors */ });
    const ms = Date.now() - startedAt;
    return NextResponse.json({ ok: true, resources: executed, durationMs: ms });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/sync/external:
 *   get:
 *     tags:
 *       - Sync
 *     summary: Get sync status
 *     description: Get information about sync operations and recent history
 *     responses:
 *       200:
 *         description: Sync status information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usage:
 *                   type: string
 *                   description: API usage instructions
 *                   example: "POST /api/sync/external"
 *                 bodyExample:
 *                   type: object
 *                   description: Example request body for POST method
 *                   properties:
 *                     resources:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["startups", "investors", "partners", "events", "users"]
 *                     limit:
 *                       type: integer
 *                       example: 100
 *                 note:
 *                   type: string
 *                   description: Additional authentication notes
 *                   example: "Add X-SYNC-TOKEN header if SYNC_TRIGGER_TOKEN is set."
 *                 lastRuns:
 *                   type: array
 *                   description: Recent sync operation history (last 5 runs)
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Run timestamp
 *                       resources:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Resources synchronized
 *                       duration:
 *                         type: integer
 *                         description: Duration in milliseconds
 *                 lastError:
 *                   type: string
 *                   nullable: true
 *                   description: Last error message if any
 *             example:
 *               usage: "POST /api/sync/external"
 *               bodyExample:
 *                 resources: ["startups", "investors", "partners", "events", "users"]
 *                 limit: 100
 *               note: "Add X-SYNC-TOKEN header if SYNC_TRIGGER_TOKEN is set."
 *               lastRuns:
 *                 - timestamp: "2024-01-15T10:30:00.000Z"
 *                   resources: ["startups", "investors"]
 *                   duration: 1234
 *               lastError: null
 */
export async function GET() {
  return NextResponse.json({
    usage: "POST /api/sync/external",
    bodyExample: { resources: ["startups","investors","partners","events","users"], limit: 100 },
  note: "Add X-SYNC-TOKEN header if SYNC_TRIGGER_TOKEN is set.",
    lastRuns: syncState.runs.slice(-5),
    lastError: syncState.lastError,
  });
}
