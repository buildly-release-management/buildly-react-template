#!/bin/bash

# Pre-Deployment Quick Test Script
# Run this before deploying to catch critical issues

echo "🚀 Starting Pre-Deployment Tests..."
echo "=================================="

# Change to project root directory
cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if Node.js is available
run_test "Node.js availability" "node --version"

# Test 2: Check if npm/yarn is available
if command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
else
    echo -e "${RED}✗ No package manager found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Using $PACKAGE_MANAGER${NC}"

# Test 3: Install dependencies
echo -n "Installing dependencies... "
if $PACKAGE_MANAGER install > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((TESTS_FAILED++))
fi

# Test 4: Check for syntax errors in critical files
echo "Checking syntax in critical files..."

critical_files=(
    "src/utils/productStatus.js"
    "src/pages/Insights/Insights.js"
    "src/components/AIEnhancedProductWizard/AIEnhancedProductWizard.js"
    "src/hooks/useOrganizationMembers.js"
    "src/utils/performanceConfig.js"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        run_test "Syntax check: $file" "node -c $file"
    else
        echo -e "${YELLOW}⚠ File not found: $file${NC}"
    fi
done

# Test 5: Build test
echo -n "Testing production build... "
if timeout 300 $PACKAGE_MANAGER run build > build.log 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Build errors:"
    tail -10 build.log
    ((TESTS_FAILED++))
fi

# Test 6: Check for common error patterns in build
if [ -f "build.log" ]; then
    echo "Checking build log for warnings..."
    
    # Check for critical errors
    if grep -q "Error:" build.log; then
        echo -e "${RED}✗ Build contains errors${NC}"
        grep "Error:" build.log
        ((TESTS_FAILED++))
    else
        echo -e "${GREEN}✓ No critical build errors${NC}"
        ((TESTS_PASSED++))
    fi
    
    # Check for warnings (informational)
    WARNING_COUNT=$(grep -c "Warning:" build.log || echo "0")
    if [ "$WARNING_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNING_COUNT warnings found (review recommended)${NC}"
    fi
fi

# Test 7: Check file sizes
echo "Checking bundle sizes..."
if [ -d "build/static/js" ]; then
    JS_SIZE=$(du -sh build/static/js | cut -f1)
    CSS_SIZE=$(du -sh build/static/css 2>/dev/null | cut -f1 || echo "0K")
    
    echo "JavaScript bundle size: $JS_SIZE"
    echo "CSS bundle size: $CSS_SIZE"
    
    # Basic size check (warn if JS > 5MB)
    JS_SIZE_BYTES=$(du -s build/static/js | cut -f1)
    if [ "$JS_SIZE_BYTES" -gt 5000 ]; then
        echo -e "${YELLOW}⚠ Large bundle size detected${NC}"
    else
        echo -e "${GREEN}✓ Bundle size acceptable${NC}"
        ((TESTS_PASSED++))
    fi
fi

# Test 8: Quick lint check for common issues
echo "Running quick code quality checks..."

# Check for console.log statements (should be removed in production)
CONSOLE_LOGS=$(find src -name "*.js" -exec grep -l "console\.log" {} \; 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠ $CONSOLE_LOGS files contain console.log statements${NC}"
else
    echo -e "${GREEN}✓ No console.log statements found${NC}"
    ((TESTS_PASSED++))
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(find src -name "*.js" -exec grep -c "TODO\|FIXME" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ $TODO_COUNT TODO/FIXME comments found${NC}"
else
    echo -e "${GREEN}✓ No TODO/FIXME comments${NC}"
fi

# Summary
echo ""
echo "=================================="
echo "TEST SUMMARY"
echo "=================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run the application locally: $PACKAGE_MANAGER start"
    echo "2. Test critical user flows manually"
    echo "3. Deploy to staging environment"
    echo "4. Run final smoke tests"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ $TESTS_FAILED test(s) failed. Address issues before deployment.${NC}"
    echo ""
    echo "Recommended actions:"
    echo "1. Review failed tests above"
    echo "2. Fix any syntax or build errors"
    echo "3. Re-run this test script"
    echo "4. Seek help if issues persist"
    echo ""
    exit 1
fi
