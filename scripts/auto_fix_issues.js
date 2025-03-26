/**
 * Auto-Fix Common Issues
 * 
 * This script automatically diagnoses and fixes common issues with workflows and deployments.
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const { getAppCredentials } = require('./get_app_credentials');

// Installation ID for the Tez-Social repo
const INSTALLATION_ID = 63351866;

async function autoFixIssues() {
  try {
    console.log('🛠️ Starting Auto-Fix for Common Issues...\n');
    
    // Get credentials
    const credentials = getAppCredentials();
    const appId = credentials.appId;
    const privateKey = credentials.privateKey;
    
    // Create app authentication
    const auth = createAppAuth({
      appId,
      privateKey,
    });
    
    // Get an installation access token
    console.log('Authenticating as GitHub App...');
    const installationAuthentication = await auth({ 
      type: 'installation',
      installationId: INSTALLATION_ID 
    });
    
    // Create Octokit instance with installation token
    const octokit = new Octokit({
      auth: installationAuthentication.token
    });
    
    console.log('✅ Authentication successful\n');
    
    // 1. Check for failed workflow runs
    console.log('1. Checking for failed workflow runs...');
    
    const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
      owner: 'sreenjoy',
      repo: 'tez-social',
      status: 'failure',
      per_page: 5
    });
    
    if (runs.total_count === 0) {
      console.log('✅ No failed workflow runs found');
    } else {
      console.log(`⚠️ Found ${runs.total_count} failed workflow runs`);
      
      for (const run of runs.workflow_runs) {
        console.log(`Analyzing workflow: ${run.name} (ID: ${run.id})`);
        
        // Get workflow jobs
        const { data: jobsData } = await octokit.actions.listJobsForWorkflowRun({
          owner: 'sreenjoy',
          repo: 'tez-social',
          run_id: run.id
        });
        
        // Find failed jobs and steps
        const failedJobs = jobsData.jobs.filter(job => job.conclusion === 'failure');
        
        for (const job of failedJobs) {
          console.log(`Failed job: ${job.name}`);
          
          // Find failed steps
          const failedSteps = job.steps.filter(step => step.conclusion === 'failure');
          
          for (const step of failedSteps) {
            console.log(`Failed step: ${step.name}`);
            
            // Create issue if needed
            await createIssueForFailure(octokit, run, job, step);
          }
        }
      }
    }
    
    // 2. Check workflow files for permissions issues
    console.log('\n2. Checking workflow files for permissions issues...');
    
    // Get all workflows
    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner: 'sreenjoy',
      repo: 'tez-social'
    });
    
    for (const workflow of workflows.workflows) {
      console.log(`Checking workflow: ${workflow.name}`);
      
      try {
        // Get the workflow content
        const { data: content } = await octokit.repos.getContent({
          owner: 'sreenjoy',
          repo: 'tez-social',
          path: workflow.path
        });
        
        const workflowContent = Buffer.from(content.content, 'base64').toString();
        
        // Check if permissions are missing
        if (!workflowContent.includes('permissions:')) {
          console.log(`⚠️ Workflow ${workflow.name} is missing permissions section`);
          
          // Add permissions section
          const updatedContent = addPermissionsToWorkflow(workflowContent);
          
          // Update the workflow file
          await octokit.repos.createOrUpdateFileContents({
            owner: 'sreenjoy',
            repo: 'tez-social',
            path: workflow.path,
            message: `fix: add permissions to ${workflow.name} workflow`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: content.sha
          });
          
          console.log(`✅ Added permissions section to ${workflow.name}`);
        }
      } catch (error) {
        console.error(`Error checking workflow ${workflow.name}: ${error.message}`);
      }
    }
    
    // 3. Final report
    console.log('\n🏁 Auto-Fix Complete!');
    console.log('Check the GitHub Actions tab for any remaining issues');
    
  } catch (error) {
    console.error(`Error in auto-fix script: ${error.message}`);
    process.exit(1);
  }
}

async function createIssueForFailure(octokit, run, job, step) {
  // Check if it's a critical issue that needs attention
  const isCritical = 
    step.name.includes('auth') || 
    step.name.includes('deploy') || 
    step.name.includes('token') ||
    step.name.includes('vercel') ||
    step.name.includes('railway');
  
  if (!isCritical) {
    return;
  }
  
  try {
    const issueTitle = `🚨 ${run.name} workflow failure: ${step.name}`;
    
    // Check if a similar issue already exists
    const { data: existingIssues } = await octokit.issues.listForRepo({
      owner: 'sreenjoy',
      repo: 'tez-social',
      state: 'open',
      per_page: 5
    });
    
    if (existingIssues.some(issue => issue.title === issueTitle)) {
      console.log(`Issue already exists for ${run.name} workflow failure`);
      return;
    }
    
    // Create a new issue
    const { data: issue } = await octokit.issues.create({
      owner: 'sreenjoy',
      repo: 'tez-social',
      title: issueTitle,
      body: `A critical failure was detected in workflow run.

## Details
- **Workflow**: ${run.name}
- **Job**: ${job.name}
- **Failed Step**: ${step.name}
- **Run ID**: ${run.id}
- **Workflow URL**: ${run.html_url}

## Suggested Actions
1. Check the workflow logs for detailed error messages
2. Verify that all required secrets are correctly set
3. Check for any API rate limits or authentication issues
4. If deployment-related, verify Vercel and Railway status

This issue was automatically created by the auto-fix system.
`
    });
    
    console.log(`✅ Created issue #${issue.number} for workflow failure`);
  } catch (error) {
    console.error(`Error creating issue: ${error.message}`);
  }
}

function addPermissionsToWorkflow(workflowContent) {
  // Don't modify if permissions already exists
  if (workflowContent.includes('permissions:')) {
    return workflowContent;
  }
  
  // Find the position to insert permissions
  const onIndex = workflowContent.indexOf('on:');
  if (onIndex === -1) {
    return workflowContent;
  }
  
  // Find the next line after 'on:' section
  let onSectionEnd = workflowContent.indexOf('jobs:', onIndex);
  if (onSectionEnd === -1) {
    onSectionEnd = workflowContent.indexOf('runs-on:', onIndex);
  }
  if (onSectionEnd === -1) {
    return workflowContent;
  }
  
  // Insert permissions section
  const permissionsSection = `
# Add permissions needed for GitHub token
permissions:
  actions: write
  contents: write
  deployments: write
  id-token: write
  issues: write
  pull-requests: write

`;
  
  return workflowContent.substring(0, onSectionEnd) + permissionsSection + workflowContent.substring(onSectionEnd);
}

autoFixIssues(); 