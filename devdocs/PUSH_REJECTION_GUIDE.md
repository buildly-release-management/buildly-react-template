# Push Rejection Troubleshooting Guide

## Why Was My Push Rejected?

If you received a "remote rejected" error when pushing to this repository, it's likely due to **quality gate enforcement**. This repository requires all code to pass validation before being accepted.

## Common Error Messages

### "fatal error in commit_refs" or "remote rejected"
This indicates the remote repository rejected your push due to failed quality checks.

### "pre-push hook failed"
Your local git hook detected issues before pushing.

## Resolution Steps

### 1. Run Pre-Push Validation
```bash
./scripts/pre-push-check.sh
```

This will show you exactly what's failing:
- ❌ Linting errors
- ❌ Test failures  
- ❌ Build issues
- ⚠️ Documentation requirements

### 2. Fix Common Issues

**Linting Errors:**
```bash
# See linting errors
yarn run lint
# or
npm run lint

# Auto-fix linting issues
yarn run lint --fix
# or
npm run lint -- --fix
```

**Test Failures:**
```bash
# Run tests to see failures
yarn run test
# or
npm run test

# Run tests with coverage
yarn run test-coverage
```

**Build Issues:**
```bash
# Test the build
yarn run build
# or
npm run build
```

### 3. Verify Environment Setup

**Check Node.js Version:**
```bash
node --version  # Should be v16.13.0+
```

**Install Dependencies:**
```bash
yarn install
# or
npm install
```

**Environment Variables:**
```bash
# Ensure .env.development.local exists
ls -la .env.development.local

# If missing, run:
./scripts/start-dev.sh
```

### 4. Manual Testing Workflow

```bash
# 1. Install dependencies
yarn install

# 2. Run linting
yarn run lint --fix

# 3. Run tests
yarn run test --watchAll=false

# 4. Test build
yarn run build

# 5. Run full validation
./scripts/test-deployment.sh

# 6. Try pushing again
git push origin master
```

### 5. Conventional Commit Messages

Ensure your commit messages follow the conventional format:

**Good Examples:**
- `feat: add new user authentication system`
- `fix: resolve login redirect issue`
- `docs: update installation instructions`
- `chore: update dependencies to latest versions`

**Bad Examples:**
- `update stuff`
- `fixes`
- `changes made`

### 6. Bypass Quality Gates (NOT RECOMMENDED)

If you absolutely must push without validation:
```bash
git push --no-verify origin master
```

**⚠️ WARNING:** This bypasses all safety checks and may introduce broken code.

## Quality Gate Requirements

This repository enforces:

1. **Zero Linting Warnings**: Code must follow style guidelines
2. **All Tests Pass**: No failing unit or integration tests  
3. **Successful Build**: Code must compile without errors
4. **Conventional Commits**: Commit messages must follow standard format
5. **Documentation**: Significant changes should be documented in `devdocs/`

## Getting Help

If you're still having issues:

1. **Check the full error output** from `./scripts/pre-push-check.sh`
2. **Review the build logs** when running `yarn run build`
3. **Ensure your development environment** matches the requirements
4. **Update your commit message** to follow conventional format
5. **Document your changes** in the appropriate `devdocs/` folder

## Development Workflow

For the smoothest experience:

```bash
# 1. Start development
./scripts/start-dev.sh

# 2. Make your changes
# ... code changes ...

# 3. Test before committing
./scripts/pre-push-check.sh

# 4. Commit with conventional message
git commit -m "feat: add amazing new feature"

# 5. Push (will auto-validate)
git push origin master
```

This ensures you catch issues early and avoid push rejections.
