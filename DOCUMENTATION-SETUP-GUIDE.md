# 📖 Documentation Management & GitHub Pages Setup Guide

This guide walks you through setting up an automated documentation system for Buildly Product Labs with GitHub Pages hosting.

## 🎯 What You'll Get

- **Automated Documentation Updates**: Scripts that detect code changes and update docs
- **GitHub Pages Site**: Professional documentation website with search and navigation
- **AI Integration**: Chatbot links updated to point to your live documentation
- **Continuous Deployment**: Automatic updates when you push changes

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository:
   - **Name**: `buildly-docs`
   - **Owner**: `buildly-release-management` (or your organization)
   - **Visibility**: Public (required for free GitHub Pages)
   - **Initialize**: Empty repository (no README)

### Step 2: Initialize Documentation System

```bash
cd /path/to/buildly-react-template

# Install documentation dependencies
cd scripts
npm install

# Initialize the documentation repository
npm run docs:init
```

This creates a complete Jekyll site with:
- Professional layout and styling
- Feature pages with navigation
- Search functionality
- Mobile-responsive design
- GitHub Actions deployment

### Step 3: Enable GitHub Pages

1. Go to your `buildly-docs` repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **"GitHub Actions"**
4. Click **Save**

### Step 4: Deploy Documentation

```bash
# Update documentation with current codebase
npm run docs:update

# Deploy to GitHub Pages
npm run docs:deploy
```

Your documentation will be live at: `https://buildly-release-management.github.io/buildly-docs`

## 🔄 Automated Workflow

### When You Add Features

The system automatically detects and documents:

1. **AI Features**: BabbleBeaver integrations, AI suggestions, chatbot enhancements
2. **New Pages**: React components, new UI sections
3. **API Changes**: New endpoints, mutations, queries
4. **UI Components**: Form helpers, modals, interactive elements

### Auto-Update Process

```bash
# Manual update (scans codebase and updates docs)
npm run docs:update

# Watch mode (auto-updates when files change)
npm run docs:watch

# Full deployment (update + build + deploy)
npm run docs:deploy
```

### Git Integration

Add to your main project workflow:

```bash
# Add to package.json scripts
"pre-commit": "cd scripts && npm run docs:update"

# Or use git hooks
echo "cd scripts && npm run docs:update" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 📁 Documentation Structure

Your generated site includes:

```
https://buildly-release-management.github.io/buildly-docs/
├── /                          # Home page with feature overview
├── /getting-started/          # Quick start guides
├── /features/                 # Individual feature documentation
│   ├── /dashboard/           # Dashboard features
│   ├── /product-roadmap/     # Roadmap and AI suggestions
│   ├── /ai-assistant/        # Chatbot documentation
│   └── /team-assistance/     # Team help features
├── /guides/                   # Step-by-step tutorials
├── /api/                      # API reference
└── /search/                   # Documentation search
```

## 🎨 Customization

### Branding

Edit `docs-repo/_config.yml`:

```yaml
title: "Your Company Documentation"
description: "Your custom description"
url: "https://your-org.github.io/your-docs"
```

### Styling

Modify `docs-repo/assets/css/style.css` for custom colors, fonts, and layout.

### Content

- **Features**: Add markdown files to `docs-repo/_features/`
- **Guides**: Add tutorials to `docs-repo/_guides/`
- **API Docs**: Update `docs-repo/api/`

## 🔧 Advanced Configuration

### Custom Domain

1. Add `CNAME` file to repository root:
   ```
   docs.buildly.io
   ```

2. Configure DNS:
   ```
   docs.buildly.io CNAME buildly-release-management.github.io
   ```

### Search Integration

The system includes built-in search. To enhance it:

1. **Algolia**: Add Algolia search configuration
2. **Google**: Enable Google site search
3. **Custom**: Modify search JavaScript

### Analytics

Add Google Analytics to `_config.yml`:

```yaml
google_analytics: UA-XXXXXXXXX-X
```

## 🤖 AI Integration

The chatbot automatically uses your documentation links:

- **Contextual Help**: Links change based on current page
- **Smart Suggestions**: AI generates relevant questions
- **Live Updates**: Links update when you deploy docs

### Chatbot Configuration

The chatbot now points to your documentation:

```javascript
// Updated automatically in Chatbot.js
links: [
  { label: 'Getting Started', url: 'https://buildly-release-management.github.io/buildly-docs/getting-started' },
  { label: 'AI Features', url: 'https://buildly-release-management.github.io/buildly-docs/features/ai-assistant' },
  // ... more links
]
```

## 📊 Monitoring & Maintenance

### Documentation Health

Check documentation status:

```bash
# View update log
cat buildly-documentation.json | jq '.change_log[0]'

# Check feature coverage
npm run docs:update -- --report
```

### Regular Maintenance

**Weekly**:
- Review auto-generated content
- Update any placeholder documentation
- Check for broken links

**Monthly**:
- Review analytics for popular pages
- Update screenshots and examples
- Optimize search performance

**Per Release**:
- Update version numbers
- Add release notes
- Update getting started guides

## 🐛 Troubleshooting

### Common Issues

**"Repository not found"**
- Ensure GitHub repository exists and is public
- Check repository name in `scripts/init-docs-repo.js`

**"GitHub Actions failing"**
- Verify Pages is enabled with "GitHub Actions" source
- Check workflow file in `.github/workflows/`

**"Documentation not updating"**
- Run `npm run docs:update` manually
- Check feature detection patterns in `update-docs.js`

**"Links not working"**
- Verify base URL in `_config.yml`
- Check relative vs absolute URLs

### Debug Mode

```bash
DEBUG=1 npm run docs:update
```

Shows detailed logging of the scanning and update process.

## 📈 Success Metrics

Track your documentation success:

- **Coverage**: Percentage of features documented
- **Usage**: GitHub Pages analytics
- **Freshness**: How recently docs were updated
- **User Feedback**: Issues and suggestions

## 🎓 Best Practices

### Content Writing

1. **Start with Overview**: What the feature does
2. **How-to Steps**: Clear, numbered instructions
3. **Examples**: Screenshots and code samples
4. **Troubleshooting**: Common issues and solutions

### Maintenance

1. **Regular Updates**: Keep docs current with code
2. **User Focus**: Write for your actual users
3. **Visual Elements**: Use screenshots and diagrams
4. **Search Optimization**: Use clear headings and keywords

### Team Workflow

1. **Feature Documentation**: Document new features as you build them
2. **Review Process**: Have team members review docs
3. **User Testing**: Test docs with actual users
4. **Feedback Loop**: Regularly collect and act on feedback

## 🔗 Resources

- **Jekyll Documentation**: [jekyllrb.com](https://jekyllrb.com)
- **GitHub Pages**: [pages.github.com](https://pages.github.com)
- **Markdown Guide**: [markdownguide.org](https://www.markdownguide.org)
- **Documentation Best Practices**: [writethedocs.org](https://www.writethedocs.org)

## 📞 Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Review script logs for error messages
3. Open an issue in the main repository
4. Contact the development team

---

**Your documentation system is now ready!** 

Visit your live documentation at: `https://buildly-release-management.github.io/buildly-docs`

The system will automatically keep your documentation up-to-date as you develop new features.
