import { NextRequest, NextResponse } from "next/server";
import { externalSyncService } from "../../../../composition/container";
import { syncState } from "../../../../infrastructure/logging/syncState";

/**
 * @api {post} /sync/external Sync External Data
 * @apiName SyncExternalData
 * @apiGroup Sync
 * @apiVersion 0.1.0
 * @apiDescription Synchronize data from external sources (requires authentication token if configured)
 *
 * @apiHeader {String} [x-sync-token] Sync authentication token (required if SYNC_TRIGGER_TOKEN is set)
 *
 * @apiParam {Number} [limit=100] Maximum number of records to sync per resource
 * @apiParam {String[]} [resources=["all"]] Resources to sync (startups, investors, partners, events, users, news, or "all")
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "limit": 50,
 *       "resources": ["startups", "investors", "events"]
 *     }
 *
 * @apiSuccess {Boolean} ok Operation success status
 * @apiSuccess {String[]} resources List of resources that were synchronized
 * @apiSuccess {Number} durationMs Sync operation duration in milliseconds
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ok": true,
 *       "resources": ["startups", "investors", "events"],
 *       "durationMs": 2340
 *     }
 *
 * @apiError (Error 401) {String} error Unauthorized - missing or invalid sync token
 * @apiError (Error 500) {String} error Internal server error during sync
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Unauthorized"
 *     }
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
 * @api {get} /sync/external Get Sync Status
 * @apiName GetSyncStatus
 * @apiGroup Sync
 * @apiVersion 0.1.0
 * @apiDescription Get information about sync operations and recent history
 *
 * @apiSuccess {String} usage API usage instructions
 * @apiSuccess {Object} bodyExample Example request body for POST method
 * @apiSuccess {String} note Additional authentication notes
 * @apiSuccess {Object[]} lastRuns Recent sync operation history (last 5 runs)
 * @apiSuccess {String} lastRuns.timestamp Run timestamp
 * @apiSuccess {String[]} lastRuns.resources Resources synchronized
 * @apiSuccess {Number} lastRuns.duration Duration in milliseconds
 * @apiSuccess {String} [lastError] Last error message if any
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "usage": "POST /api/sync/external",
 *       "bodyExample": {
 *         "resources": ["startups","investors","partners","events","users"],
 *         "limit": 100
 *       },
 *       "note": "Add X-SYNC-TOKEN header if SYNC_TRIGGER_TOKEN is set.",
 *       "lastRuns": [
 *         {
 *           "timestamp": "2024-01-15T10:30:00.000Z",
 *           "resources": ["startups", "investors"],
 *           "duration": 1234
 *         }
 *       ],
 *       "lastError": null
 *     }
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
