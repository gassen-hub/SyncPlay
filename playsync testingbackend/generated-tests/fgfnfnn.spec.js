const { test, expect } = require('@playwright/test');
test.describe('fgfnfnn', () => {
    // Precondition: URL under test
    const url = 'http://localhost:3001';

    // Test Steps
    test('should upload file and verify table display', async ({ page }) => {
        await page.goto(url);

        // Step 2: Upload file from project root test-files directory
        const filePath = './test-files/clients.csv';
        await page.setInputFiles('#file-input', { force: true }, filePath);
        
        // Wait for upload to complete (e.g., AJAX call)

        // Step 3: Verify data table is displayed
        const dataTable = page.locator('table');
        expect(dataTable).toBeVisible();

        // Step 4: Verify at least one data row is visible
        const dataRows = dataTable.locator('tbody tr');
        await expect(dataRows).toHaveCount(1);
    });
});


