import { test, expect } from "@playwright/test";

const TEST_VIDEO = {
  filename: "test-video.mp4",
  contentType: "video/mp4",
};

test.describe("Upload API", () => {
  test("presign endpoint requires auth", async ({ page, request }) => {
    const response = await request.post("/api/r2/presign", {
      data: {
        filename: TEST_VIDEO.filename,
        contentType: TEST_VIDEO.contentType,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("presign validates content type", async ({ page, request }) => {
    const response = await request.post("/api/r2/presign", {
      data: {
        filename: "bad.exe",
        contentType: "application/x-msdownload",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid input");
  });

  test("complete endpoint requires auth", async ({ request }) => {
    const response = await request.post("/api/upload/complete", {
      data: {
        uploadId: "00000000-0000-0000-0000-000000000000",
      },
    });

    expect(response.status()).toBe(401);
  });

  test("complete validates uploadId format", async ({ request }) => {
    const response = await request.post("/api/upload/complete", {
      data: {
        uploadId: "invalid-uuid",
      },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe("Upload UI Smoke", () => {
  test("upload page has form elements", async ({ page }) => {
    await page.goto("/");
    // Check for upload-related elements on dashboard
    const newProjectBtn = page.locator("text=/New Project|Novo Projeto|Nuevo Proyecto/i").first();
    await expect(newProjectBtn).toBeVisible();
  });
});
