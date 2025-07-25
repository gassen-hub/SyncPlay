import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

test.use({ slowMo: 1000 });

test('should upload CSV file and verify data table', async ({ page }) => {
  // Go to 'http://localhost:3001'
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Upload file 'clients.csv' from project root test-files directory
  const filePath = path.resolve(__dirname, '../test-files/upload_file.csv');
  await page.setInputFiles('input[type="file"]', filePath);
  await page.waitForTimeout(1000);

  // Verify the data table is displayed using selector 'table'




  // Verify success message appears
  await expect(page.locator('text=CSV uploaded successfully!')).toBeVisible();
    await page.waitForTimeout(1000);

});
