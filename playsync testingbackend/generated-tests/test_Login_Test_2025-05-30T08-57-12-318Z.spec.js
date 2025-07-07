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
            // Navigate to login page
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

// Fill email field
await page.getByRole('textbox', {name: /email/i}).fill('samy@gmail.com');

// Fill password field
await page.getByLabel('Password').fill('SecurePassword123');

// Click login button
await page.getByRole('button', {name: /login/i}).click();

// Expect redirect to dashboard
await expect(page).toHaveURL('/dashboard');

// Expect welcome message
const welcomeMessage = await page.getByText(/Welcome, Test User/);
if (!welcomeMessage) {
  throw new Error("Expected 'Welcome' message not found");
}
await expect(welcomeMessage).toBeVisible();
        } catch (error) {
            console.error('Test failed:', error.message);
            throw error;
        }
    });
});