const { test, expect } = require('@playwright/test');

test.describe('lo', () => {
    test('lo', async ({ page }) => {
        // Set default timeout
        page.setDefaultTimeout(15000);
        
        // Default parameters for the test
        const params = {
            timeout: 15000,
            baseURL: 'http://localhost:5173',
            locators: {}
        };
        
        try {
            // tests/login.spec.js

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // adjust URL to wherever your app is running
    await page.goto('http://localhost:5173/login');
  });

  test('successful login navigates to /dashboard', async ({ page }) => {
    // fill in the correct credentials
    await page.locator('input#email').fill('samy@gmail.com');
    await page.locator('input#password').fill('SecurePassword123');
    // submit the form
    await page.locator('button[type="submit"]').click();

    // expect to be on the dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('invalid login shows error message', async ({ page }) => {
    // fill in wrong credentials
    await page.locator('input#email').fill('wrong@example.com');
    await page.locator('input#password').fill('badpass');
    // submit the form
    await page.locator('button[type="submit"]').click();

    // expect the error text to be visible
    const error = page.locator('.error-message');
    await expect(error).toBeVisible();
    await expect(error).toHaveText('Invalid email or password');
    
    // still on the login page
    await expect(page).toHaveURL(/\/login$/);
  });
});

        } catch (error) {
            console.error('Test failed:', error.message);
            throw error;
        }
    });
});