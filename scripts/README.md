# 📚 Documentation Management System

This directory contains scripts and tools for automatically managing and updating the Buildly Product Labs documentation.

## 🎯 Overview

The documentation management system automatically:
- **Detects** new features and changes in the codebase
- **Analyzes** code for documentation-relevant updates
- **Updates** documentation files with new information
- **Deploys** changes to GitHub Pages automatically

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Initialize Documentation Repository

```bash
npm run docs:init
```

This creates a new GitHub Pages repository with Jekyll setup.

### 3. Update Documentation

```bash
npm run docs:update
```

Scans the codebase and updates documentation files.

### 4. Deploy to GitHub Pages

```bash
npm run docs:deploy
```

Builds and deploys the documentation site.

## 📁 Files

### Core Scripts

- **`update-docs.js`** - Main documentation update script
- **`init-docs-repo.js`** - GitHub Pages repository initializer
- **`package.json`** - Dependencies and scripts configuration

### Generated Files

- **`docs-output/`** - Generated static site files
- **`docs-repo/`** - Cloned documentation repository

## 🔧 Available Commands

```bash
# Update documentation (scan for changes and update files)
npm run docs:update

# Watch for changes and auto-update
npm run docs:watch

# Build static site
npm run docs:build

# Deploy to GitHub Pages
npm run docs:deploy

# Serve documentation locally
npm run docs:serve

# Development mode (watch + serve)
npm run docs:dev

# Initialize new docs repository
npm run docs:init
```

## 🤖 Automatic Updates

### Git Hooks Integration

Add to your main project's `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "cd scripts && npm run docs:update"
  }
}
```

### Continuous Integration

The system can be integrated with GitHub Actions:

```yaml
name: Update Documentation
on:
  push:
    branches: [main]
jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Update Documentation
        run: |
          cd scripts
          npm install
          npm run docs:update
          npm run docs:deploy
```

## 📊 Feature Detection

The system automatically detects:

### AI Features
- `generateAI.*Suggestion` patterns
- `BabbleBeaver` integrations
- `chatbot` implementations
- `AI.*Helper` components

### New Pages/Components
- React component exports
- New page components
- API endpoint definitions
- UI component patterns

### Configuration

Edit `update-docs.js` to customize:

```javascript
const CONFIG = {
  // Scan directories
  SCAN_DIRECTORIES: [
    './src/pages',
    './src/components',
    './src/react-query'
  ],
  
  // Feature detection patterns
  FEATURE_PATTERNS: {
    ai_features: [
      /generateAI.*Suggestion/g,
      /BabbleBeaver/g,
      // Add custom patterns
    ]
  }
};
```

## 🌐 GitHub Pages Setup

### Repository Structure

The generated documentation repository includes:

```
buildly-docs/
├── _config.yml          # Jekyll configuration
├── _layouts/            # Page templates
├── _includes/           # Reusable components
├── _features/           # Feature documentation
├── _guides/             # User guides
├── assets/             # CSS, JS, images
├── api/                # API documentation
└── index.md            # Home page
```

### Deployment

1. **Create GitHub Repository**: `buildly-release-management/buildly-docs`
2. **Enable GitHub Pages**: Settings → Pages → Source: GitHub Actions
3. **Run Initialization**: `npm run docs:init`
4. **Deploy**: `npm run docs:deploy`

### Custom Domain (Optional)

Add `CNAME` file to repository root:

```
docs.buildly.io
```

## 🔄 Workflow Integration

### Development Workflow

```bash
# Make code changes
git add .
git commit -m "Add new AI feature"

# Documentation is automatically updated via pre-commit hook
# Or manually update:
cd scripts && npm run docs:update

# Deploy documentation
npm run docs:deploy
```

### Release Workflow

```bash
# Before release
npm run docs:update
npm run docs:build

# Verify documentation
npm run docs:serve
# Visit http://localhost:8080

# Deploy to production
npm run docs:deploy
```

## 📈 Analytics & Monitoring

### Documentation Health

The system tracks:
- **Feature coverage**: What percentage of features are documented
- **Update frequency**: How often documentation is updated
- **Change detection**: What changes trigger documentation updates

### Metrics

View metrics in the generated `buildly-documentation.json`:

```json
{
  "last_updated": "2024-01-15T10:30:00Z",
  "version": "2024.1.15",
  "change_log": [...],
  "features": {...}
}
```

## 🛠️ Customization

### Adding New Feature Types

```javascript
// In update-docs.js
FEATURE_PATTERNS: {
  my_custom_feature: [
    /customPattern/g,
    /anotherPattern/g
  ]
}
```

### Custom Templates

Edit files in `docs-repo/_layouts/` and `docs-repo/_includes/` to customize the appearance and structure of your documentation site.

### Styling

Modify `docs-repo/assets/css/style.css` to customize the visual appearance.

## 🐛 Troubleshooting

### Common Issues

**Documentation not updating:**
- Check git repository access
- Verify patterns in `FEATURE_PATTERNS`
- Run with debug: `DEBUG=1 npm run docs:update`

**GitHub Pages not deploying:**
- Check repository permissions
- Verify GitHub Actions are enabled
- Check `_config.yml` configuration

**Local development issues:**
- Ensure Ruby and Jekyll are installed
- Run `bundle install` in docs repository
- Check port 4000 availability

### Debug Mode

```bash
DEBUG=1 npm run docs:update
```

Shows detailed logging of the update process.

## 📞 Support

For issues with the documentation system:

1. Check the troubleshooting section above
2. Review the script logs for error messages
3. Open an issue in the main repository
4. Contact the development team

## 📄 License

This documentation management system is part of the Buildly Product Labs project and follows the same license terms.

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
