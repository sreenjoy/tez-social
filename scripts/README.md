# Tez-Social Deployment Automation Tools

This directory contains scripts for monitoring, testing, and automating the Tez-Social deployment pipeline.

## Setup

Before using these scripts, install the dependencies:

```bash
npm install
```

This will install the required packages defined in `package.json`.

## Available Scripts

### 1. Test App Authentication

```bash
node test_app_auth.js
```

Tests GitHub App authentication using your credentials in app_id and private-key.pem files. Verifies that your GitHub App has the correct permissions and can:
- Authenticate as the GitHub App
- Get installation tokens
- Access repository information
- List workflows
- Access content

### 2. Test Workflow Dispatch

```bash
node test_dispatch_workflow.js
```

Tests if your GitHub App can dispatch a workflow. This confirms that your GitHub App has the necessary permissions to trigger GitHub Actions workflows.

### 3. Trigger Test Credentials

```bash
node trigger_test_credentials.js
```

Triggers both the test-credentials and deployment-monitor workflows to verify that all credentials are working correctly. This checks:
- Vercel credentials (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- Railway integration
- GitHub App credentials (APP_ID, APP_PRIVATE_KEY)

### 4. Monitor Workflows

```bash
node monitor_workflows.js
```

Provides real-time monitoring of GitHub workflow runs. Shows:
- New workflow runs
- Updated workflow status
- Completed workflow results
- Detailed information about failures

Use this for continuous monitoring during deployment and debugging.

### 5. Auto-Fix Issues

```bash
node auto_fix_issues.js
```

Automatically diagnoses and fixes common issues with workflows and deployments:
- Checks for failed workflow runs
- Fixes missing permissions in workflow files
- Creates issues for critical failures that need attention
- Verifies GitHub App permissions

Run this if you're experiencing workflow failures or deployment issues.

## Credential Files

These scripts use credential files for GitHub App authentication:

- `app_id`: Contains your GitHub App ID
- `private-key.pem`: Contains your GitHub App private key

These files are excluded from git via .gitignore for security.

## Troubleshooting

If scripts fail with authentication errors:
1. Verify that app_id and private-key.pem files exist and contain valid credentials
2. Check that your GitHub App has the correct permissions
3. Ensure the app is installed on your repository

For detailed logs and diagnostics, run the monitor_workflows.js script while triggering other operations. 