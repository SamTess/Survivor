import { describe, it, expect, vi } from "vitest";
import { ExternalSyncScheduler } from "../../application/services/sync/ExternalSyncScheduler";

interface FakeSyncService { syncAll: () => Promise<void>; }

describe("ExternalSyncScheduler", () => {
  it("appelle immédiatement puis périodiquement syncAll", async () => {
  const syncAll = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const svc: FakeSyncService = { syncAll };
    const scheduler = new ExternalSyncScheduler(svc, 15);
    scheduler.start();
    await new Promise(r => setTimeout(r, 5));
    expect(syncAll.mock.calls.length).toBe(1);
    await new Promise(r => setTimeout(r, 30));
    scheduler.stop();
    expect(syncAll.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("n'exécute pas de chevauchement si run longue", async () => {
    let running = false;
  const syncAll = vi.fn<() => Promise<void>>().mockImplementation(async () => {
      if (running) throw new Error("chevauchement");
      running = true;
      await new Promise(r => setTimeout(r, 40));
      running = false;
  });
  const svc: FakeSyncService = { syncAll };
    const scheduler = new ExternalSyncScheduler(svc, 10);
    scheduler.start();
    await new Promise(r => setTimeout(r, 85));
    scheduler.stop();
    expect(syncAll.mock.calls.length).toBeLessThanOrEqual(3);
    expect(syncAll.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
