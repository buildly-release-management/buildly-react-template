#!/bin/bash

# Enhanced development server script for Buildly React Template
# This script addresses Node.js compatibility issues

echo "🚀 Starting Buildly React Template Development Server"
echo "🏠 Dashboard Feature: Comprehensive user dashboard with personalized content"

# Change to project root directory
cd "$(dirname "$0")/.."

# Check if .env.development.local exists
if [ ! -f ".env.development.local" ]; then
    echo "⚠️  Warning: .env.development.local not found"
    echo "📝 Please create this file with your environment variables"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "🔧 Loading environment variables..."
set -a
source .env.development.local
set +a

echo "🌐 Starting development server on http://localhost:3000"
echo "📊 Dashboard will be available at http://localhost:3000/app/dashboard"
echo "🎯 After login, you'll be redirected to the Dashboard automatically"

# Set Node options for compatibility with newer Node.js versions
export NODE_OPTIONS="--openssl-legacy-provider"

# Try multiple approaches to start the server
echo "🔄 Attempting to start with yarn..."
if ! yarn start; then
    echo "⚠️  Yarn start failed, trying alternative method..."
    echo "🔄 Attempting with npx webpack-dev-server..."
    npx webpack-dev-server --mode development --openssl-legacy-provider --port 3000
fi
