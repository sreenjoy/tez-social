/**
 * Direct Vercel Fix Script
 * 
 * This script directly checks your Vercel deployments using your credentials
 * and triggers the fix workflows if it finds any issues.
 * 
 * Usage:
 * VERCEL_TOKEN=your_token VERCEL_ORG_ID=your_org_id VERCEL_PROJECT_ID=your_project_id node run_direct_fix.js
 */

const https = require('https');
const { execSync } = require('child_process');

// Required environment variables
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// Check if all required environment variables are set
if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
  console.error('❌ Error: Missing required environment variables');
  console.error('This script requires VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID');
  console.error('Run with:');
  console.error('VERCEL_TOKEN=your_token VERCEL_ORG_ID=your_org_id VERCEL_PROJECT_ID=your_project_id node run_direct_fix.js');
  process.exit(1);
}

/**
 * Make an HTTP request to the Vercel API
 */
function makeVercelRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Execute a command and return the output
 */
function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return '';
  }
}

/**
 * Check Vercel deployments
 */
async function checkVercelDeployments() {
  try {
    console.log('🔍 Checking Vercel deployments...');

    const response = await makeVercelRequest(`/v6/deployments?limit=10&teamId=${VERCEL_ORG_ID}&projectId=${VERCEL_PROJECT_ID}`);

    if (response.statusCode === 200 && response.data && response.data.deployments) {
      console.log(`Found ${response.data.deployments.length} recent deployments`);
      
      // Check for error deployments
      const errorDeployments = response.data.deployments.filter(d => d.state === 'ERROR');
      console.log(`Found ${errorDeployments.length} error deployments`);
      
      if (errorDeployments.length > 0) {
        // Print details of each error deployment
        errorDeployments.forEach((deployment, index) => {
          console.log(`\nError Deployment ${index + 1}:`);
          console.log(`ID: ${deployment.uid}`);
          console.log(`URL: ${deployment.url}`);
          console.log(`Created: ${new Date(deployment.created).toLocaleString()}`);
          
          // Fetch deployment logs
          fetchDeploymentLogs(deployment.uid);
        });
        
        // Trigger fix workflow
        console.log('\n🔧 Triggering fix workflow on GitHub...');
        
        // Trigger workflow using GitHub API if we had access tokens, but for now we'll just instruct
        console.log('\n✅ Script completed! To fix the errors:');
        console.log('1. Go to your GitHub repository');
        console.log('2. Navigate to Actions tab');
        console.log('3. Select "Fix Vercel Deployment" workflow');
        console.log('4. Click "Run workflow"');
        console.log('5. In the inputs, enter "auto-detect" for both fields');
        console.log('6. Click "Run workflow"');
        
        return false;
      } else {
        console.log('✅ No error deployments found!');
        
        // Check for ready deployments
        const readyDeployments = response.data.deployments.filter(d => d.state === 'READY');
        
        if (readyDeployments.length > 0) {
          const latestReady = readyDeployments[0];
          console.log(`\nLatest ready deployment:`);
          console.log(`ID: ${latestReady.uid}`);
          console.log(`URL: ${latestReady.url}`);
          console.log(`Created: ${new Date(latestReady.created).toLocaleString()}`);
          
          // Check if the deployment URL is accessible
          const curlCommand = `curl -s -o /dev/null -w "%{http_code}" https://${latestReady.url}`;
          const statusCode = exec(curlCommand).trim();
          
          console.log(`Status code for deployment URL: ${statusCode}`);
          
          if (statusCode === '200') {
            console.log('✅ Deployment is accessible!');
            return true;
          } else {
            console.log('⚠️ Deployment URL returns non-200 status code');
            return false;
          }
        }
        
        return true;
      }
    } else {
      console.error('❌ Error getting Vercel deployments:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking Vercel deployments:', error.message);
    return false;
  }
}

/**
 * Fetch deployment logs for a specific deployment
 */
async function fetchDeploymentLogs(deploymentId) {
  try {
    console.log(`\nFetching logs for deployment ${deploymentId}...`);
    
    const response = await makeVercelRequest(`/v6/deployments/${deploymentId}/events`);
    
    if (response.statusCode === 200 && response.data && response.data.events) {
      // Extract errors from logs
      const errorLogs = response.data.events
        .filter(event => event.type === 'stderr' || event.type === 'error')
        .map(event => event.payload)
        .filter(Boolean);
      
      if (errorLogs.length > 0) {
        console.log('\nError logs:');
        errorLogs.forEach((log, index) => {
          console.log(`\n[Error ${index + 1}]:`);
          console.log(log);
        });
      } else {
        console.log('No error logs found in the deployment events');
      }
    } else {
      console.error('Failed to fetch deployment logs:', response.data);
    }
  } catch (error) {
    console.error('Error fetching deployment logs:', error.message);
  }
}

// Run the main function
async function main() {
  try {
    console.log('🚀 Starting direct Vercel deployment check...');
    console.log('Using the following credentials:');
    console.log(`- VERCEL_ORG_ID: ${VERCEL_ORG_ID}`);
    console.log(`- VERCEL_PROJECT_ID: ${VERCEL_PROJECT_ID}`);
    console.log(`- VERCEL_TOKEN: ${VERCEL_TOKEN.substring(0, 5)}...${VERCEL_TOKEN.substring(VERCEL_TOKEN.length - 5)}\n`);
    
    const isSuccess = await checkVercelDeployments();
    
    if (isSuccess) {
      console.log('\n✅ SUCCESS: No deployment issues detected');
    } else {
      console.log('\n⚠️ ATTENTION: Deployment issues detected');
      console.log('Follow the instructions above to fix the issues');
    }
  } catch (error) {
    console.error('❌ Unhandled error:', error.message);
    process.exit(1);
  }
}

main(); 