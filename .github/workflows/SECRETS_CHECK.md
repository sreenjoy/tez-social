# Verifying GitHub Secrets

## Current Status

- **Railway Backend Status**: 
  - Main endpoint returns a 404 status, which is expected if no frontend route is defined
  - Health endpoint returns a 200 status, indicating the backend is working correctly

- **Vercel Credentials**: Use the new test workflow for verification (see below)

## Testing Your Credentials

We've created a specialized GitHub workflow to test all your credentials directly in GitHub Actions. This provides a secure way to verify your credentials without exposing them.

### Using the Test Credentials Workflow

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Find the "Test Credentials" workflow in the sidebar
4. Click "Run workflow"
5. You can choose to test:
   - `all`: Test all credentials at once
   - `vercel`: Test only Vercel credentials
   - `railway`: Test only Railway integration
   - `github_app`: Test only GitHub App credentials
6. Click "Run workflow" again to start the test

The workflow will generate a detailed report showing:
- Whether each secret is properly set
- If the credentials provide working API access
- Details about the resources being accessed (team names, project names, etc.)

### What to Check in the Results

The workflow results will show:

#### For Vercel:
- Verification that `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are set
- Test results for accessing the Vercel Team, Project, and Deployments APIs
- Details about your project if the credentials are working

#### For Railway:
- Test results for accessing the Railway endpoints
- Verification that the API health endpoint returns a 200 status

#### For GitHub App:
- Verification that `APP_ID` and `APP_PRIVATE_KEY` are set
- Validation of the private key format
- Test results for authenticating as the GitHub App

## Finding Correct Credential Values

If you need to set up or update your credentials:

### Vercel Credentials

1. **VERCEL_TOKEN**
   - Go to your [Vercel account settings](https://vercel.com/account/tokens)
   - Create a new token with full scope access
   - Copy the token value

2. **VERCEL_ORG_ID and VERCEL_PROJECT_ID**
   - Go to your project in the Vercel dashboard
   - Click on "Settings" → "General"
   - Scroll down to find both the "Project ID" and "Organization ID"

### GitHub App Credentials

1. **APP_ID**
   - Go to your GitHub App settings
   - The App ID is displayed prominently at the top

2. **APP_PRIVATE_KEY**
   - Go to your GitHub App settings
   - Scroll to the "Private keys" section
   - Generate a new private key and download it
   - Open the .pem file and copy the entire contents, including the BEGIN and END lines

## Adding Secrets to Your Repository

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each secret with its exact name and value
5. Click "Add secret"

## Manual Verification

If you prefer to verify credentials manually:

### For Vercel:
Run the test script provided earlier:
```bash
VERCEL_TOKEN='your-token' VERCEL_ORG_ID='your-org-id' VERCEL_PROJECT_ID='your-project-id' node test_vercel_credentials.js
```

### For GitHub App:
Check that your app is installed on your repository and has the correct permissions.

## Troubleshooting

If the test workflow shows issues with your credentials:

1. Ensure you've copied the credentials correctly (check for extra spaces, line breaks, etc.)
2. Verify that the credentials have the necessary permissions
3. For GitHub App issues, try generating a new private key
4. For Vercel token issues, generate a new token with full scope access 