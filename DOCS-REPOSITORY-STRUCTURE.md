# Documentation Repository Structure

This document explains how the documentation system is organized across repositories.

## Repository Overview

### Main Repository: `buildly-react-template`
**Purpose**: Source code and documentation source files
**Location**: `/Users/greglind/Projects/buildly/labs/buildly-react-template`

**Contains**:
- ✅ `BUILDLY-USER-DOCUMENTATION.md` - Source documentation (Markdown)
- ✅ `buildly-documentation.json` - Structured documentation data
- ✅ `DOCUMENTATION-SETUP-GUIDE.md` - Setup instructions
- ✅ `scripts/` - Documentation automation tools
  - `update-docs.js` - Auto-update script
  - `init-docs-repo.js` - Repository initialization
  - `package.json` - Dependencies for scripts
  - `README.md` - Script documentation
- ✅ `.gitignore` - Excludes `scripts/docs-repo/`

### Documentation Site Repository: `buildly-docs`
**Purpose**: GitHub Pages hosting for live documentation
**Location**: `scripts/docs-repo/` (local) → `buildly-release-management/buildly-docs` (GitHub)

**Contains**:
- Jekyll site structure (`_layouts/`, `_includes/`, etc.)
- Generated HTML pages
- GitHub Actions workflows
- CNAME file for custom domain
- Live site content

## Workflow

### 1. Development
- Edit code in main repository
- Documentation scripts automatically detect changes
- Source documentation files updated in main repo

### 2. Documentation Updates
```bash
cd scripts
npm run docs:update  # Updates content from codebase
```

### 3. Deployment
```bash
npm run docs:deploy  # Pushes to GitHub Pages repository
```

## Key Separation Points

| Item | Main Repo | Docs Repo | Why |
|------|-----------|-----------|-----|
| Source Documentation | ✅ | ❌ | Version controlled with code |
| Documentation Scripts | ✅ | ❌ | Part of development workflow |
| Jekyll Site Files | ❌ | ✅ | Deployment-specific |
| Generated HTML | ❌ | ✅ | Build artifacts |
| GitHub Actions | ❌ | ✅ | Deployment-specific |
| Custom Domain Config | ❌ | ✅ | Hosting-specific |

## Benefits of This Structure

1. **Clean Separation**: Source vs. deployment concerns
2. **Version Control**: Documentation changes tracked with code
3. **Automated Sync**: Scripts keep docs in sync with codebase
4. **Independent Deployment**: Docs site can be updated without affecting main app
5. **Professional Hosting**: Custom domain with GitHub Pages

## Commands Summary

```bash
# From main repository root
cd scripts

# Initialize documentation repository (one-time setup)
npm run docs:init

# Update documentation with latest code changes
npm run docs:update

# Deploy to GitHub Pages
npm run docs:deploy

# Development workflow
npm run docs:dev  # Watch for changes and auto-update
```

## Git Workflow

### Main Repository
```bash
# Normal development
git add src/
git commit -m "Add new feature"
git push origin master

# Documentation is automatically updated by scripts
```

### Documentation Repository
```bash
# Handled automatically by scripts, but manual operations:
cd scripts/docs-repo
git status        # Check deployment status
git log --oneline # See deployment history
```

## Troubleshooting

- **Docs out of sync**: Run `npm run docs:update`
- **Site not deploying**: Check GitHub Actions in docs repository
- **Custom domain issues**: Verify DNS settings and CNAME file
- **Build errors**: Check Jekyll workflow logs in GitHub Actions

This structure ensures clean separation of concerns while maintaining automated synchronization between your codebase and documentation site.
