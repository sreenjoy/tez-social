// @ts-check
const { test, expect, devices } = require('@playwright/test');

// Configure test to use iPhone 12
test.use({ ...devices['iPhone 12'] });

test.describe('Responsive Design Tests', () => {
  test('should login and use mobile navigation on iPhone', async ({ page }) => {
    // Go to the login page
    await page.goto('https://tez-social.vercel.app/auth/login');
    
    // Take screenshot of login page on mobile
    await page.screenshot({ path: 'screenshots/mobile-login.png' });
    
    // Fill in the login form
    await page.fill('input[name="email"]', 'testabs@testabc.com');
    await page.fill('input[name="password"]', 'testabc123');
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Take screenshot of dashboard on mobile
    await page.screenshot({ path: 'screenshots/mobile-dashboard.png' });
    
    // Open the mobile menu by clicking the hamburger button
    await page.click('button[aria-label="Open sidebar"], button:has-text("Open sidebar")');
    
    // Take screenshot of open mobile menu
    await page.screenshot({ path: 'screenshots/mobile-menu-open.png' });
    
    // Navigate to profile page through mobile menu
    await page.click('text=Profile');
    
    // Wait for navigation to profile page
    await page.waitForURL('**/profile', { timeout: 10000 });
    
    // Take screenshot of profile page on mobile
    await page.screenshot({ path: 'screenshots/mobile-profile.png' });
  });
}); 