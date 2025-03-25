#!/bin/bash

# Print Node and NPM versions
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean install dependencies
echo "Installing dependencies..."
npm ci

# Build the Next.js application
echo "Building the application..."
npm run build

# Check the build output
echo "Build completed. Listing .next directory:"
ls -la .next || echo "Error: .next directory not found" 