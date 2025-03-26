/**
 * Monitor GitHub Workflows
 * 
 * This script monitors active workflows in the repository and provides real-time updates.
 * It shows the status of all triggered workflows and detects failures.
 */

const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const { getAppCredentials } = require('./get_app_credentials');

// Installation ID for the Tez-Social repo
const INSTALLATION_ID = 63351866;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

// Workflow status emoji mapping
const statusEmoji = {
  completed: '✅',
  in_progress: '🔄',
  queued: '⏳',
  requested: '🔔',
  waiting: '⏱️',
  pending: '⏱️',
  failure: '❌',
  timed_out: '⏰',
  cancelled: '🚫',
  skipped: '⏭️',
  success: '✅',
  neutral: '➖',
  startup_failure: '💥'
};

async function monitorWorkflows() {
  try {
    console.log(`${colors.bold}🔍 Starting GitHub Workflows Monitor...${colors.reset}\n`);
    
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
    console.log(`${colors.blue}Authenticating as GitHub App...${colors.reset}`);
    const installationAuthentication = await auth({ 
      type: 'installation',
      installationId: INSTALLATION_ID 
    });
    
    // Create Octokit instance with installation token
    const octokit = new Octokit({
      auth: installationAuthentication.token
    });
    
    console.log(`${colors.green}✅ Authentication successful${colors.reset}\n`);
    
    // Set up polling to check workflow status
    const pollingInterval = 10000; // 10 seconds
    let firstRun = true;
    let seenRuns = new Set();
    
    async function checkWorkflows() {
      try {
        // Get recent workflow runs
        const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
          owner: 'sreenjoy',
          repo: 'tez-social',
          per_page: 10
        });
        
        if (firstRun) {
          console.log(`${colors.bold}Found ${runs.total_count} workflow runs in total.${colors.reset}`);
          console.log(`${colors.gray}Monitoring the most recent runs...${colors.reset}\n`);
          firstRun = false;
        }
        
        // Process each workflow run
        const newRuns = [];
        const updatedRuns = [];
        const completedRuns = [];
        
        for (const run of runs.workflow_runs) {
          // Skip older runs (more than 1 hour old)
          const runTime = new Date(run.created_at);
          const now = new Date();
          const hourAgo = new Date(now - 60 * 60 * 1000);
          
          if (runTime < hourAgo) {
            continue;
          }
          
          const runId = run.id;
          
          // Track new runs
          if (!seenRuns.has(runId)) {
            seenRuns.add(runId);
            newRuns.push(run);
          } 
          // Track completed runs
          else if (run.status === 'completed' && !run.processed) {
            run.processed = true;
            completedRuns.push(run);
          } 
          // Track updated runs (but not completed ones)
          else if (run.status !== 'completed') {
            updatedRuns.push(run);
          }
        }
        
        // Display newly discovered runs
        if (newRuns.length > 0) {
          console.log(`${colors.bold}🆕 New workflow runs:${colors.reset}`);
          displayRuns(newRuns);
        }
        
        // Display updated runs
        if (updatedRuns.length > 0) {
          console.log(`${colors.bold}📊 Updated workflow runs:${colors.reset}`);
          displayRuns(updatedRuns);
        }
        
        // Display completed runs
        if (completedRuns.length > 0) {
          console.log(`${colors.bold}🏁 Completed workflow runs:${colors.reset}`);
          displayRuns(completedRuns);
          
          // Check for failures
          const failedRuns = completedRuns.filter(run => run.conclusion !== 'success');
          if (failedRuns.length > 0) {
            console.log(`${colors.red}${colors.bold}⚠️ Failures detected!${colors.reset}`);
            
            for (const run of failedRuns) {
              console.log(`${colors.red}❌ Workflow "${run.name}" failed with conclusion: ${run.conclusion}${colors.reset}`);
              console.log(`   Run ID: ${run.id}`);
              console.log(`   URL: ${run.html_url}`);
              
              // Get and display job information for the failed run
              try {
                const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
                  owner: 'sreenjoy',
                  repo: 'tez-social',
                  run_id: run.id
                });
                
                const failedJobs = jobs.jobs.filter(job => job.conclusion !== 'success');
                if (failedJobs.length > 0) {
                  console.log(`   Failed jobs:`);
                  for (const job of failedJobs) {
                    console.log(`     - ${job.name}: ${job.conclusion}`);
                    console.log(`       Steps:`);
                    
                    // Display failed steps
                    const failedSteps = job.steps.filter(step => step.conclusion !== 'success' && step.conclusion !== null);
                    for (const step of failedSteps) {
                      console.log(`         - ${step.name}: ${step.conclusion}`);
                    }
                  }
                }
              } catch (error) {
                console.log(`   Could not fetch job details: ${error.message}`);
              }
            }
            
            console.log(`\n${colors.yellow}🔍 For detailed error information, check the run logs at:${colors.reset}`);
            for (const run of failedRuns) {
              console.log(`   ${run.html_url}`);
            }
          }
        }
        
        // If no new, updated, or completed runs, show a waiting message
        if (newRuns.length === 0 && updatedRuns.length === 0 && completedRuns.length === 0) {
          process.stdout.write('.');
        }
      } catch (error) {
        console.error(`${colors.red}Error checking workflows: ${error.message}${colors.reset}`);
      }
    }
    
    // Helper function to display runs
    function displayRuns(runs) {
      for (const run of runs) {
        const emoji = statusEmoji[run.status] || statusEmoji[run.conclusion] || '❓';
        let statusColor = colors.gray;
        
        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            statusColor = colors.green;
          } else if (run.conclusion === 'failure' || run.conclusion === 'timed_out') {
            statusColor = colors.red;
          } else if (run.conclusion === 'cancelled') {
            statusColor = colors.yellow;
          }
        } else if (run.status === 'in_progress') {
          statusColor = colors.blue;
        } else if (run.status === 'queued' || run.status === 'waiting') {
          statusColor = colors.yellow;
        }
        
        console.log(`${emoji} ${run.name} (${run.id})`);
        console.log(`   ${statusColor}Status: ${run.status}${run.conclusion ? `, Conclusion: ${run.conclusion}` : ''}${colors.reset}`);
        console.log(`   Triggered by: ${run.event}`);
        console.log(`   Branch: ${run.head_branch}`);
        console.log(`   Started: ${new Date(run.created_at).toLocaleString()}`);
        if (run.updated_at) {
          console.log(`   Last update: ${new Date(run.updated_at).toLocaleString()}`);
        }
        console.log(`   URL: ${run.html_url}`);
        console.log('');
      }
    }
    
    // Start monitoring and poll at intervals
    await checkWorkflows();
    
    const interval = setInterval(async () => {
      await checkWorkflows();
    }, pollingInterval);
    
    // Handle termination
    process.on('SIGINT', () => {
      clearInterval(interval);
      console.log(`\n${colors.bold}Monitoring stopped.${colors.reset}`);
      process.exit();
    });
    
    console.log(`${colors.gray}Monitoring workflows every ${pollingInterval/1000} seconds...${colors.reset}`);
    console.log(`${colors.gray}Press Ctrl+C to stop monitoring.${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}Error setting up monitoring: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

monitorWorkflows(); 