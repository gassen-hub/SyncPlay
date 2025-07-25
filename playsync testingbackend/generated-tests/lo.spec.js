// tests/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // adjust URL to wherever your app is running
    await page.goto('http://localhost:5174/login');
  });

  test('successful login navigates to /dashboard', async ({ page }) => {
    // fill in the correct credentials
    await page.locator('input#email').fill('samy@gmail.com');
        await page.waitForTimeout(1000);

    await page.locator('input#password').fill('SecurePassword123');
        await page.waitForTimeout(1000);

    // submit the form
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // expect to be on the dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.waitForTimeout(1000);
  });

  test('invalid login shows error message', async ({ page }) => {
    // fill in wrong credentials
    await page.locator('input#email').fill('wrong@example.com');
        await page.waitForTimeout(1000);

    await page.locator('input#password').fill('badpass');
        await page.waitForTimeout(1000);

    // submit the form
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    // expect the error text to be visible
    const error = page.locator('.error-message');
    await expect(error).toBeVisible();
    await expect(error).toHaveText('Invalid email or password');
    await page.waitForTimeout(1000);
    
    // still on the login page
    await expect(page).toHaveURL(/\/login$/);
  });
});
