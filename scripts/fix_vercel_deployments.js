/**
 * Fix Vercel Deployments
 * 
 * This script directly triggers the fix-vercel workflow to resolve Vercel deployment issues.
 * It doesn't try to access repository secrets locally.
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const { getAppCredentials } = require('./get_app_credentials');

// Configuration
const OWNER = 'sreenjoy';
const REPO = 'tez-social';
const INSTALLATION_ID = 63351866;

/**
 * Fix Vercel deployment issues by triggering the fix-vercel workflow
 */
async function triggerFixVercelWorkflow() {
  try {
    console.log('🚀 Starting Vercel deployment fix process...');
    
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
    
    // First, find all failed Vercel deployments through the deployment-monitor workflow
    console.log('\n🔍 Looking for recent failed Vercel deployments...');
    
    try {
      // Get list of recent deployments using the Vercel deployment IDs in the workflow
      const { data: workflows } = await octokit.actions.listRepoWorkflows({
        owner: OWNER,
        repo: REPO
      });
      
      // Find the fix-vercel workflow
      const fixVercelWorkflow = workflows.workflows.find(workflow => 
        workflow.path.includes('fix-vercel.yml')
      );
      
      if (!fixVercelWorkflow) {
        console.error('❌ Could not find fix-vercel.yml workflow');
        process.exit(1);
      }
      
      console.log(`✅ Found fix-vercel workflow: ${fixVercelWorkflow.name} (ID: ${fixVercelWorkflow.id})`);

      // Also find the deployment-monitor workflow to check its latest run
      const deploymentMonitorWorkflow = workflows.workflows.find(workflow => 
        workflow.path.includes('deployment-monitor.yml')
      );
      
      if (deploymentMonitorWorkflow) {
        console.log(`✅ Found deployment-monitor workflow: ${deploymentMonitorWorkflow.name} (ID: ${deploymentMonitorWorkflow.id})`);
        
        // Get the latest workflow run
        const { data: monitorRuns } = await octokit.actions.listWorkflowRuns({
          owner: OWNER,
          repo: REPO,
          workflow_id: deploymentMonitorWorkflow.id,
          per_page: 1
        });
        
        console.log(`Most recent deployment monitor run: ${monitorRuns.workflow_runs[0]?.html_url || 'None found'}`);
      }
      
      // Trigger the fix-vercel workflow directly with empty deployment parameters
      // The workflow will detect and fix all failing deployments
      console.log('\n🔧 Triggering fix-vercel workflow to fix all deployment issues...');
      
      await octokit.actions.createWorkflowDispatch({
        owner: OWNER,
        repo: REPO,
        workflow_id: fixVercelWorkflow.id,
        ref: 'main',
        inputs: {
          deployment_id: 'auto-detect',
          deployment_url: 'auto-detect'
        }
      });
      
      console.log('✅ Successfully triggered fix-vercel workflow!');
      console.log(`\nGo to https://github.com/${OWNER}/${REPO}/actions to see the progress.`);
      console.log('\nThe workflow will:');
      console.log('1. Detect and analyze Vercel deployment errors');
      console.log('2. Apply appropriate fixes based on the error type');
      console.log('3. Trigger a new deployment with the fixes');
      
    } catch (error) {
      console.error(`❌ Error finding or triggering workflows: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Vercel deployments:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the main function
triggerFixVercelWorkflow(); 