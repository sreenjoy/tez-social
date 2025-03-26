/**
 * Helper script to get GitHub App credentials from local files
 * This avoids putting sensitive credentials in command line arguments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths where credential files might be stored
const APP_ID_PATHS = [
  path.join(process.env.HOME || process.env.USERPROFILE, '.github', 'tez-social-app-id'),
  path.join(__dirname, '..', '.github', 'app_id'),
  path.join(__dirname, 'app_id')
];

const PRIVATE_KEY_PATHS = [
  path.join(process.env.HOME || process.env.USERPROFILE, '.github', 'tez-social-private-key.pem'),
  path.join(__dirname, '..', '.github', 'private-key.pem'),
  path.join(__dirname, 'private-key.pem')
];

// Try to get credentials from environment variables first
function getCredentials() {
  const credentials = {
    appId: process.env.APP_ID,
    privateKey: process.env.APP_PRIVATE_KEY
  };

  // If credentials already set in environment variables, return them
  if (credentials.appId && credentials.privateKey) {
    return credentials;
  }

  console.log('GitHub App credentials not found in environment variables, checking files...');

  // Try to get App ID from local files
  for (const path of APP_ID_PATHS) {
    try {
      if (fs.existsSync(path)) {
        credentials.appId = fs.readFileSync(path, 'utf8').trim();
        console.log(`Found App ID in ${path}`);
        break;
      }
    } catch (error) {
      // Ignore errors and try next path
    }
  }

  // Try to get Private Key from local files
  for (const path of PRIVATE_KEY_PATHS) {
    try {
      if (fs.existsSync(path)) {
        credentials.privateKey = fs.readFileSync(path, 'utf8').trim();
        console.log(`Found Private Key in ${path}`);
        break;
      }
    } catch (error) {
      // Ignore errors and try next path
    }
  }

  // If we still don't have credentials, try to get them from GitHub repository secrets
  if (!credentials.appId || !credentials.privateKey) {
    try {
      console.log('Trying to get credentials from GitHub repository secrets...');
      
      // This only works in GitHub Actions, so will fail locally
      if (process.env.GITHUB_TOKEN) {
        const repoToken = process.env.GITHUB_TOKEN;
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        
        // Make API request to get secrets (this won't actually work as you can't view secret values)
        // This is just a placeholder to show the concept
        console.log(`Would try to get secrets for ${owner}/${repo} using GitHub API`);
      }
    } catch (error) {
      // Ignore errors from GitHub API
    }
  }

  return credentials;
}

// Interactive prompt to enter credentials if not found
function promptForCredentials(credentials) {
  if (!credentials.appId || !credentials.privateKey) {
    console.log('\n⚠️ Missing GitHub App credentials. Please provide them below:');
    
    if (!credentials.appId) {
      try {
        // Prompt for App ID
        process.stdout.write('Enter your GitHub App ID: ');
        const appId = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        // Set synchronously to block execution
        credentials.appId = execSync('read value; echo $value', { stdio: 'inherit' }).toString().trim();
      } catch (error) {
        console.log('\nInteractive input not available. Please provide APP_ID environment variable.');
      }
    }
    
    if (!credentials.privateKey) {
      try {
        // Prompt for private key file path
        process.stdout.write('Enter the path to your private key file (.pem): ');
        // Set synchronously to block execution
        const keyPath = execSync('read value; echo $value', { stdio: 'inherit' }).toString().trim();
        if (fs.existsSync(keyPath)) {
          credentials.privateKey = fs.readFileSync(keyPath, 'utf8').trim();
        } else {
          console.log(`❌ File not found: ${keyPath}`);
        }
      } catch (error) {
        console.log('\nInteractive input not available. Please provide APP_PRIVATE_KEY environment variable.');
      }
    }
  }
  
  return credentials;
}

// Export the function to get credentials
module.exports = {
  getAppCredentials: function() {
    let credentials = getCredentials();
    
    // Uncomment to enable interactive prompt (doesn't work well in some environments)
    // credentials = promptForCredentials(credentials);
    
    return credentials;
  }
}; 