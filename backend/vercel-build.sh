#!/bin/bash

# Exit on error
set -e

echo "Starting backend build script"

# Install dependencies
npm ci

# Build the NestJS application
npm run build

echo "Backend build completed successfully"

# The output directory should be dist/ which contains the compiled JS files 