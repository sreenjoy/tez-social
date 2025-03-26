/**
 * Test GitHub App Authentication
 * 
 * This script tests your GitHub App authentication by:
 * 1. Creating an app authentication token
 * 2. Trying to get app information
 * 3. Generating an installation access token
 * 4. Listing repository information
 * 
 * Run this script with:
 * APP_ID=your-app-id APP_PRIVATE_KEY=your-app-private-key node test_app_auth.js
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');

async function testAppAuth() {
  try {
    // Get environment variables
    const appId = process.env.APP_ID;
    const privateKey = process.env.APP_PRIVATE_KEY;
    
    if (!appId || !privateKey) {
      console.error('⚠️ Error: APP_ID and APP_PRIVATE_KEY environment variables are required');
      console.log('Usage: APP_ID=your-app-id APP_PRIVATE_KEY=your-app-private-key node test_app_auth.js');
      process.exit(1);
    }
    
    console.log('🔑 Testing GitHub App authentication...\n');
    
    // Create app authentication
    const auth = createAppAuth({
      appId,
      privateKey,
    });
    
    // Step 1: Authenticate as the app
    console.log('Step 1: Creating app authentication token...');
    const appAuthentication = await auth({ type: 'app' });
    console.log('✅ Successfully created app authentication token');
    console.log(`Token type: ${appAuthentication.type}`);
    console.log(`Token expires in: ${Math.floor((appAuthentication.expiresAt - new Date()) / 1000)} seconds\n`);
    
    // Create Octokit instance with app token
    const appOctokit = new Octokit({
      auth: appAuthentication.token
    });
    
    // Step 2: Get app information
    console.log('Step 2: Getting app information...');
    try {
      const { data: app } = await appOctokit.apps.getAuthenticated();
      console.log('✅ Successfully retrieved app information');
      console.log(`App name: ${app.name}`);
      console.log(`App ID: ${app.id}`);
      console.log(`App permissions: ${Object.keys(app.permissions).join(', ')}\n`);
    } catch (error) {
      console.error('❌ Failed to get app information:', error.message);
      process.exit(1);
    }
    
    // Step 3: Get an installation access token
    console.log('Step 3: Creating installation access token...');
    try {
      const installationAuthentication = await auth({ type: 'installation' });
      console.log('✅ Successfully created installation access token');
      console.log(`Token type: ${installationAuthentication.type}`);
      console.log(`Token expires in: ${Math.floor((installationAuthentication.expiresAt - new Date()) / 1000)} seconds\n`);
      
      // Create Octokit instance with installation token
      const installationOctokit = new Octokit({
        auth: installationAuthentication.token
      });
      
      // Step 4: List repository information
      console.log('Step 4: Getting repository information...');
      const { data: repo } = await installationOctokit.repos.get({
        owner: 'sreenjoy',
        repo: 'tez-social'
      });
      
      console.log('✅ Successfully retrieved repository information');
      console.log(`Repository: ${repo.full_name}`);
      console.log(`Description: ${repo.description || 'No description'}`);
      console.log(`Default branch: ${repo.default_branch}\n`);
      
      console.log('🎉 All tests passed! Your GitHub App authentication is working correctly.');
      console.log('You can now update your app permissions following the guide at .github/GITHUB_APP_UPDATE_GUIDE.md');
    } catch (error) {
      console.error('❌ Failed to authenticate as installation:', error.message);
      console.log('\nThis may be because:');
      console.log('1. Your app is not installed on the repository');
      console.log('2. Your app does not have the correct permissions');
      console.log('3. There is an issue with the private key');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing authentication:', error.message);
    process.exit(1);
  }
}

testAppAuth(); 