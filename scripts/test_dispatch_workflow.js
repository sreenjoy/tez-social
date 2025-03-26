/**
 * Test Workflow Dispatch
 * 
 * This script tests if your GitHub App can dispatch a workflow.
 * It will trigger the test-credentials.yml workflow.
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const { getAppCredentials } = require('./get_app_credentials');

// Installation ID for the Tez-Social repo
const INSTALLATION_ID = 63351866;

async function testWorkflowDispatch() {
  try {
    // Get credentials
    const credentials = getAppCredentials();
    const appId = credentials.appId;
    const privateKey = credentials.privateKey;
    
    console.log('🔄 Testing workflow dispatch...\n');
    
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
    
    // Get workflows
    console.log('\nStep 2: Getting workflow information...');
    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner: 'sreenjoy',
      repo: 'tez-social'
    });
    
    // Find the verify permissions workflow or test credentials workflow
    let workflowId = null;
    let workflowName = null;
    
    for (const workflow of workflows.workflows) {
      if (workflow.path.includes('verify-app-permissions.yml')) {
        workflowId = workflow.id;
        workflowName = 'verify-app-permissions';
        break;
      } else if (workflow.path.includes('test-credentials.yml')) {
        workflowId = workflow.id;
        workflowName = 'test-credentials';
        break;
      }
    }
    
    if (!workflowId) {
      console.log('❌ Could not find a suitable workflow to dispatch');
      console.log('Please make sure verify-app-permissions.yml or test-credentials.yml exists');
      process.exit(1);
    }
    
    console.log(`✅ Found workflow: ${workflowName} (ID: ${workflowId})`);
    
    // Trigger workflow
    console.log('\nStep 3: Dispatching workflow...');
    try {
      await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
        owner: 'sreenjoy',
        repo: 'tez-social',
        workflow_id: workflowId,
        ref: 'main',
        inputs: {
          check_type: 'all'
        }
      });
      
      console.log('✅ Successfully dispatched workflow!');
      console.log(`\nGo to https://github.com/sreenjoy/tez-social/actions to see the workflow running.`);
      console.log(`The "${workflowName}" workflow should appear in the list of recent workflow runs.`);
    } catch (error) {
      console.error('❌ Failed to dispatch workflow:', error.message);
      console.log('\nThis may be because:');
      console.log('1. The app does not have the "actions" and "workflows" write permissions');
      console.log('2. The workflow is not configured to allow workflow_dispatch events');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing workflow dispatch:', error.message);
    process.exit(1);
  }
}

testWorkflowDispatch(); 