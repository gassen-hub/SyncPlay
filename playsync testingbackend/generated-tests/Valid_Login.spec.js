const { test, expect } = require('@playwright/test');

test.describe('Valid_Login', () => {
  // Always start from the login page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/login');
  });

  // Step 1: Verify Login page title
  test('should show the login title', async ({ page }) => {
    // your component renders <h2>Login</h2>
    const title = page.locator('h2');
    await expect(title).toHaveText('Login');
  });

  // Steps 2–3: Enter valid creds and submit, then verify redirect
  test('should log in with correct credentials', async ({ page }) => {
    await page.fill('input#email', 'samy@gmail.com');
    await page.fill('input#password', 'SecurePassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for the URL to change to /dashboard
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  // Step 4: Verify dashboard content after login
  test('should display dashboard welcome message', async ({ page }) => {
    // perform the login steps
    await page.fill('input#email', 'samy@gmail.com');
    await page.fill('input#password', 'SecurePassword123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // now check for some dashboard text—adjust selector as needed
    const welcome = page.locator('text=Welcome');
    await expect(welcome).toBeVisible();
  });
});
