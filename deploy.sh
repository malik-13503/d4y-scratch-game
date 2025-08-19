#!/bin/bash

# Deployment script to prepare clean build environment
echo "Starting deployment preparation..."

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Remove node_modules and lock file for clean install
echo "Removing existing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
echo "Installing dependencies..."
npm install --no-fund --no-audit

# Verify installation
echo "Verifying installation..."
npm list --depth=0

# Build project
echo "Building project..."
npm run build

echo "Deployment preparation completed!"