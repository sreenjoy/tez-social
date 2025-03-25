// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  // Test the login process and redirection
  test('should login and redirect to dashboard', async ({ page }) => {
    // Go to the production site
    await page.goto('https://tez-social.vercel.app/auth/login');
    
    // Fill in the login form
    await page.fill('input[name="email"]', 'testabs@testabc.com');
    await page.fill('input[name="password"]', 'testabc123');
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Check that we're on the dashboard page
    expect(page.url()).toContain('/dashboard');
    
    // Take a screenshot to verify the dashboard page
    await page.screenshot({ path: 'screenshots/dashboard.png' });
  });
  
  // Test that logged in users get redirected from login page
  test('should redirect logged in users from login to dashboard', async ({ page }) => {
    // First login to set the cookie/token
    await page.goto('https://tez-social.vercel.app/auth/login');
    await page.fill('input[name="email"]', 'testabs@testabc.com');
    await page.fill('input[name="password"]', 'testabc123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Then try to go to login page again
    await page.goto('https://tez-social.vercel.app/auth/login');
    
    // Check that we get redirected to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/redirect-to-dashboard.png' });
  });
  
  // Test profile page access
  test('should be able to access profile page', async ({ page }) => {
    // First login
    await page.goto('https://tez-social.vercel.app/auth/login');
    await page.fill('input[name="email"]', 'testabs@testabc.com');
    await page.fill('input[name="password"]', 'testabc123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to profile page using the navigation menu
    await page.click('nav >> text=Profile');
    
    // Check that we're on the profile page
    await page.waitForURL('**/profile', { timeout: 10000 });
    expect(page.url()).toContain('/profile');
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/profile-page.png' });
  });
  
  // Test logout functionality
  test('should be able to logout', async ({ page }) => {
    // First login
    await page.goto('https://tez-social.vercel.app/auth/login');
    await page.fill('input[name="email"]', 'testabs@testabc.com');
    await page.fill('input[name="password"]', 'testabc123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Handle the confirm dialog before clicking logout
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Click the logout button in the navigation menu
    await page.click('button:has-text("Logout")');
    
    // Wait for redirection to login page
    await page.waitForURL('**/auth/login', { timeout: 10000 });
    expect(page.url()).toContain('/auth/login');
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/logged-out.png' });
  });
}); 