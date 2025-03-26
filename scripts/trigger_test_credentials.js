/**
 * Trigger Test Credentials Workflow
 * 
 * This script will trigger the test-credentials workflow to verify that
 * all credentials are working correctly.
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const { getAppCredentials } = require('./get_app_credentials');

// Installation ID for the Tez-Social repo
const INSTALLATION_ID = 63351866;

async function triggerTestCredentials() {
  try {
    // Get credentials
    const credentials = getAppCredentials();
    const appId = credentials.appId;
    const privateKey = credentials.privateKey;
    
    console.log('🚀 Triggering test-credentials workflow...\n');
    
    // Create app authentication
    const auth = createAppAuth({
      appId,
      privateKey,
    });
    
    // Get an installation access token
    console.log('Step 1: Creating installation access token...');
    const installationAuthentication = await auth({ 
      type: 'installation',
      installationId: INSTALLATION_ID 
    });
    
    console.log('✅ Successfully created installation access token');
    
    // Create Octokit instance with installation token
    const octokit = new Octokit({
      auth: installationAuthentication.token
    });
    
    // Find the test-credentials workflow
    console.log('\nStep 2: Finding test-credentials workflow...');
    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner: 'sreenjoy',
      repo: 'tez-social'
    });
    
    const testCredentialsWorkflow = workflows.workflows.find(workflow => 
      workflow.path.includes('test-credentials.yml')
    );
    
    if (!testCredentialsWorkflow) {
      console.error('❌ Could not find test-credentials.yml workflow');
      process.exit(1);
    }
    
    console.log(`✅ Found workflow: ${testCredentialsWorkflow.name} (ID: ${testCredentialsWorkflow.id})`);
    
    // Trigger the workflow
    console.log('\nStep 3: Triggering workflow...');
    await octokit.actions.createWorkflowDispatch({
      owner: 'sreenjoy',
      repo: 'tez-social',
      workflow_id: testCredentialsWorkflow.id,
      ref: 'main',
      inputs: {
        check_type: 'all'
      }
    });
    
    console.log('✅ Successfully triggered test-credentials workflow!');
    console.log(`\nGo to https://github.com/sreenjoy/tez-social/actions to see the results.`);
    console.log('The workflow will check:');
    console.log('1. Vercel credentials (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)');
    console.log('2. Railway integration');
    console.log('3. GitHub App credentials (APP_ID, APP_PRIVATE_KEY)');
    
    // Now trigger the deployment-monitor workflow
    console.log('\nStep 4: Triggering deployment-monitor workflow...');
    
    const deploymentMonitorWorkflow = workflows.workflows.find(workflow => 
      workflow.path.includes('deployment-monitor.yml')
    );
    
    if (!deploymentMonitorWorkflow) {
      console.error('❌ Could not find deployment-monitor.yml workflow');
      console.log('Skipping deployment monitoring check...');
    } else {
      console.log(`✅ Found workflow: ${deploymentMonitorWorkflow.name} (ID: ${deploymentMonitorWorkflow.id})`);
      
      await octokit.actions.createWorkflowDispatch({
        owner: 'sreenjoy',
        repo: 'tez-social',
        workflow_id: deploymentMonitorWorkflow.id,
        ref: 'main',
        inputs: {
          check_type: 'all'
        }
      });
      
      console.log('✅ Successfully triggered deployment-monitor workflow!');
    }
    
    console.log('\n🎯 All workflows triggered successfully. Monitoring for complete deployment pipeline is now active.');
    console.log('Check GitHub Actions tab for results and any necessary follow-up actions.');
  } catch (error) {
    console.error('❌ Error triggering workflow:', error.message);
    process.exit(1);
  }
}

triggerTestCredentials(); 