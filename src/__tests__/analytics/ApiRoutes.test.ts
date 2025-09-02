import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../composition/container', () => {
  const startSession = vi.fn(async () => ({ id: 'sess-xyz' }));
  const recordPageView = vi.fn(async () => {});
  const recordInteraction = vi.fn(async () => {});
  return {
    analyticsService: { startSession, recordPageView, recordInteraction },
    __mocks: { startSession, recordPageView, recordInteraction },
  };
});

// Import après mock
import * as sessionRoute from '../../app/api/analytics/session/route';
import * as pvRoute from '../../app/api/analytics/page-view/route';
import * as interactionRoute from '../../app/api/analytics/interaction/route';
import * as container from '../../composition/container';

type AnalyticsContainerMock = typeof import('../../composition/container') & {
  __mocks: {
    startSession: ReturnType<typeof vi.fn>;
    recordPageView: ReturnType<typeof vi.fn>;
    recordInteraction: ReturnType<typeof vi.fn>;
  };
};
const mockedContainer = container as AnalyticsContainerMock;

function makeReq<T extends Record<string, unknown>>(body: T, headers: Record<string,string> = {}) {
  return { json: async () => body, headers: new Map(Object.entries(headers)) } as unknown as import('next/server').NextRequest;
}

describe('API analytics routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST /session retourne un id', async () => {
  const res = await sessionRoute.POST(makeReq({ contentType: 'PAGE' }));
  const json = await res.json();
  expect(json.id).toBe('sess-xyz');
  expect(mockedContainer.__mocks.startSession).toHaveBeenCalled();
  });

  it('POST /page-view ok true', async () => {
  const res = await pvRoute.POST(makeReq({ path: '/startups/1' }));
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(mockedContainer.__mocks.recordPageView).toHaveBeenCalled();
  });

  it('POST /interaction ok true', async () => {
  const res = await interactionRoute.POST(makeReq({ eventType: 'LIKE', contentType: 'STARTUP' }));
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(mockedContainer.__mocks.recordInteraction).toHaveBeenCalled();
  });
});
