const { test, expect } = require('@playwright/test');

test.describe('Login Test', () => {
    test('Login Test', async ({ page }) => {
        // Set default timeout
        page.setDefaultTimeout(15000);
        
        // Default parameters for the test
        const params = {
            timeout: 15000,
            baseURL: 'http://localhost:5173',
            locators: {}
        };
        
        try {
            const { test, expect } = require('@playwright/test');

test.describe('Test Description', () => {
    test('Test Name', async ({ page }) => {
        page.setDefaultTimeout(15000);

        try {
            await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

            const email = page.locator('#email');
            await expect(email).toBeVisible({ timeout: 10_000 });
            await email.fill('samy@gmail.com');

            const password = page.locator('#password');
            await expect(password).toBeVisible({ timeout: 10_000 });
            await password.fill('SecurePassword123');

            const loginBtn = page.locator('button:has-text("Login")');
            await expect(loginBtn).toBeVisible({ timeout: 10_000 });
            await loginBtn.click();

            await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });

            const welcomeMsg = page.locator('text=Welcome, Test User');
            await expect(welcomeMsg).toBeVisible({ timeout: 10_000 });

        } catch (error) {
            console.error('Test failed:', error.message);
            throw error;
        }
    });
});
        } catch (error) {
            console.error('Test failed:', error.message);
            throw error;
        }
    });
});