# Updating Your GitHub App Permissions

This guide will walk you through updating your existing GitHub App with additional permissions to enhance your automation capabilities.

## Step 1: Access Your GitHub Apps

1. Go to your GitHub account settings by clicking on your profile picture in the top-right corner and selecting "Settings"
2. In the left sidebar, scroll down and click on "Developer settings"
3. In the Developer settings sidebar, click on "GitHub Apps"
4. Find your existing app for Tez-Social deployment monitoring and click on its name

## Step 2: Navigate to Permissions & Events

1. In the left sidebar of your GitHub App settings, click on "Permissions & events"
2. You'll see the permissions interface with various categories like "Repository permissions"

## Step 3: Update Repository Permissions

In the "Repository permissions" section, set the following permissions to "Read and write":

| Permission | Access Level |
|------------|--------------|
| Actions | Read and write |
| Checks | Read and write |
| Contents | Read and write |
| Deployments | Read and write |
| Issues | Read and write |
| Pull requests | Read and write |
| Workflows | Read and write |

To change the permission level:
1. Click on the permission category
2. In the dropdown on the right side that appears, select "Read and write"
3. Some permissions may have associated events that will be automatically selected when you grant the permission

## Step 4: Save Changes

After setting all permissions:
1. Scroll to the bottom of the page
2. Click the "Save changes" button

## Step 5: Update Installation

1. After saving changes, GitHub may prompt you to update the installation permissions
2. Follow any prompts to update the installation
3. If not prompted automatically, go to the "Install App" tab and click "Configure" next to your repository
4. Review and accept the updated permissions

## What's Being Updated

### New Permissions Added:
- **Checks**: Allows the app to create, manage, and view CI/CD check runs
- **Deployments**: Enables deployment creation and monitoring
- **Issues**: Allows automated issue creation and management

### Events Automatically Included:
In the new GitHub interface, events are automatically tied to their corresponding permissions. By granting the permissions above, your app will be able to respond to:
- Check run and Check suite events
- Deployment and Deployment status events
- Push events
- Workflow job and Workflow run events

These expanded permissions will enable your app to provide more comprehensive monitoring and automation capabilities. 