# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Finance Manager E2E >> should navigate to transactions page
- Location: e2e/dashboard.spec.ts:19:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="/transactions"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href="/transactions"]')

```

```yaml
- img
- heading "Đăng nhập" [level=1]
- paragraph: Nhập mật khẩu cá nhân để truy cập ứng dụng quản lý tài chính.
- textbox "Nhập mật khẩu..."
- button "MỞ KHÓA" [disabled]
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Finance Manager E2E', () => {
  4  |   test('should load dashboard and show balance information', async ({ page }) => {
  5  |     // Go to home page
  6  |     await page.goto('/');
  7  | 
  8  |     // Check if the body or root element is visible
  9  |     await expect(page.locator('body')).toBeVisible();
  10 | 
  11 |     // Check if bottom navigation is present
  12 |     const bottomNav = page.locator('nav');
  13 |     await expect(bottomNav).toBeVisible();
  14 | 
  15 |     // Check for "Tổng số dư" or similar financial overview strings
  16 |     await expect(page.locator('text=Tổng số dư').first()).toBeVisible();
  17 |   });
  18 | 
  19 |   test('should navigate to transactions page', async ({ page }) => {
  20 |     await page.goto('/');
  21 | 
  22 |     // Click on bottom navigation item for Transactions
  23 |     const transactionsLink = page.locator('a[href="/transactions"]');
> 24 |     await expect(transactionsLink).toBeVisible();
     |                                    ^ Error: expect(locator).toBeVisible() failed
  25 |     await transactionsLink.click();
  26 | 
  27 |     // Check if the URL changed
  28 |     await expect(page).toHaveURL('/transactions');
  29 | 
  30 |     // Check if transactions heading "Giao dịch" is present
  31 |     await expect(page.locator('h1', { hasText: 'Giao dịch' }).first()).toBeVisible();
  32 |   });
  33 | });
  34 | 
```