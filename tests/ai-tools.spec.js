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
    await expect(heading).toHaveText('AI-Powered Content Tools');
  });

  test('should have a visible form for the Ad Copy Generator', async ({ page }) => {
    // Check for the presence of the ad copy generator form
    const adCopyForm = page.locator('form[onsubmit*="ad-copy-generator"]');
    await expect(adCopyForm).toBeVisible();

    // Check for a key input field within the form
    const vehicleDetailsInput = adCopyForm.locator('textarea[placeholder*="e.g., 2023 Honda Civic Sport"]');
    await expect(vehicleDetailsInput).toBeVisible();
  });

  test('should show a simulated AI response on form submission', async ({ page }) => {
    const adCopyForm = page.locator('form[onsubmit*="ad-copy-generator"]');
    const submitButton = adCopyForm.locator('button[type="submit"]');
    const resultDiv = adCopyForm.locator('.sim-result');

    // Fill out the form and submit
    await adCopyForm.locator('textarea').fill('2024 Toyota Camry TRD');
    await submitButton.click();

    // Check for the 'thinking' message
    await expect(resultDiv).toHaveText(/AI is thinking.../);

    // Wait for the final response and verify it's not empty
    await expect(resultDiv, 'AI should provide a response within the timeout').not.toHaveText(/AI is thinking.../, { timeout: 5000 });
    const responseText = await resultDiv.textContent();
    expect(responseText.length).toBeGreaterThan(10);
  });
});
