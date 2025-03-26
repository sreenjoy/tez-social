# Updating Your GitHub App Permissions

This guide will walk you through updating your existing GitHub App with additional permissions and event subscriptions to enhance your automation capabilities.

## Step 1: Access Your GitHub Apps

1. Go to your GitHub account settings by clicking on your profile picture in the top-right corner and selecting "Settings"
2. In the left sidebar, scroll down and click on "Developer settings"
3. In the Developer settings sidebar, click on "GitHub Apps"
4. Find your existing app for Tez-Social deployment monitoring and click on its name

## Step 2: Update Repository Permissions

Scroll down to the "Repository permissions" section and update/add the following permissions:

| Permission | Access Level |
|------------|--------------|
| Actions | Read & write |
| Checks | Read & write |
| Contents | Read & write |
| Deployments | Read & write |
| Issues | Read & write |
| Pull requests | Read & write |
| Workflows | Read & write |
| Commit statuses | Read & write (may appear as "Commit Status" in the UI) |

> Note: If you don't see "Statuses" or "Commit statuses", don't worry. Just set all the other permissions listed above.

## Step 3: Subscribe to Events

In the "Subscribe to events" section, check the following events:

- Check run
- Check suite
- Deployment
- Deployment status
- Push
- Status (if available)
- Workflow job
- Workflow run

## Step 4: Save Changes

Scroll to the bottom of the page and click the "Save changes" button.

## Step 5: Verify Installation

1. After saving changes, GitHub may prompt you to update the installation permissions
2. Follow any prompts to update the installation
3. If not prompted automatically, go to the "Install App" tab and click "Configure" next to your repository
4. Review and accept the updated permissions

## What's Being Updated

### New Permissions Added:
- **Checks**: Allows the app to create, manage, and view CI/CD check runs
- **Deployments**: Enables deployment creation and monitoring
- **Issues**: Allows automated issue creation and management
- **Commit statuses**: Enables setting commit status checks (if available)

### New Events Added:
- **Check run & Check suite**: For monitoring CI/CD processes
- **Deployment & Deployment status**: For tracking deployment progress
- **Status**: For responding to repository status changes (if available)
- **Workflow job & Workflow run**: For monitoring GitHub Actions workflows

These expanded permissions will enable your app to provide more comprehensive monitoring and automation capabilities. 