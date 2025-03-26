# Deployment Monitoring System

This directory contains workflows for automatically monitoring and fixing deployment issues for both the frontend (Vercel) and backend (Railway) components of the Tez Social application.

## Overview

The system consists of the following workflows:

1. **deployment-monitor.yml**: Checks the health of both deployments and triggers fix workflows if issues are detected
2. **fix-vercel.yml**: Diagnoses and fixes Vercel deployment issues
3. **fix-railway.yml**: Diagnoses and fixes Railway deployment issues
4. **launch-deployment-check.yml**: Triggers the monitor after a deployment might have happened
5. **vercel-deploy.yml**: Handles the frontend deployment to Vercel

## How It Works

1. Every time code is pushed to the main branch, the `launch-deployment-check.yml` workflow is triggered
2. After waiting for deployments to complete, it calls the main `deployment-monitor.yml` workflow
3. The monitor checks the health of both the frontend and backend deployments
4. If issues are detected, it automatically triggers the appropriate fix workflow
5. The fix workflows analyze the deployment logs, identify common issues, and apply appropriate fixes
6. After applying fixes, they trigger a new deployment
7. The monitoring system continues this cycle until all deployments are healthy

## Manual Triggering

You can manually trigger various workflows:

### Deployment Monitor

To manually run a health check of the deployments:

1. Go to the Actions tab
2. Select "Deployment Monitor" workflow
3. Click "Run workflow"
4. Choose which deployment(s) to check
5. Click "Run workflow"

### Fix Workflows

To manually trigger the fix workflows:

1. Go to the Actions tab
2. Select either "Fix Vercel Deployment" or "Fix Railway Deployment"
3. Click "Run workflow"
4. Provide the required parameters
5. Click "Run workflow"

## Types of Fixes

### Vercel (Frontend) Fixes

- Module not found errors
- Compilation errors
- Syntax and type errors
- Out of memory issues
- Static export errors
- SSR (Server-Side Rendering) errors
- File not found errors
- Route configuration errors

### Railway (Backend) Fixes

- Connectivity issues
- Service unavailable errors
- Missing endpoints
- API configuration errors
- Database connection issues
- Exception handling improvements

## Automatic Scheduling

The deployment monitor also runs automatically every 30 minutes to ensure ongoing health of the deployments. 