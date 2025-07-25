const { test, expect } = require('@playwright/test');
test.describe('Valid_login', () => {
    const url = 'http://localhost:3001';
    const loginUrl = 'http://localhost:5174/login';

    // Test Steps:
    // 1. Navigate to http://localhost:5174/login
    test('should navigate to login page', async ({ page }) => {
        await page.goto(loginUrl);
        expect(page.url()).toBe(loginUrl); // Verify URL after navigation
    });

    // 2. Enter Email=samy@gmail.com and Password=SecurePassword123
    test('should enter valid credentials', async ({ page }) => {
        const emailInput = page.locator('#email');
        await emailInput.fill('samy@gmail.com');

        const passwordInput = page.locator('#password');
        await passwordInput.fill('SecurePassword123');

        // 3. Click Login and verify you’re redirected to /dashboard
        const loginButton = page.getByRole('button', { name: 'Login' });
        await loginButton.click();

        expect(page.url()).toBe(`${url}/dashboard`); // Verify redirection
    });

});