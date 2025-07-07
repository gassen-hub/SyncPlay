import { test, expect } from '@playwright/test';

test('should upload CSV file and verify data table', async ({ page }) => {
  // Go to 'http://localhost:3001'
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');

  // Upload file 'clients.csv' from project root test-files directory
  const filePath = path.resolve(__dirname, '../test-files/clients.csv');
  await page.setInputFiles('input[type="file"]', filePath);

  // Verify the data table is displayed using selector 'table'
  await expect(page.locator('table')).toBeVisible();

  // Verify at least one data row is visible using selector 'table tbody tr'
  await expect(page.locator('table tbody tr')).toHaveCount(1);
});
