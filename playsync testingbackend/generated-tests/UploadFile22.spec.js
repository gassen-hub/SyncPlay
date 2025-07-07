const { test, expect } = require('@playwright/test');
test.describe('UploadFile22', () => {
  test('should upload file and display success message', async ({ page }) => {
    try {
      // Step 1: Go to 'http://localhost:3001'
      await page.goto('http://localhost:3001');

      // Step 2: Upload File called 'clients.csv' in the root directory called 'test-files'
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles('test-files/clients.csv');

      // Step 3: A message should be displayed 'CSV uploaded successfully!'
      const successMessage = await page.locator('.success-message');
      await expect(successMessage).toHaveText('CSV uploaded successfully!');
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});