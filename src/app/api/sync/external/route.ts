import { NextRequest, NextResponse } from "next/server";
import { externalSyncService } from "../../../../composition/container";
import { syncState } from "../../../../infrastructure/logging/syncState";

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

    const ms = Date.now() - startedAt;
    return NextResponse.json({ ok: true, resources: executed, durationMs: ms });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    usage: "POST /api/sync/external",
    bodyExample: { resources: ["startups","investors","partners","events","users"], limit: 100 },
  note: "Add X-SYNC-TOKEN header if SYNC_TRIGGER_TOKEN is set.",
    lastRuns: syncState.runs.slice(-5),
    lastError: syncState.lastError,
  });
}
