const { test, expect } = require('@playwright/test');

test.describe('Invalid Login', () => {
  // Precondition: Navigate to login page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/login');
  });

  test('should display error message for bad email/password', async ({ page }) => {
    // Use the actual IDs from your inputs
    const emailInput    = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const loginButton   = page.getByRole('button', { name: 'Login' });

    // wait for inputs to be visible
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await page.waitForTimeout(1000);

    // Step 2: enter invalid credentials
    await emailInput.fill('wrong@example.com');
        await page.waitForTimeout(1000);

    await passwordInput.fill('badpassword');
    await page.waitForTimeout(1000);

    // Step 3: click the Login button
    await loginButton.click();

    // Step 4: verify error message appears
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid email or password');
        await page.waitForTimeout(1000);

  });
});
