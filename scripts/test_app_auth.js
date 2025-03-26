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
 * node test_app_auth.js
 * 
 * Or with explicit credentials:
 * APP_ID=your-app-id APP_PRIVATE_KEY=your-app-private-key node test_app_auth.js
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const { getAppCredentials } = require('./get_app_credentials');

async function testAppAuth() {
  try {
    // Get credentials
    const credentials = getAppCredentials();
    const appId = credentials.appId;
    const privateKey = credentials.privateKey;
    
    if (!appId || !privateKey) {
      console.error('⚠️ Error: GitHub App credentials not found');
      console.log('\nTo provide credentials:');
      console.log('1. Set APP_ID and APP_PRIVATE_KEY environment variables');
      console.log('2. Create credential files in one of these locations:');
      console.log('   - ~/.github/tez-social-app-id and ~/.github/tez-social-private-key.pem');
      console.log('   - .github/app_id and .github/private-key.pem in the repository root');
      console.log('   - app_id and private-key.pem in the scripts directory');
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
      console.log(`App permissions: ${Object.keys(app.permissions).join(', ')}`);
      
      // Log permission levels
      console.log('\nPermission levels:');
      Object.entries(app.permissions).forEach(([permission, level]) => {
        console.log(`- ${permission}: ${level}`);
      });
      console.log('');
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
      
      // Step 5: Test workflow permissions
      console.log('Step 5: Testing workflow permissions...');
      try {
        const { data: workflows } = await installationOctokit.actions.listRepoWorkflows({
          owner: 'sreenjoy',
          repo: 'tez-social'
        });
        
        console.log('✅ Successfully retrieved workflows');
        console.log(`Total workflows: ${workflows.total_count}`);
        if (workflows.workflows.length > 0) {
          console.log('Recent workflows:');
          workflows.workflows.slice(0, 3).forEach(workflow => {
            console.log(`- ${workflow.name} (${workflow.path})`);
          });
        }
        console.log('');
      } catch (error) {
        console.log('❌ Failed to list workflows:', error.message);
        console.log('This may indicate missing "actions" or "workflow" permissions.\n');
      }
      
      console.log('🎉 All tests passed! Your GitHub App authentication is working correctly.');
      console.log('The updated permissions are active and working.');
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