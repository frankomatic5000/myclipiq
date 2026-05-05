/**
 * Unit tests for GET /api/ai/jobs/:id
 * Mocks: Supabase auth + DB
 */

import { GET } from "@/app/api/ai/jobs/[id]/route";
import { NextRequest } from "next/server";

let mockSingle = jest.fn();
let mockEq = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
let mockSelect = jest.fn(() => ({ eq: mockEq }));
let mockFrom = jest.fn(() => ({ select: mockSelect }));
let mockGetSession = jest.fn();

function resetMocks() {
  mockSingle = jest.fn();
  mockEq = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
  mockSelect = jest.fn(() => ({ eq: mockEq }));
  mockFrom = jest.fn(() => ({ select: mockSelect }));
  mockGetSession = jest.fn();
}

const createMockSupabaseClient = () => ({
  auth: { getSession: mockGetSession },
  from: mockFrom,
});

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createMiddlewareClient: jest.fn(() => createMockSupabaseClient()),
}));

describe("GET /api/ai/jobs/:id", () => {
  const userId = "user-123";
  const jobId = "job-abc";

  beforeEach(() => {
    resetMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  });

  function makeReq(): NextRequest {
    return {} as NextRequest;
  }

  test("success — returns job details", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "analysis_jobs") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: jobId,
                    upload_id: "upload-1",
                    analysis_id: "analysis-1",
                    status: "completed",
                    progress_pct: 100,
                    error_message: null,
                    started_at: "2025-01-01T00:00:00Z",
                    completed_at: "2025-01-01T00:01:00Z",
                    created_at: "2025-01-01T00:00:00Z",
                  },
                  error: null,
                }),
              })),
            })),
          })),
        };
      }
      return { select: jest.fn() };
    });

    const req = makeReq();
    const res = await GET(req, { params: Promise.resolve({ id: jobId }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      id: jobId,
      uploadId: "upload-1",
      analysisId: "analysis-1",
      status: "completed",
      progressPct: 100,
      errorMessage: null,
    });
  });

  test("unauthorized — returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const req = makeReq();
    const res = await GET(req, { params: Promise.resolve({ id: jobId }) });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  test("job not found — returns 404", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: userId } } },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "analysis_jobs") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: null, error: { message: "No rows" } }),
              })),
            })),
          })),
        };
      }
      return { select: jest.fn() };
    });

    const req = makeReq();
    const res = await GET(req, { params: Promise.resolve({ id: "missing-job" }) });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
  });
});
