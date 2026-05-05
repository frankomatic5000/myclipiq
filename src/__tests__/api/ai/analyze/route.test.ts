/**
 * Unit tests for POST /api/ai/analyze
 * Mocks: Supabase auth + DB, pgmq RPC, env vars
 */

import { POST } from "@/app/api/ai/analyze/route";
import { NextRequest } from "next/server";

let mockSingle = jest.fn();
let mockEq = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
let mockSelect = jest.fn(() => ({ eq: mockEq }));
let mockFrom = jest.fn(() => ({ select: mockSelect }));
let mockUpdate = jest.fn(() => ({ eq: jest.fn() }));
let mockInsert = jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) }));
let mockRpc = jest.fn();
let mockGetSession = jest.fn();

function resetMocks() {
  mockSingle = jest.fn();
  mockEq = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
  mockSelect = jest.fn(() => ({ eq: mockEq }));
  mockFrom = jest.fn(() => ({ select: mockSelect, insert: mockInsert, update: mockUpdate }));
  mockUpdate = jest.fn(() => ({ eq: jest.fn() }));
  mockInsert = jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) }));
  mockRpc = jest.fn();
  mockGetSession = jest.fn();
}

const createMockSupabaseClient = () => ({
  auth: { getSession: mockGetSession },
  from: mockFrom,
  rpc: mockRpc,
});

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createMiddlewareClient: jest.fn(() => createMockSupabaseClient()),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}));

describe("POST /api/ai/analyze", () => {
  const userId = "user-123";
  const uploadId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const r2Key = `uploads/${userId}/test.mp4`;

  beforeEach(() => {
    resetMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
  });

  function makeReq(body: object): NextRequest {
    return {
      json: () => Promise.resolve(body),
    } as unknown as NextRequest;
  }

  test("success path — creates job and returns 200", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const chainable = {
      select: jest.fn(() => chainable),
      eq: jest.fn(() => chainable),
      insert: jest.fn(() => chainable),
      update: jest.fn(() => chainable),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    // First call is video_uploads select, then insert ai_analyses, insert analysis_jobs
    chainable.single
      .mockResolvedValueOnce({ data: { id: uploadId, status: "uploaded", content_type: "video/mp4" }, error: null })
      .mockResolvedValueOnce({ data: { id: "analysis-1" }, error: null })
      .mockResolvedValueOnce({ data: { id: "job-1" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null }); // final upload update

    mockFrom.mockReturnValue(chainable);

    mockRpc.mockResolvedValue({ error: null });

    const req = makeReq({ uploadId, r2Key, filename: "test.mp4" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      jobId: "job-1",
      analysisId: "analysis-1",
      status: "queued",
    });
  });

  test("unauthorized — returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const req = makeReq({ uploadId, r2Key });
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("missing uploadId — returns 400", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const req = makeReq({ r2Key: "uploads/user-123/test.mp4" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid input");
  });

  test("invalid R2 key — returns 400", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    const req = makeReq({ uploadId, r2Key: "wrong/key.mp4" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid upload key" });
  });

  test("duplicate analysis (409) — upload already processing", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "video_uploads") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({
                    data: { id: uploadId, status: "processing", content_type: "video/mp4" },
                    error: null,
                  }),
                })),
              })),
            })),
          })),
        };
      }
      return { select: jest.fn() };
    });

    const req = makeReq({ uploadId, r2Key });
    const res = await POST(req);

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/Upload already processing/);
  });

  test("duplicate analysis (409) — upload already completed", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "video_uploads") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({
                    data: { id: uploadId, status: "completed", content_type: "video/mp4" },
                    error: null,
                  }),
                })),
              })),
            })),
          })),
        };
      }
      return { select: jest.fn() };
    });

    const req = makeReq({ uploadId, r2Key });
    const res = await POST(req);

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/Upload already completed/);
  });
});
