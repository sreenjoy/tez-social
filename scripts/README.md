# Tez-Social Scripts

This directory contains various scripts and tools for monitoring, testing, and automating the Tez-Social deployment pipeline.

## Setup

1. Make sure you have Node.js installed
2. Run `npm install` in this directory to install dependencies
3. Some scripts may require setting environment variables (see below)

## Available Scripts

1. **Test App Authentication**: Verifies that GitHub App authentication and permissions are working correctly.
   ```bash
   node test_app_auth.js
   ```

2. **Test Workflow Dispatch**: Tests if the GitHub App can successfully dispatch workflows.
   ```bash
   node test_dispatch_workflow.js
   ```

3. **Trigger Test Credentials**: Verifies that all credentials (Vercel, Railway, GitHub App) are functioning correctly.
   ```bash
   node trigger_test_credentials.js
   ```

4. **Monitor Workflows**: Provides real-time monitoring of GitHub workflow runs.
   ```bash
   node monitor_workflows.js
   ```

5. **Auto-Fix Issues**: Diagnoses and automatically attempts to fix common workflow issues.
   ```bash
   node auto_fix_issues.js
   ```

6. **Fix All Deployments**: Comprehensive script that checks and fixes both Vercel and Railway deployments.
   ```bash
   node fix_all_deployments.js
   ```

7. **Direct Vercel Fix**: Directly checks Vercel deployments using your credentials.
   ```bash
   VERCEL_TOKEN=your_token VERCEL_ORG_ID=your_org_id VERCEL_PROJECT_ID=your_project_id node run_direct_fix.js
   ```

## Manual Workflow Triggers (Easiest Method)

If you're having issues running the scripts locally, you can trigger the fix workflows directly from your browser:

1. **Fix Vercel Deployments**:
   - Go to: https://github.com/sreenjoy/tez-social/actions/workflows/fix-vercel.yml
   - Click "Run workflow"
   - Enter "auto-detect" for both deployment_id and deployment_url fields
   - Click "Run workflow" button

2. **Fix Railway Deployments**:
   - Go to: https://github.com/sreenjoy/tez-social/actions/workflows/fix-railway.yml
   - Click "Run workflow"
   - For backend_url, keep the default (https://tez-social-production.up.railway.app)
   - Click "Run workflow" button

3. **Run Deployment Monitor**:
   - Go to: https://github.com/sreenjoy/tez-social/actions/workflows/deployment-monitor.yml
   - Click "Run workflow"
   - Select "all" for check_type
   - Click "Run workflow" button

## Credential Files

For security reasons, these are not checked into Git:

- `app_id`: Contains the GitHub App ID
- `private-key.pem`: Contains the GitHub App private key

## Troubleshooting

If you encounter authentication errors:
1. Check that `app_id` and `private-key.pem` exist in this directory
2. Verify that the GitHub App has the required permissions
3. Check if the GitHub App is installed on the repository 