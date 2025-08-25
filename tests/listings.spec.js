const { test, expect } = require('@playwright/test');

test.describe('Listings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the listings page before each test
    await page.goto('/listings.html');
  });

  test('should display the main heading', async ({ page }) => {
    // Check that the main heading is visible and has the correct text
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('My Listings');
  });

  test('should display filter and action controls', async ({ page }) => {
    // Check for the search input
    await expect(page.locator('#search-input')).toBeVisible();
    // Check for the status filter
    await expect(page.locator('#status-filter')).toBeVisible();
    // Check for the import button
    await expect(page.locator('#import-button')).toBeVisible();
  });

  test('should load and display listings in the table', async ({ page }) => {
    // The listings are loaded dynamically, so we need to wait for the table rows to be populated.
    const tableBody = page.locator('#listings-table-body');
    
    // Wait for at least one row to appear in the table.
    // The `tr` element is the row in the table.
    await expect(tableBody.locator('tr')).toHaveCountGreaterThan(0, { timeout: 10000 });

    // Check for specific content in the first row to ensure data is loaded correctly
    const firstRow = tableBody.locator('tr').first();
    await expect(firstRow.locator('td').nth(2)).not.toBeEmpty(); // Title column
    await expect(firstRow.locator('td').nth(3)).not.toBeEmpty(); // Price column
  });

  test('should show the bulk actions toolbar when a checkbox is clicked', async ({ page }) => {
    // Wait for the listings to load
    await expect(page.locator('#listings-table-body tr')).toHaveCountGreaterThan(0, { timeout: 10000 });

    // Click the first checkbox in the table body
    const firstCheckbox = page.locator('#listings-table-body tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();

    // Check that the bulk actions toolbar is now visible
    const toolbar = page.locator('#bulk-actions-toolbar');
    await expect(toolbar).toBeVisible();

    // Check that the selection count is updated
    await expect(toolbar.locator('#selection-count')).toHaveText('1 items selected');
  });
});
