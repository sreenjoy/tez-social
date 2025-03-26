# Setting Up GitHub Secrets for Deployment Monitoring

To make the deployment monitoring system work correctly, you need to set up the following secrets in your GitHub repository:

## Required Secrets

### For Vercel Integration

- `VERCEL_TOKEN`: A personal access token from Vercel (can be generated in Vercel Account Settings > Tokens)
- `VERCEL_ORG_ID`: Your Vercel organization ID (available in Vercel project settings)
- `VERCEL_PROJECT_ID`: The Vercel project ID for your frontend deployment (available in Vercel project settings)

### For GitHub Actions Authentication

Choose one of the following authentication methods:

#### Option 1: GitHub App (Recommended)

1. Create a GitHub App with the following permissions:
   - Repository permissions:
     - Actions: Read & write
     - Contents: Read & write
     - Workflows: Read & write
     - Pull requests: Read & write

2. Install the GitHub App on your repository

3. Add these secrets to your repository:
   - `APP_ID`: The GitHub App ID
   - `APP_PRIVATE_KEY`: The private key for your GitHub App (generated when you create the app)

#### Option 2: Personal Access Token

1. Create a Personal Access Token (PAT) with the following permissions:
   - repo (full access)
   - workflow

2. Add this secret to your repository:
   - `WORKFLOW_PAT`: Your personal access token

## How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add each of the secrets listed above

## Testing the Setup

After setting up the secrets, you can manually trigger the deployment check:

1. Go to the "Actions" tab
2. Select "Launch Deployment Check" from the workflow list
3. Click "Run workflow"
4. Choose "all" for the type of check to perform
5. Click "Run workflow"

If everything is set up correctly, the workflow should run successfully and trigger the monitoring system. 