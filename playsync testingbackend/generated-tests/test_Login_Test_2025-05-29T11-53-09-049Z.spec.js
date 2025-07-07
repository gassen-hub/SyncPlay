const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => {
    try {
        async function test(page, params) {
    page.setDefaultTimeout(params.timeout || 15000);

    try {
        console.log('STEP: Navigate to login page');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
        await page.waitForLoadState('networkidle');

        console.log('STEP: Fill in email field');
        const emailInput = page.locator('#email-input');
        await expect(emailInput).toBeVisible();
        await emailInput.fill(params.fields.email);

        console.log('STEP: Fill in password field');
        const passwordInput = page.locator('#password-input');
        await expect(passwordInput).toBeVisible();
        await passwordInput.fill(params.fields.password);

        console.log('STEP: Click login button');
        await page.locator('#login-button').click();

        console.log('STEP: Verify URL change to dashboard');
        await expect(page).toHaveURL(new RegExp('/dashboard'));

        console.log('STEP: Expect welcome message on dashboard');
        const welcomeMessage = page.locator('.welcome-message');
        await expect(welcomeMessage).toBeVisible();
        await expect(welcomeMessage).toContainText(params.expectations.welcomeText);
    } catch (e) {
        console.error('Test failed:', e);
        throw e;
    }
}
    } catch (error) {
        console.error('Test failed:', error.message);
        throw error;
    }
});