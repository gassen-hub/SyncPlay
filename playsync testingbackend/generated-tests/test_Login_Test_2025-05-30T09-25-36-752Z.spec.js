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
            const page = await context.newPage();
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
const emailField = page.getByRole('textbox',{name:/Email/i});
await expect(emailField).toBeVisible({ timeout:10000 });
await emailField.fill('samy@gmail.com');
const passwordField = page.getByLabel(/Password/);
await expect(passwordField).toBeVisible({ timeout:10000 });
await passwordField.fill('SecurePassword123');
const loginBtn = page.getByRole('button',{name:/Login/i});
await expect(loginBtn).toBeVisible({ timeout:10000 });
await loginBtn.click();
await expect(page).toHaveURL(new RegExp('^http://localhost:5173/dashboard$'), { timeout:10000 });
const welcomeMsg = page.getByText('Welcome, Test User');
await expect(welcomeMsg).toBeVisible({ timeout:10000 });
        } catch (error) {
            console.error('Test failed:', error.message);
            throw error;
        }
    });
});