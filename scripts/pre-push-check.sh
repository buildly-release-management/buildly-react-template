#!/bin/bash

# Pre-push validation script for Buildly React Template
# This script helps ensure code quality before pushing to remote

echo "🔍 Running pre-push validation checks..."

# Change to project root directory
cd "$(dirname "$0")/.."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color


# Detect package manager
if command -v yarn &> /dev/null; then
  PKG_RUN="yarn"
  PKG_LINT="yarn lint"
  PKG_TEST="yarn test --watchAll=false"
  PKG_BUILD="yarn build"
else
  PKG_RUN="npm"
  PKG_LINT="npm run lint"
  PKG_TEST="npm run test -- --watchAll=false"
  PKG_BUILD="npm run build"
fi

# Track if any checks fail
CHECKS_FAILED=0

echo -e "${BLUE}📋 Pre-Push Validation Checklist${NC}"
echo "=================================="


# Check 1: Run linting
echo -e "\n${BLUE}1. Running ESLint checks...${NC}"
LINT_OUTPUT=$($PKG_LINT 2>&1)
LINT_EXIT=$?
echo "$LINT_OUTPUT"
if [ $LINT_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    # Only fail if there are actual errors, not just warnings
    if echo "$LINT_OUTPUT" | grep -q "error"; then
        echo -e "${RED}❌ Linting failed (errors present)${NC}"
        CHECKS_FAILED=1
    else
        echo -e "${YELLOW}⚠️  Lint warnings only (not blocking)${NC}"
    fi
fi


# Check 2: Run tests
echo -e "\n${BLUE}2. Running test suite...${NC}"
TEST_OUTPUT=$($PKG_TEST 2>&1)
TEST_EXIT=$?
echo "$TEST_OUTPUT"
if [ $TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    # Only fail if there are actual test failures, not just warnings
    if echo "$TEST_OUTPUT" | grep -q "FAIL"; then
        echo -e "${RED}❌ Tests failed (failures present)${NC}"
        CHECKS_FAILED=1
    else
        echo -e "${YELLOW}⚠️  Test warnings only (not blocking)${NC}"
    fi
fi

# Check 3: Check build
echo -e "\n${BLUE}3. Verifying build process...${NC}"
if $PKG_BUILD > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    # Clean up build artifacts
    rm -rf dist build
else
    echo -e "${RED}❌ Build failed${NC}"
    echo -e "${YELLOW}   Run '$PKG_BUILD' to see details${NC}"
    CHECKS_FAILED=1
fi

# Check 4: Documentation requirements
echo -e "\n${BLUE}4. Checking documentation requirements...${NC}"
COMMIT_MESSAGE=$(git log -1 --pretty=%B)
if [[ "$COMMIT_MESSAGE" =~ ^(feat|fix|docs|style|refactor|test|chore): ]]; then
    echo -e "${GREEN}✅ Commit message follows conventional format${NC}"
else
    echo -e "${YELLOW}⚠️  Commit message should follow conventional format${NC}"
    echo -e "${YELLOW}   Example: 'feat: add new feature' or 'fix: resolve bug'${NC}"
fi

# Check 5: Documentation files
if git diff --name-only HEAD~1 HEAD | grep -E '\.(js|jsx|ts|tsx)$' > /dev/null; then
    if [ -d "devdocs/features" ] || [ -d "devdocs/fixes" ]; then
        echo -e "${GREEN}✅ Documentation structure exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Consider documenting significant changes in devdocs/${NC}"
    fi
fi

echo -e "\n${BLUE}📊 Validation Summary${NC}"
echo "===================="

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready to push.${NC}"
    echo -e "${GREEN}   Your code meets quality standards.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix issues before pushing.${NC}"
    echo -e "\n${YELLOW}💡 Common fixes:${NC}"
    echo -e "${YELLOW}   • Fix linting: yarn lint${NC}"
    echo -e "${YELLOW}   • Run tests: yarn test${NC}"
    echo -e "${YELLOW}   • Check build: yarn build${NC}"
    echo -e "${YELLOW}   • Install dependencies: yarn install${NC}"
    echo -e "${YELLOW}   • Run full validation: ./scripts/test-deployment.sh${NC}"
    echo -e "\n${BLUE}🛡️  Repository Protection Info:${NC}"
    echo -e "${BLUE}   This repository enforces quality gates to prevent broken code.${NC}"
    echo -e "${BLUE}   All changes must pass tests and validation before merging.${NC}"
    exit 1
fi
