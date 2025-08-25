const { test, expect } = require('@playwright/test');

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard page before each test
    await page.goto('/dashboard.html');
  });

  test('should display the welcome heading', async ({ page }) => {
    // Check that the main heading is visible and contains the correct text
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Welcome Back, Sage');
  });

  test('should display the four main stats cards', async ({ page }) => {
    // Check for the presence of all four stats cards
    const listingsCard = page.locator('p:has-text("Active Listings")');
    const salesCard = page.locator('p:has-text("Sales (Month)")');
    const leadsCard = page.locator('p:has-text("New Leads")');
    const syncCard = page.locator('p:has-text("Platforms Synced")');

    await expect(listingsCard).toBeVisible();
    await expect(salesCard).toBeVisible();
    await expect(leadsCard).toBeVisible();
    await expect(syncCard).toBeVisible();
  });

  test('should display the Featured AI Tools section with three tools', async ({ page }) => {
    // Check for the main heading of the AI tools section
    const aiToolsHeading = page.locator('h2:has-text("Featured AI Tools")');
    await expect(aiToolsHeading).toBeVisible();

    // Check that there are three tool cards within the section
    const toolCards = page.locator('.glass-card-dark');
    await expect(toolCards).toHaveCount(3);

    // Verify the names of the tools
    await expect(page.locator('h4:has-text("Description Composer")')).toBeVisible();
    await expect(page.locator('h4:has-text("Pricing Analyst")')).toBeVisible();
    await expect(page.locator('h4:has-text("Photo Enhancer")')).toBeVisible();
  });

  test('should display the Rhythm Calendar', async ({ page }) => {
    // Check for the calendar heading
    const calendarHeading = page.locator('h3:has-text("Rhythm Calendar")');
    await expect(calendarHeading).toBeVisible();

    // Check that the calendar grid is rendered
    const calendarGrid = page.locator('.grid.grid-cols-7');
    await expect(calendarGrid.nth(1)).toBeVisible(); // The second grid is the days
  });

  test('should display paywall modal when trying a featured AI tool', async ({ page }) => {
    // Find the "Try Now" button for the first featured tool
    const tryNowButton = page.locator('button:has-text("Try Now")').first();
    await expect(tryNowButton).toBeVisible();

    // Click the button to trigger the paywall
    await tryNowButton.click();

    // The paywall modal should become visible
    const paywallModal = page.locator('#paywallModal');
    await expect(paywallModal).toBeVisible();

    // Verify the content of the paywall modal
    const modalHeading = paywallModal.locator('h2:has-text("Unlock Premium AI Tools")');
    await expect(modalHeading).toBeVisible();

    // Close the modal by clicking the close button
    const closeModalButton = paywallModal.locator('button:has-text("×")');
    await closeModalButton.click();

    // The paywall modal should now be hidden
    await expect(paywallModal).toBeHidden();
  });
});
