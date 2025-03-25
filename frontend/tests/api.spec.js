// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('API Communication', () => {
  let authToken;
  
  test('should login through API and get valid token', async ({ page }) => {
    // Go to the login page
    await page.goto('https://tez-social.vercel.app/auth/login');
    
    // Fill in the login form
    await page.fill('input[name="email"]', 'testabs@testabc.com');
    await page.fill('input[name="password"]', 'testabc123');
    
    // Intercept network requests to capture the API response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/auth/login') && response.status() === 200
    );
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Wait for the API response
    const response = await responsePromise;
    
    // Verify we got a valid response
    const responseBody = await response.json();
    expect(responseBody.data.access_token).toBeDefined();
    expect(responseBody.data.user).toBeDefined();
    
    // Save the token for later tests
    authToken = responseBody.data.access_token;
    console.log('Captured auth token:', authToken.substring(0, 20) + '...');
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard');
  });
  
  test('should fetch authenticated user data from API', async ({ page }) => {
    // Use the captured token
    await page.goto('https://tez-social.vercel.app/dashboard');
    
    // Set the auth token in localStorage
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
    }, authToken);
    
    // Reload to use the new token
    await page.reload();
    
    // Intercept network requests to capture the /auth/me API response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/auth/me')
    );
    
    // Wait for the API response
    const response = await responsePromise;
    
    // Verify we got a valid response
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.email).toBe('testabs@testabc.com');
    expect(responseBody.role).toBe('user');
  });
}); 