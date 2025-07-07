const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => {
    try {
        async function loginTest(page, params) {
    page.setDefaultTimeout(params.timeout || 15000);

    try {
        console.log('STEP: Navigate to login page');
        const targetUrl = 'http://localhost:5173/login'.startsWith('http')
            ? 'http://localhost:5173/login'
            : `${params.baseURL || 'http://localhost:3000'}/login`;
        await page.goto(targetUrl, { waitUntil: 'networkidle' });
        await page.waitForLoadState('networkidle');

        console.log('STEP: Fill in email field');
        const emailInput = page.locator(params.locators.email);
        await expect(emailInput).toBeVisible();
        await emailInput.fill('samy@gmail.com');

        console.log('STEP: Fill in password field');
        const passwordInput = page.locator(params.locators.password);
        await expect(passwordInput).toBeVisible();
        await passwordInput.fill('SecurePassword123');

        console.log('STEP: Click login button');
        const loginButton = page.locator(params.locators.loginButton);
        await expect(loginButton).toBeVisible();
        await loginButton.click();

        console.log('STEP: Verify redirect to dashboard');
        await expect(page).toHaveURL(new RegExp('/dashboard'));

        console.log('STEP: Verify welcome message');
        const welcomeMessage = page.locator(params.locators.welcomeMessage);
        await expect(welcomeMessage).toBeVisible();
        await expect(welcomeMessage).toContainText('Welcome, Test User');

    } catch (error) {
        console.error('Test failed:', error.message);
        throw error;
    }
}
    } catch (error) {
        console.error('Test failed:', error.message);
        throw error;
    }
});