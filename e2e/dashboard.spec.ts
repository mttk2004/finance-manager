import { test, expect } from '@playwright/test';

test.describe('Finance Manager E2E', () => {
  test('should load dashboard and show balance information', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Check if the body or root element is visible
    await expect(page.locator('body')).toBeVisible();

    // Check if bottom navigation is present
    const bottomNav = page.locator('nav');
    await expect(bottomNav).toBeVisible();

    // Check for "Tổng số dư" or similar financial overview strings
    await expect(page.locator('text=Tổng số dư').first()).toBeVisible();
  });

  test('should navigate to transactions page', async ({ page }) => {
    await page.goto('/');

    // Click on bottom navigation item for Transactions
    const transactionsLink = page.locator('a[href="/transactions"]');
    await expect(transactionsLink).toBeVisible();
    await transactionsLink.click();

    // Check if the URL changed
    await expect(page).toHaveURL('/transactions');

    // Check if transactions heading "Giao dịch" is present
    await expect(page.locator('h1', { hasText: 'Giao dịch' }).first()).toBeVisible();
  });
});
