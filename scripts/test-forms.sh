#!/bin/bash

# Form Validation Test Runner
# This script runs comprehensive tests to ensure all forms work properly

echo "🚀 Starting Form Validation Tests..."
echo "=================================="

# Run the basic test suite
echo "📝 Running basic form tests..."
npm test -- --testPathPattern="minimal.test.js|form-api-validation.test.js" --watchAll=false --verbose

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ Basic tests passed!"
else
    echo "❌ Basic tests failed!"
    exit 1
fi

# Build the project to catch any compilation issues
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🎉 All form validation tests completed successfully!"
echo "=================================="
echo "Forms validated:"
echo "✅ Punchlist form - API integration and validation"
echo "✅ Business task form - Required fields and data handling" 
echo "✅ Product form - Creation and update workflows"
echo "✅ Budget form - Team configuration and calculations"
echo ""
echo "To run continuous monitoring:"
echo "npm test -- --watch --testPathPattern='form-api-validation.test.js'"
