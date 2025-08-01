#!/usr/bin/env node

// Manual development server starter for Buildly React Template
// This script bypasses terminal execution issues

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Buildly React Template Development Server');
console.log('🏠 New Dashboard Feature: Comprehensive user dashboard with personalized content');

// Check if .env.development.local exists
const envPath = path.join(__dirname, '.env.development.local');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  Warning: .env.development.local not found');
    console.log('📝 Please create this file with your environment variables');
    process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

console.log('✅ Node.js version:', process.version);

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    const install = spawn('yarn', ['install'], { stdio: 'inherit' });
    install.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ Failed to install dependencies');
            process.exit(1);
        }
        startServer();
    });
} else {
    startServer();
}

function startServer() {
    console.log('🔧 Loading environment variables...');
    console.log('🌐 Starting development server on http://localhost:3000');
    console.log('📊 Dashboard will be available at http://localhost:3000/app/dashboard');
    
    // Set Node options for legacy OpenSSL provider
    process.env.NODE_OPTIONS = '--openssl-legacy-provider';
    
    // Start the development server
    const server = spawn('yarn', ['start'], { 
        stdio: 'inherit',
        env: { ...process.env }
    });
    
    server.on('error', (error) => {
        console.error('❌ Failed to start development server:', error.message);
        console.log('💡 Try running: NODE_OPTIONS="--openssl-legacy-provider" yarn start');
    });
    
    server.on('close', (code) => {
        console.log(`📴 Development server stopped with code ${code}`);
    });
}
