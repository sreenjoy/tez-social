/**
 * Fix All Deployments Script
 * 
 * This script is a comprehensive solution to fix all deployment issues.
 * It will:
 * 1. Check Vercel deployment status
 * 2. Check Railway deployment status
 * 3. Apply fixes to both platforms
 * 4. Keep retrying until everything is green
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const { getAppCredentials } = require('./get_app_credentials');
const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const OWNER = 'sreenjoy';
const REPO = 'tez-social';
const INSTALLATION_ID = 63351866;
const MAX_RETRIES = 5;
const RAILWAY_BACKEND_URL = 'https://tez-social-production.up.railway.app';

/**
 * Make an HTTP request to any API
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          // Try to parse as JSON if possible
          try {
            const jsonData = JSON.parse(responseData);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: jsonData
            });
          } catch (e) {
            // Return as text if not JSON
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData
            });
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Check Vercel deployment status
 */
async function checkVercelDeployments(octokit, secrets) {
  try {
    console.log('\n🔍 Checking Vercel deployments...');

    // Try to get secrets from GitHub
    let vercelToken = secrets.VERCEL_TOKEN;
    let vercelOrgId = secrets.VERCEL_ORG_ID;
    let vercelProjectId = secrets.VERCEL_PROJECT_ID;

    // Create temporary env file to store secrets
    if (vercelToken && vercelOrgId && vercelProjectId) {
      console.log('✅ Using Vercel credentials from GitHub secrets');
      
      // Make API request to Vercel
      const response = await makeRequest({
        hostname: 'api.vercel.com',
        path: `/v6/deployments?limit=5&teamId=${vercelOrgId}&projectId=${vercelProjectId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode === 200 && response.data && response.data.deployments) {
        console.log(`Found ${response.data.deployments.length} recent deployments`);
        
        // Check for errors
        const failedDeployments = response.data.deployments.filter(d => 
          d.state === 'ERROR' || (d.state === 'READY' && d.target === 'production' && d.alias.some(a => a.error))
        );
        
        if (failedDeployments.length > 0) {
          console.log(`❌ Found ${failedDeployments.length} failed deployments`);
          
          // Trigger the fix workflow for each failed deployment
          for (const deployment of failedDeployments) {
            console.log(`Attempting to fix deployment: ${deployment.uid}`);
            await triggerFixWorkflow(octokit, 'fix-vercel', {
              deployment_id: deployment.uid,
              deployment_url: deployment.url
            });
          }
          
          return false; // Not all green
        } else {
          console.log('✅ All Vercel deployments look good!');
          return true; // All green
        }
      } else {
        console.error(`❌ Error getting Vercel deployments: ${JSON.stringify(response.data)}`);
        // Try to fix by triggering the workflow anyway
        await triggerFixWorkflow(octokit, 'fix-vercel', {
          deployment_id: 'auto-detect',
          deployment_url: 'auto-detect'
        });
        return false;
      }
    } else {
      console.log('⚠️ Vercel credentials not available locally, triggering fix workflow with auto-detect');
      // Trigger workflow with auto-detect
      await triggerFixWorkflow(octokit, 'fix-vercel', {
        deployment_id: 'auto-detect',
        deployment_url: 'auto-detect'
      });
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking Vercel deployments: ${error.message}`);
    return false;
  }
}

/**
 * Check Railway deployment status
 */
async function checkRailwayDeployment(octokit) {
  try {
    console.log('\n🔍 Checking Railway deployment...');
    
    // Test main endpoint
    const mainResponse = await makeRequest({
      hostname: 'tez-social-production.up.railway.app',
      path: '/',
      method: 'GET'
    }).catch(() => ({ statusCode: 500 }));
    
    // Test health endpoint
    const healthResponse = await makeRequest({
      hostname: 'tez-social-production.up.railway.app',
      path: '/api/health',
      method: 'GET'
    }).catch(() => ({ statusCode: 500 }));
    
    console.log(`Main endpoint status: ${mainResponse.statusCode}`);
    console.log(`Health endpoint status: ${healthResponse.statusCode}`);
    
    if (healthResponse.statusCode === 200) {
      console.log('✅ Railway backend is healthy!');
      return true; // All green
    } else {
      console.log('❌ Railway backend has issues');
      
      // Trigger fix workflow
      await triggerFixWorkflow(octokit, 'fix-railway', {});
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking Railway deployment: ${error.message}`);
    return false;
  }
}

/**
 * Trigger a workflow to fix deployment issues
 */
async function triggerFixWorkflow(octokit, workflowName, inputs = {}) {
  try {
    console.log(`\n🔧 Triggering ${workflowName} workflow...`);
    
    // Find the workflow
    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner: OWNER,
      repo: REPO
    });
    
    const workflow = workflows.workflows.find(w => w.path.includes(`${workflowName}.yml`));
    
    if (!workflow) {
      console.error(`❌ Could not find ${workflowName} workflow`);
      return false;
    }
    
    console.log(`Found workflow: ${workflow.name} (ID: ${workflow.id})`);
    
    // Trigger the workflow
    await octokit.actions.createWorkflowDispatch({
      owner: OWNER,
      repo: REPO,
      workflow_id: workflow.id,
      ref: 'main',
      inputs
    });
    
    console.log(`✅ Successfully triggered ${workflowName} workflow!`);
    return true;
  } catch (error) {
    console.error(`❌ Error triggering ${workflowName} workflow: ${error.message}`);
    return false;
  }
}

/**
 * Get GitHub repository secrets if possible
 */
async function getRepositorySecrets(octokit) {
  try {
    // First try to list secrets (we can't get values, just names)
    const { data: secretList } = await octokit.actions.listRepoSecrets({
      owner: OWNER,
      repo: REPO
    });
    
    console.log(`Found ${secretList.total_count} secrets in the repository`);
    
    // Get repository public key for encrypting secrets
    const { data: publicKey } = await octokit.actions.getRepoPublicKey({
      owner: OWNER,
      repo: REPO
    });
    
    // Try to get secrets from environment variables
    const env = process.env;
    const secrets = {
      VERCEL_TOKEN: env.VERCEL_TOKEN,
      VERCEL_ORG_ID: env.VERCEL_ORG_ID,
      VERCEL_PROJECT_ID: env.VERCEL_PROJECT_ID
    };
    
    return secrets;
  } catch (error) {
    console.error(`Error getting repository secrets: ${error.message}`);
    return {};
  }
}

/**
 * Wait for a workflow run to complete
 */
async function waitForWorkflowRun(octokit, workflowId, timeoutSeconds = 300) {
  console.log(`Waiting for workflow run to complete (timeout: ${timeoutSeconds} seconds)...`);
  
  const startTime = Date.now();
  let isComplete = false;
  
  while (!isComplete && (Date.now() - startTime) < timeoutSeconds * 1000) {
    try {
      const { data } = await octokit.actions.listWorkflowRuns({
        owner: OWNER,
        repo: REPO,
        workflow_id: workflowId,
        per_page: 1
      });
      
      if (data.workflow_runs.length > 0) {
        const latestRun = data.workflow_runs[0];
        console.log(`Latest run status: ${latestRun.status}, conclusion: ${latestRun.conclusion}`);
        
        if (latestRun.status === 'completed') {
          console.log(`Workflow run completed with conclusion: ${latestRun.conclusion}`);
          return latestRun.conclusion === 'success';
        }
      }
      
      // Wait 10 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.error(`Error checking workflow run status: ${error.message}`);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('Timed out waiting for workflow run to complete');
  return false;
}

/**
 * Main function to fix all deployments
 */
async function fixAllDeployments() {
  try {
    console.log('🚀 Starting comprehensive deployment fix process...');
    
    // Get GitHub App credentials
    const credentials = getAppCredentials();
    const appId = credentials.appId;
    const privateKey = credentials.privateKey;
    
    if (!appId || !privateKey) {
      console.error('❌ GitHub App credentials not found. Cannot proceed.');
      process.exit(1);
    }
    
    console.log('✅ GitHub App credentials found');
    
    // Authenticate as the GitHub App
    const auth = createAppAuth({
      appId,
      privateKey
    });
    
    // Get an installation token
    console.log('🔑 Getting installation token...');
    const installationAuth = await auth({
      type: 'installation',
      installationId: INSTALLATION_ID
    });
    
    // Create Octokit instance
    const octokit = new Octokit({
      auth: installationAuth.token
    });
    
    // Get repository secrets if possible
    const secrets = await getRepositorySecrets(octokit);
    
    // Track retry attempts
    let retryCount = 0;
    let vercelOk = false;
    let railwayOk = false;
    
    while ((retryCount < MAX_RETRIES) && (!vercelOk || !railwayOk)) {
      console.log(`\n📋 Attempt ${retryCount + 1}/${MAX_RETRIES}`);
      
      // Check and fix Vercel deployments
      if (!vercelOk) {
        vercelOk = await checkVercelDeployments(octokit, secrets);
      }
      
      // Check and fix Railway deployment
      if (!railwayOk) {
        railwayOk = await checkRailwayDeployment(octokit);
      }
      
      if (vercelOk && railwayOk) {
        console.log('\n🎉 All deployments are green! Mission accomplished!');
        break;
      }
      
      // Wait before retrying
      if (!vercelOk || !railwayOk) {
        const waitSeconds = 60; // Wait 1 minute between retries
        console.log(`\nWaiting ${waitSeconds} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
      }
      
      retryCount++;
    }
    
    if (vercelOk && railwayOk) {
      console.log('\n✅ SUCCESS: All deployments are now green!');
    } else {
      console.log('\n⚠️ WARNING: Some deployments still have issues after maximum retries.');
      console.log('Vercel deployments:', vercelOk ? '✅ GREEN' : '❌ HAS ISSUES');
      console.log('Railway deployments:', railwayOk ? '✅ GREEN' : '❌ HAS ISSUES');
      console.log('\nRecommended action: Check the GitHub Actions logs to see if any specific errors were identified.');
    }
    
  } catch (error) {
    console.error('❌ Error fixing deployments:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the main function
fixAllDeployments(); 