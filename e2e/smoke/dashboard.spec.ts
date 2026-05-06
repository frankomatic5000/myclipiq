import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('dashboard loads', async ({ page }) => {
    // Verify the page title or heading
    await expect(page.locator('h1, [class*="gradient-text"]')).toBeVisible();
  });

  test('sidebar navigation renders', async ({ page }) => {
    // Check for key navigation items
    const navItems = ['Dashboard', 'Projects', 'Customers', 'Settings'];
    for (const item of navItems) {
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
  });

  test('language switcher exists', async ({ page }) => {
    // Look for the language switcher button or dropdown
    const switcher = page.locator('[class*="LanguageSwitcher"], button:has-text("EN"), button:has-text("PT"), button:has-text("ES")').first();
    await expect(switcher).toBeVisible();
  });

  test('status labels render in English', async ({ page }) => {
    // Check for status badges/labels
    const statuses = ['Intake', 'Editing', 'Analysis', 'Review', 'Approved', 'Posted', 'Archived'];
    // At least some of these should be visible on the dashboard
    const visibleStatuses = await page.locator('text=/Intake|Editing|Analysis|Review|Approved|Posted|Archived/i').count();
    expect(visibleStatuses).toBeGreaterThan(0);
  });
});
