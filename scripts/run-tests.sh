#!/bin/bash

echo "🧪 Running Buildly React Template Test Suite"
echo "============================================"

# Change to project root directory
cd "$(dirname "$0")/.."

# Check for minimal test mode
if [ "$1" = "--minimal" ] || [ "$1" = "-m" ]; then
    echo "🔬 Running minimal Jest validation only..."
    if command -v yarn &> /dev/null; then
        yarn test -- --testPathPattern="minimal.test.js" --watchAll=false --verbose
    elif command -v npm &> /dev/null; then
        npm test -- --testPathPattern="minimal.test.js" --watchAll=false --verbose
    else
        echo "❌ Neither yarn nor npm found. Please install a package manager."
        exit 1
    fi
    exit $?
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to run tests for a specific area
run_test_area() {
    local area=$1
    local pattern=$2
    echo -e "\n${YELLOW}📋 Testing $area...${NC}"
    
    if command -v yarn &> /dev/null; then
        yarn test -- --testPathPattern="$pattern" --watchAll=false --silent
    elif command -v npm &> /dev/null; then
        npm test -- --testPathPattern="$pattern" --watchAll=false --silent
    else
        echo "❌ Neither yarn nor npm found. Please install a package manager."
        return 1
    fi
    local exit_code=$?
    print_status $exit_code "$area tests"
    return $exit_code
}

# Main test execution
main() {
    echo "📦 Installing dependencies if needed..."
    if command -v yarn &> /dev/null; then
        yarn install --silent
    elif command -v npm &> /dev/null; then
        npm install --silent
    else
        echo "❌ Neither yarn nor npm found. Please install a package manager."
        return 1
    fi

    echo -e "\n🏃‍♂️ Starting test execution...\n"

    local overall_status=0

    # Start with minimal Jest validation test
    echo -e "\n${YELLOW}🔬 Validating Jest setup...${NC}"
    run_test_area "Jest Setup Validation" "__tests__/minimal.test.js"
    if [ $? -ne 0 ]; then 
        echo -e "${RED}❌ Jest setup is broken. Stopping test execution.${NC}"
        echo -e "${YELLOW}💡 Fix Jest configuration before running other tests${NC}"
        return 1
    fi

    # Test individual areas
    run_test_area "Insights Page (Collapsible Sections)" "__tests__/pages/Insights.test.js"
    if [ $? -ne 0 ]; then overall_status=1; fi

    run_test_area "Dashboard (Business Tasks Integration)" "__tests__/pages/Dashboard.test.js"
    if [ $? -ne 0 ]; then overall_status=1; fi

    run_test_area "Business Tasks Component" "__tests__/components/BusinessTasksList.test.js"
    if [ $? -ne 0 ]; then overall_status=1; fi

    run_test_area "Add Business Task Form" "__tests__/pages/AddBusinessTask.test.js"
    if [ $? -ne 0 ]; then overall_status=1; fi

    run_test_area "Product Roadmap Integration" "__tests__/pages/ProductRoadmap.test.js"
    if [ $? -ne 0 ]; then overall_status=1; fi

    run_test_area "Release Details Integration" "__tests__/pages/ReleaseDetails.test.js"
    if [ $? -ne 0 ]; then overall_status=1; fi

    # Run all tests together for coverage
    echo -e "\n${YELLOW}📊 Running full test suite with coverage...${NC}"
    if command -v yarn &> /dev/null; then
        yarn run test-coverage -- --watchAll=false --silent
    elif command -v npm &> /dev/null; then
        npm run test-coverage -- --watchAll=false --silent
    else
        echo "❌ Neither yarn nor npm found. Please install a package manager."
        return 1
    fi
    local coverage_status=$?
    print_status $coverage_status "Test coverage report"

    # Final summary
    echo -e "\n" 
    echo "============================================"
    if [ $overall_status -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
        echo -e "${GREEN}✨ Business tasks functionality is fully tested${NC}"
        echo -e "${GREEN}🔧 Insights collapsible sections are working${NC}"
        echo -e "${GREEN}📋 Form validation and AI integration tested${NC}"
    else
        echo -e "${RED}⚠️  Some tests failed. Please check the output above.${NC}"
        echo -e "${YELLOW}💡 Common issues to check:${NC}"
        echo -e "   - Missing mock implementations"
        echo -e "   - Component prop mismatches" 
        echo -e "   - Async operation timeouts"
        echo -e "   - Context provider setup"
    fi

    # Additional information
    echo -e "\n${YELLOW}📈 Test Coverage Areas:${NC}"
    echo "   🏗️  Architecture & Design (Insights)"
    echo "   📅  Timelines & Productivity (Insights)"  
    echo "   💰  Budget Management (Insights)"
    echo "   📋  Business Task Management (Dashboard)"
    echo "   🔧  Business Task Forms (Add/Edit)"
    echo "   🗺️  Product Roadmap Integration"
    echo "   🚀  Release Details Integration"
    echo "   🤖  AI Form Helper Integration"

    echo -e "\n${YELLOW}🚀 Next Steps:${NC}"
    echo "   1. Review any failing tests and fix issues"
    echo "   2. Add more specific integration tests as needed"
    echo "   3. Test the application manually to verify functionality"
    echo "   4. Consider adding e2e tests for complete user workflows"

    return $overall_status
}

# Run main function
main "$@"
exit_code=$?

# Show final result
if [ $exit_code -eq 0 ]; then
    echo -e "\n${GREEN}🏆 Test suite completed successfully!${NC}"
else
    echo -e "\n${RED}💥 Test suite completed with failures.${NC}"
fi

exit $exit_code
