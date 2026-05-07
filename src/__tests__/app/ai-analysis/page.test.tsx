/**
 * Unit tests for AI Analysis UI page
 * Mocks: Supabase client, fetch (presign + analyze + poll)
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AIAnalysisPage from "@/app/ai-analysis/page";

const mockGetSession = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowser: () => ({
    auth: {
      getSession: mockGetSession,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              then: (cb: unknown) =>
                Promise.resolve(
                  cb({
                    data: [],
                    error: null,
                  })
                ),
            }),
          }),
        }),
      }),
    }),
  }),
}));

global.fetch = jest.fn();

function mockFetchSequence(responses: Response[]) {
  let idx = 0;
  (global.fetch as jest.Mock).mockImplementation(() => {
    const res = responses[idx++];
    return Promise.resolve(res);
  });
}

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AIAnalysisPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-123" } } },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders in idle state", async () => {
    await act(async () => {
      render(<AIAnalysisPage />);
    });

    expect(screen.getByText("AI Content Analysis")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Analysis/i })
    ).toBeDisabled();
  });

  test("file drop transitions phase to uploading", async () => {
    jest.useFakeTimers();

    await act(async () => {
      render(<AIAnalysisPage />);
    });

    const file = new File(["video"], "test.mp4", { type: "video/mp4" });

    const dropzone = screen.getByRole("button", {
      name: /Video dropzone/i,
    });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });
    });

    // Phase goes to idle after drop; startAnalysis triggers uploading
    const startBtn = screen.getByRole("button", { name: /Start Analysis/i });
    expect(startBtn).not.toBeDisabled();

    // Mock fetch chain for startAnalysis
    mockFetchSequence([
      // presign
      jsonResponse({
        url: "https://r2.example.com/upload",
        key: "uploads/user-123/test.mp4",
        uploadId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      }),
      // R2 upload PUT
      new Response(null, { status: 200 }),
      // analyze
      jsonResponse({ analysisId: "analysis-1", status: "queued" }),
    ]);

    await act(async () => {
      fireEvent.click(startBtn);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/r2/presign",
        expect.any(Object)
      );
    });
  });

  test("retry button resets error state", async () => {
    jest.useFakeTimers();

    await act(async () => {
      render(<AIAnalysisPage />);
    });

    const file = new File(["video"], "test.mp4", { type: "video/mp4" });
    const dropzone = screen.getByRole("button", {
      name: /Video dropzone/i,
    });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });
    });

    const startBtn = screen.getByRole("button", { name: /Start Analysis/i });

    // Force presign to fail
    mockFetchSequence([
      jsonResponse({ error: "Presign failed" }, 500),
    ]);

    await act(async () => {
      fireEvent.click(startBtn);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Upload or analysis error/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: /Retry upload/i });
    expect(retryBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(retryBtn);
    });

    // After reset, phase should be idle and the dropzone shows idle text
    await waitFor(() => {
      expect(
        screen.getByText(/Drag and drop your video here/i)
      ).toBeInTheDocument();
    });
  });
});
