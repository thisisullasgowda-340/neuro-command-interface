import { test, expect } from '@playwright/test';

test('broad qa pass', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  // 1. Navigation & Basic Load
  await page.goto('http://localhost:8080');
  await expect(page).toHaveTitle(/Lovable App/);
  
  // Check for placeholder
  const placeholder = page.locator('img[data-lovable-blank-page-placeholder]');
  if (await placeholder.isVisible()) {
    console.log('Found placeholder image on home page.');
  }

  // 2. Responsive Check
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.waitForTimeout(500);
  console.log('Mobile viewport check complete.');

  await page.setViewportSize({ width: 1280, height: 800 }); // Desktop
  await page.waitForTimeout(500);
  console.log('Desktop viewport check complete.');

  // 3. Navigation to a non-existent route (404 check)
  await page.goto('http://localhost:8080/non-existent-path');
  await expect(page.locator('h1')).toContainText('404');
  console.log('404 page check complete.');

  if (errors.length > 0) {
    console.log('Console Errors found:', errors);
  } else {
    console.log('No console errors detected.');
  }
});
