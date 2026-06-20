import { test, expect } from '@playwright/test';

test.describe('Finance Manager E2E', () => {
  // Before each test, perform the login flow
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill in password
    await page.fill('input[type="password"]', 'kietdeptrai');

    // Click submit button
    await page.click('button[type="submit"]');

    // Wait for the URL to redirect to '/'
    await page.waitForURL('/');
  });

  test('should load dashboard and show balance information', async ({ page }) => {
    // Check if the body is visible
    await expect(page.locator('body')).toBeVisible();

    // Check if bottom navigation is present
    const bottomNav = page.locator('nav');
    await expect(bottomNav.first()).toBeVisible();

    // Check for "Tổng số dư" or similar financial overview strings
    await expect(page.locator('text=Tổng số dư').first()).toBeVisible();
  });

  test('should navigate to transactions page', async ({ page }) => {
    // Click on bottom navigation item for Transactions
    const transactionsLink = page.locator('a[href="/transactions"]');
    await expect(transactionsLink.first()).toBeVisible();
    await transactionsLink.first().click();

    // Check if the URL changed
    await expect(page).toHaveURL('/transactions');

    // Check if transactions heading "Giao dịch" is present
    await expect(page.locator('h1', { hasText: 'Giao dịch' }).first()).toBeVisible();
  });
});
