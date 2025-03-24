# Deployment Guide for Tez Social Frontend

This guide outlines the steps to deploy the Tez Social frontend application on Vercel.

## Prerequisites

- GitHub account
- Vercel account (can be created with your GitHub account)
- Your Tez Social frontend code pushed to a GitHub repository

## Deployment Steps

### 1. Prepare Your Application

1. Make sure your `.gitignore` is properly configured to exclude `node_modules`, `.env.local`, and other files that shouldn't be in version control.

2. Ensure your `next.config.js` is properly configured for production, especially the API URL settings:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/:path*',
      },
    ]
  },
}
```

3. Create a `.env.example` file that shows which environment variables are needed (without actual values).

### 2. Deploy to Vercel

1. Log in to [Vercel](https://vercel.com) using your GitHub account.

2. Click "Import Project" or "New Project".

3. Select the GitHub repository that contains your Tez Social frontend code.

4. Configure your project settings:
   - **Framework Preset**: Select "Next.js"
   - **Root Directory**: If your frontend is in a subdirectory, specify it (e.g., "frontend")
   - **Build Command**: Leave as default (`next build`)
   - **Output Directory**: Leave as default (`out` or `.next` depending on your export settings)

5. Set up environment variables:
   - Click "Environment Variables"
   - Add any required environment variables for your project
   - At minimum, add `NEXT_PUBLIC_API_URL` with the URL of your backend API

6. Click "Deploy"

### 3. Configure Custom Domain (Optional)

1. In your project dashboard, go to "Settings" > "Domains"

2. Add your custom domain and follow Vercel's instructions for DNS configuration

### 4. Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository:

- Any push to the main/master branch will trigger a production deployment
- Any push to other branches will create preview deployments

To change this behavior, go to "Settings" > "Git" in your project dashboard.

### 5. Environment-Specific Settings

For different environments (development, staging, production), you can:

1. Go to "Settings" > "Environment Variables"
2. Add environment-specific variables using the dropdown selector

## Troubleshooting

- **Build Failures**: Check Vercel's build logs for detailed error messages
- **API Connection Issues**: Verify that your `NEXT_PUBLIC_API_URL` is correct and the backend is accessible
- **Routing Problems**: Ensure your `next.config.js` rewrites are configured correctly

## Monitoring and Logs

Vercel provides basic analytics and logging:

1. Go to your project dashboard
2. Click "Analytics" to view performance metrics
3. Click "Logs" to examine application logs

## Rollbacks

If a deployment causes issues:

1. Go to your project's "Deployments" tab
2. Find a previous working deployment
3. Click "..." and select "Promote to Production" 