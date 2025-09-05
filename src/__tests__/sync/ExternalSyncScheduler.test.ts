import { describe, it, expect, vi } from "vitest";
import { ExternalSyncScheduler } from "../../application/services/sync/ExternalSyncScheduler";

interface MinimalSyncService {
  syncStartups: () => Promise<{ id: number }[]>;
  syncInvestors: () => Promise<unknown[]>;
  syncPartners: () => Promise<unknown[]>;
  syncEvents: () => Promise<{ id: number }[]>;
  syncUsers: () => Promise<{ id: number }[]>;
  syncNews: () => Promise<{ id: number }[]>;
  syncStartupById: (id: number) => Promise<void>;
  syncStartupImage: (id: number) => Promise<void>;
  syncEventImage: (id: number) => Promise<void>;
  syncUserImage: (id: number) => Promise<void>;
  syncNewsImage: (id: number) => Promise<void>;
  syncStartupFounderImage: (startupId: number, founderId: number) => Promise<Buffer>;
  reconcileFoundersMissingUser: () => Promise<void>;
}

describe("ExternalSyncScheduler", () => {
  function makeService(spyObj: { counts: Record<string, number> }): MinimalSyncService {
    const inc = (k: string) => () => { spyObj.counts[k] = (spyObj.counts[k] || 0) + 1; };
    const incArr = <T>(k: string, items: T[]) : T[] => { spyObj.counts[k] = (spyObj.counts[k] || 0) + 1; return items; };
    return {
      syncStartups: vi.fn(() => Promise.resolve(incArr("syncStartups", [{ id: 1 }] ))),
      syncInvestors: vi.fn(() => Promise.resolve(incArr("syncInvestors", [] ))),
      syncPartners: vi.fn(() => Promise.resolve(incArr("syncPartners", [] ))),
      syncEvents: vi.fn(() => Promise.resolve(incArr("syncEvents", [{ id: 10 }] ))),
      syncUsers: vi.fn(() => Promise.resolve(incArr("syncUsers", [{ id: 20 }] ))),
      syncNews: vi.fn(() => Promise.resolve(incArr("syncNews", [{ id: 30 }] ))),
      syncStartupById: vi.fn(async () => { inc("syncStartupById")(); }),
      syncStartupImage: vi.fn(async () => { inc("syncStartupImage")(); }),
      syncEventImage: vi.fn(async () => { inc("syncEventImage")(); }),
      syncUserImage: vi.fn(async () => { inc("syncUserImage")(); }),
      syncNewsImage: vi.fn(async () => { inc("syncNewsImage")(); }),
      syncStartupFounderImage: vi.fn(async () => { inc("syncStartupFounderImage")(); return Buffer.from("x"); }),
      reconcileFoundersMissingUser: vi.fn(async () => { inc("reconcileFoundersMissingUser")(); }),
    };
  }

  it("exécute immédiatement puis périodiquement la synchronisation étendue", async () => {
    const spyObj = { counts: {} as Record<string, number> };
    const svc = makeService(spyObj);
    const scheduler = new ExternalSyncScheduler(svc as unknown as any, 15, { details: true, images: true }); // eslint-disable-line @typescript-eslint/no-explicit-any
    scheduler.start();
    await new Promise(r => setTimeout(r, 5));
    expect(spyObj.counts.syncStartups).toBe(1);
    await new Promise(r => setTimeout(r, 30));
    scheduler.stop();
    expect(spyObj.counts.syncStartups).toBeGreaterThanOrEqual(2);
  });

  it("don't run overlapping if long", async () => {
    let running = false;
    const spyObj = { counts: {} as Record<string, number> };
    const svc = makeService(spyObj);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (svc.syncUsers as any).mockImplementation(async () => {
      if (running) throw new Error("overlapping");
      running = true;
      await new Promise(r => setTimeout(r, 40));
      running = false;
      spyObj.counts.syncUsers = (spyObj.counts.syncUsers || 0) + 1;
      return [{ id: 20 }];
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scheduler = new ExternalSyncScheduler(svc as unknown as any, 10, { details: false, images: false });
    scheduler.start();
    await new Promise(r => setTimeout(r, 100)); // Increased from 85 to 100ms to allow for timing variations
    scheduler.stop();
    expect(spyObj.counts.syncUsers).toBeLessThanOrEqual(3);
    expect(spyObj.counts.syncUsers).toBeGreaterThanOrEqual(2);
  });
});
