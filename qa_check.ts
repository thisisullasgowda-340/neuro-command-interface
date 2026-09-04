import { chromium } from 'playwright';

async function runQA() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors: any[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('--- Navigating to Home ---');
  try {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    console.log('Title:', await page.title());
    
    const placeholder = await page.$('img[data-lovable-blank-page-placeholder]');
    console.log('Placeholder visible:', !!placeholder);

    console.log('--- Testing Responsiveness ---');
    await page.setViewportSize({ width: 375, height: 667 });
    console.log('Mobile view set');
    await page.waitForTimeout(500);
    
    await page.setViewportSize({ width: 1440, height: 900 });
    console.log('Desktop view set');
    await page.waitForTimeout(500);

    console.log('--- Testing 404 ---');
    await page.goto('http://localhost:8080/non-existent-page', { waitUntil: 'networkidle' });
    const h1 = await page.$eval('h1', el => el.textContent);
    console.log('404 Page H1:', h1);

    if (errors.length > 0) {
      console.log('Console Errors:', errors);
    } else {
      console.log('No console errors found.');
    }
  } catch (e) {
    console.error('Navigation failed:', e.message);
  } finally {
    await browser.close();
  }
}

runQA();
