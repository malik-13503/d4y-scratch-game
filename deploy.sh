#!/bin/bash

# Deployment script to handle layer push issues
echo "Starting deployment preparation..."

# Clear any existing npm cache
npm cache clean --force

# Remove node_modules to ensure clean state
rm -rf node_modules

# Install dependencies with no cache
npm ci --no-cache --include=dev

# Run build with explicit flags to avoid caching issues
NODE_ENV=production npm run build

echo "Build completed successfully"
echo "Ready for deployment"