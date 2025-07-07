// tests/login.spec.js
const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => {
  // 1️⃣ Navigate and wait for network‐idle (in case of SPA routing)
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

  // 2️⃣ Fill in the form using the #id selectors
  const email = page.locator('#email');
  await expect(email).toBeVisible({ timeout: 10_000 });
  await email.fill('samy@gmail.com');

  const password = page.locator('#password');
  await expect(password).toBeVisible();
  await password.fill('SecurePassword123');

  // 3️⃣ Click the <button type="submit">Login</button>
  await page.click('button[type="submit"]');

  // 4️⃣ Verify we ended up on dashboard
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });

  // 5️⃣ Check your welcome message (adjust selector to your Dashboard)
  const welcome = page.locator('.welcome-message');
  await expect(welcome).toBeVisible();
  await expect(welcome).toContainText('Welcome, Test User');
}, { timeout: 60_000 });
