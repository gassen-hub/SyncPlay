const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => {
    try {
        async function test(page, params) {
    page.setDefaultTimeout(params.timeout || 15000);

    try {
        console.log('STEP: Navigate to login URL');
        await page.goto(params.url, { waitUntil: 'networkidle' });
        await page.waitForLoadState('networkidle');

        console.log('STEP: Fill in email field');
        const emailInput = page.locator(params.locators.email);
        await expect(emailInput).toBeVisible();
        await emailInput.fill(params.fields.email);

        console.log('STEP: Fill in password field');
        const passwordInput = page.locator(params.locators.password);
        await expect(passwordInput).toBeVisible();
        await passwordInput.fill(params.fields.password);

        console.log('STEP: Click login button');
        await page.locator(params.locators.loginButton).click();

        console.log('STEP: Verify URL change to dashboard');
        await expect(page).toHaveURL(new RegExp('/dashboard'));

        console.log('STEP: Expect welcome message');
        const welcome = page.locator(params.locators.welcomeMessage);
        await expect(welcome).toBeVisible();
        await expect(welcome).toContainText(params.expectations.text);
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