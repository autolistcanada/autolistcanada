const { test, expect } = require('@playwright/test');

test.describe('AI Tools Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI tools page before each test
    await page.goto('/ai-tools.html');
  });

  test('should display the main heading', async ({ page }) => {
    // Check that the main heading is visible and has the correct text
    const heading = page.locator('h1.text-4xl');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('AutoList Canada – AI Tools');
  });

  test('should have a visible form for the Ad Copy Generator', async ({ page }) => {
    // Check for the presence of the ad copy generator form
    const adCopyForm = page.locator('form[onsubmit*="generateAIResult(this,1)"]');
    await expect(adCopyForm).toBeVisible();

    // Check for a key input field within the form
    const detailsInput = adCopyForm.locator('textarea[placeholder*="Enter product details..."]');
    await expect(detailsInput).toBeVisible();
  });

  test('should display paywall modal for non-premium user on tool use', async ({ page }) => {
    // Find the first tool form and its submit button
    const firstToolForm = page.locator('form[onsubmit*="generateAIResult"]');
    const generateButton = firstToolForm.first().locator('button');
    const toolTextarea = firstToolForm.first().locator('textarea');

    // Fill the textarea and click the button to trigger the paywall
    await toolTextarea.fill('Test input to trigger AI tool');
    await generateButton.click();

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
