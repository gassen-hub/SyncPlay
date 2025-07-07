const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => {
    try {
        async function test(page) {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit"]');
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
}
    } catch (error) {
        console.error('Test failed:', error.message);
        throw error;
    }
});