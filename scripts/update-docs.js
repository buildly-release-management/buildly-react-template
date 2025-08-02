#!/usr/bin/env node

/**
 * Documentation Update Script
 * 
 * This script automatically updates documentation when features are added or modified.
 * It scans the codebase for changes and updates the documentation files accordingly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Paths (relative to parent directory)
  DOCS_OUTPUT_DIR: './docs-repo',
  MARKDOWN_FILE: '../BUILDLY-USER-DOCUMENTATION.md',
  JSON_FILE: '../buildly-documentation.json',
  
  // GitHub Pages repository (to be created)
  DOCS_REPO_URL: 'https://github.com/buildly-release-management/buildly-docs.git',
  DOCS_REPO_BRANCH: 'main',
  
  // Scan directories for feature detection
  SCAN_DIRECTORIES: [
    '../src/pages',
    '../src/components',
    '../src/react-query'
  ],
  
  // Feature detection patterns
  FEATURE_PATTERNS: {
    ai_features: [
      /generateAI.*Suggestion/g,
      /BabbleBeaver/g,
      /chatbot/gi,
      /AI.*Helper/g
    ],
    new_pages: [
      /export.*default.*function/g,
      /const.*=.*\(\).*=>/g
    ],
    api_endpoints: [
      /useQuery/g,
      /useMutation/g,
      /fetch.*API_URL/g
    ],
    ui_components: [
      /export.*default.*React/g,
      /function.*Component/g
    ]
  }
};

class DocumentationUpdater {
  constructor() {
    this.changeLog = [];
    this.currentDocs = null;
    this.newFeatures = [];
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🚀 Starting documentation update process...');
    
    try {
      // Step 1: Detect changes
      await this.detectChanges();
      
      // Step 2: Analyze new features
      await this.analyzeFeatures();
      
      // Step 3: Update documentation
      await this.updateDocumentation();
      
      // Step 4: Generate deployment files
      await this.generateDeploymentFiles();
      
      // Step 5: Push to docs repository (if configured)
      await this.deployToGitHubPages();
      
      console.log('✅ Documentation update completed successfully!');
      
    } catch (error) {
      console.error('❌ Documentation update failed:', error);
      process.exit(1);
    }
  }

  /**
   * Detect changes in the codebase since last documentation update
   */
  async detectChanges() {
    console.log('🔍 Detecting changes in codebase...');
    
    try {
      // Get git changes since last commit
      const gitDiff = execSync('git diff HEAD~1 --name-only', { encoding: 'utf-8' });
      const changedFiles = gitDiff.split('\n').filter(file => file.trim());
      
      console.log(`📁 Found ${changedFiles.length} changed files`);
      
      // Analyze changed files for documentation-relevant changes
      for (const file of changedFiles) {
        if (this.isRelevantFile(file)) {
          await this.analyzeFileChange(file);
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Could not detect git changes, scanning all files...');
      await this.scanAllFiles();
    }
  }

  /**
   * Check if a file is relevant for documentation
   */
  isRelevantFile(filePath) {
    const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    const relevantPaths = ['src/', 'public/', 'docs/'];
    
    return relevantExtensions.some(ext => filePath.endsWith(ext)) &&
           relevantPaths.some(path => filePath.startsWith(path));
  }

  /**
   * Analyze a specific file for documentation-relevant changes
   */
  async analyzeFileChange(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      
      console.log(`📝 Analyzing ${fileName}...`);
      
      // Check for new features
      for (const [featureType, patterns] of Object.entries(CONFIG.FEATURE_PATTERNS)) {
        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches && matches.length > 0) {
            this.newFeatures.push({
              type: featureType,
              file: filePath,
              matches: matches,
              description: this.generateFeatureDescription(featureType, fileName, matches)
            });
          }
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Could not analyze file ${filePath}:`, error.message);
    }
  }

  /**
   * Scan all relevant files when git diff is not available
   */
  async scanAllFiles() {
    console.log('🔍 Scanning all files for features...');
    
    for (const dir of CONFIG.SCAN_DIRECTORIES) {
      if (fs.existsSync(dir)) {
        await this.scanDirectory(dir);
      }
    }
  }

  /**
   * Recursively scan a directory for relevant files
   */
  async scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (this.isRelevantFile(fullPath)) {
        await this.analyzeFileChange(fullPath);
      }
    }
  }

  /**
   * Generate human-readable description for detected features
   */
  generateFeatureDescription(featureType, fileName, matches) {
    const descriptions = {
      ai_features: `AI functionality detected in ${fileName}`,
      new_pages: `New page component found in ${fileName}`,
      api_endpoints: `API integration detected in ${fileName}`,
      ui_components: `UI component found in ${fileName}`
    };
    
    return descriptions[featureType] || `Feature detected in ${fileName}`;
  }

  /**
   * Analyze detected features and prepare documentation updates
   */
  async analyzeFeatures() {
    console.log('🧠 Analyzing detected features...');
    
    if (this.newFeatures.length === 0) {
      console.log('ℹ️ No new features detected');
      return;
    }
    
    console.log(`📊 Found ${this.newFeatures.length} potential new features:`);
    
    // Group features by type
    const featuresByType = {};
    for (const feature of this.newFeatures) {
      if (!featuresByType[feature.type]) {
        featuresByType[feature.type] = [];
      }
      featuresByType[feature.type].push(feature);
    }
    
    // Log summary
    for (const [type, features] of Object.entries(featuresByType)) {
      console.log(`  - ${type}: ${features.length} instances`);
    }
  }

  /**
   * Update documentation files with new information
   */
  async updateDocumentation() {
    console.log('📚 Updating documentation files...');
    
    // Load current documentation
    this.loadCurrentDocumentation();
    
    // Update change log
    this.updateChangeLog();
    
    // Add new features to documentation
    this.addNewFeaturesToDocs();
    
    // Save updated documentation
    this.saveUpdatedDocumentation();
  }

  /**
   * Load current documentation files
   */
  loadCurrentDocumentation() {
    try {
      if (fs.existsSync(CONFIG.JSON_FILE)) {
        this.currentDocs = JSON.parse(fs.readFileSync(CONFIG.JSON_FILE, 'utf-8'));
      }
    } catch (error) {
      console.warn('⚠️ Could not load current documentation:', error.message);
      this.currentDocs = {};
    }
  }

  /**
   * Update change log with detected changes
   */
  updateChangeLog() {
    // Ensure currentDocs is initialized
    if (!this.currentDocs) {
      this.currentDocs = {};
    }
    
    const timestamp = new Date().toISOString();
    const gitCommitHash = this.getGitCommitHash();
    
    const changeEntry = {
      timestamp,
      commit: gitCommitHash,
      features_detected: this.newFeatures.length,
      changes: this.newFeatures.map(f => ({
        type: f.type,
        file: f.file,
        description: f.description
      }))
    };
    
    if (!this.currentDocs.change_log) {
      this.currentDocs.change_log = [];
    }
    
    this.currentDocs.change_log.unshift(changeEntry);
    
    // Keep only last 50 changes
    this.currentDocs.change_log = this.currentDocs.change_log.slice(0, 50);
  }

  /**
   * Get current git commit hash
   */
  getGitCommitHash() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Add new features to documentation structure
   */
  addNewFeaturesToDocs() {
    if (!this.currentDocs.features) {
      this.currentDocs.features = {};
    }
    
    // Process new features and add placeholders for manual documentation
    for (const feature of this.newFeatures) {
      const featureKey = this.generateFeatureKey(feature);
      
      if (!this.currentDocs.features[featureKey]) {
        this.currentDocs.features[featureKey] = {
          title: this.generateFeatureTitle(feature),
          description: "🚧 Auto-detected feature - Please add documentation",
          detected_at: new Date().toISOString(),
          file_location: feature.file,
          auto_generated: true,
          needs_documentation: true
        };
      }
    }
  }

  /**
   * Generate a unique key for a feature
   */
  generateFeatureKey(feature) {
    const fileName = path.basename(feature.file, path.extname(feature.file));
    return `${feature.type}_${fileName}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }

  /**
   * Generate a human-readable title for a feature
   */
  generateFeatureTitle(feature) {
    const fileName = path.basename(feature.file, path.extname(feature.file));
    return `${fileName} (${feature.type.replace(/_/g, ' ')})`;
  }

  /**
   * Save updated documentation files
   */
  saveUpdatedDocumentation() {
    try {
      // Update last_updated timestamp
      this.currentDocs.last_updated = new Date().toISOString();
      this.currentDocs.version = this.generateVersionNumber();
      
      // Save JSON file
      fs.writeFileSync(
        CONFIG.JSON_FILE, 
        JSON.stringify(this.currentDocs, null, 2),
        'utf-8'
      );
      
      console.log('✅ Documentation files updated');
      
    } catch (error) {
      console.error('❌ Failed to save documentation:', error);
      throw error;
    }
  }

  /**
   * Generate version number for documentation
   */
  generateVersionNumber() {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
  }

  /**
   * Generate files for GitHub Pages deployment
   */
  async generateDeploymentFiles() {
    console.log('📦 Generating deployment files...');
    
    // Create output directory
    if (!fs.existsSync(CONFIG.DOCS_OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.DOCS_OUTPUT_DIR, { recursive: true });
    }
    
    // Generate index.html
    await this.generateIndexHTML();
    
    // Generate Jekyll config
    await this.generateJekyllConfig();
    
    // Copy documentation files
    this.copyDocumentationFiles();
    
    // Generate navigation structure
    await this.generateNavigation();
  }

  /**
   * Generate index.html for GitHub Pages
   */
  async generateIndexHTML() {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buildly Product Labs Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css" rel="stylesheet">
    <style>
        .feature-card { transition: transform 0.2s; }
        .feature-card:hover { transform: translateY(-2px); }
        .ai-feature { border-left: 4px solid #28a745; }
        .new-feature { border-left: 4px solid #007bff; }
        .updated-feature { border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#">
                <strong>Buildly Product Labs</strong> Documentation
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="#getting-started">Getting Started</a>
                <a class="nav-link" href="#features">Features</a>
                <a class="nav-link" href="#api">API</a>
                <a class="nav-link" href="https://github.com/buildlyio/buildly-react-template">GitHub</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="row">
            <div class="col-lg-8">
                <h1>Welcome to Buildly Product Labs</h1>
                <p class="lead">Comprehensive documentation for the AI-powered product management platform</p>
                
                <div class="alert alert-info">
                    <strong>Last Updated:</strong> ${new Date().toLocaleDateString()}<br>
                    <strong>Version:</strong> ${this.currentDocs.version || '1.0.0'}
                </div>

                <h2 id="getting-started">Getting Started</h2>
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Quick Start Guide</h5>
                        <p class="card-text">Get up and running with Buildly Product Labs in minutes.</p>
                        <a href="#" class="btn btn-primary">View Guide</a>
                    </div>
                </div>

                <h2 id="features">Features</h2>
                <div class="row" id="features-container">
                    <!-- Features will be loaded dynamically -->
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Quick Navigation</h5>
                    </div>
                    <div class="list-group list-group-flush">
                        <a href="#dashboard" class="list-group-item">Dashboard</a>
                        <a href="#product-portfolio" class="list-group-item">Product Portfolio</a>
                        <a href="#product-roadmap" class="list-group-item">Product Roadmap</a>
                        <a href="#releases" class="list-group-item">Release Management</a>
                        <a href="#insights" class="list-group-item">Insights & Analytics</a>
                        <a href="#ai-assistant" class="list-group-item">AI Assistant</a>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h5>Recent Updates</h5>
                    </div>
                    <div class="card-body" id="recent-updates">
                        <!-- Recent updates will be loaded dynamically -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-core.min.js"></script>
    <script>
        // Load documentation data and populate the page
        fetch('./buildly-documentation.json')
            .then(response => response.json())
            .then(data => {
                populateFeatures(data.features);
                populateRecentUpdates(data.change_log);
            })
            .catch(error => console.error('Error loading documentation:', error));

        function populateFeatures(features) {
            const container = document.getElementById('features-container');
            
            Object.entries(features).forEach(([key, feature]) => {
                const featureCard = document.createElement('div');
                featureCard.className = 'col-md-6 mb-3';
                
                const cardClass = feature.auto_generated ? 'new-feature' : 'feature-card';
                
                featureCard.innerHTML = \`
                    <div class="card h-100 \${cardClass}">
                        <div class="card-body">
                            <h5 class="card-title">\${feature.title}</h5>
                            <p class="card-text">\${feature.description}</p>
                            \${feature.needs_documentation ? 
                                '<span class="badge bg-warning">Needs Documentation</span>' : 
                                '<span class="badge bg-success">Documented</span>'
                            }
                        </div>
                    </div>
                \`;
                
                container.appendChild(featureCard);
            });
        }

        function populateRecentUpdates(changeLog) {
            const container = document.getElementById('recent-updates');
            
            if (!changeLog || changeLog.length === 0) {
                container.innerHTML = '<p class="text-muted">No recent updates</p>';
                return;
            }
            
            const recentChanges = changeLog.slice(0, 5);
            
            recentChanges.forEach(change => {
                const updateItem = document.createElement('div');
                updateItem.className = 'mb-2';
                
                const date = new Date(change.timestamp).toLocaleDateString();
                
                updateItem.innerHTML = \`
                    <small class="text-muted">\${date}</small><br>
                    <strong>\${change.features_detected} features detected</strong><br>
                    <small>Commit: \${change.commit}</small>
                \`;
                
                container.appendChild(updateItem);
            });
        }
    </script>
</body>
</html>`;

    fs.writeFileSync(
      path.join(CONFIG.DOCS_OUTPUT_DIR, 'index.html'),
      htmlContent,
      'utf-8'
    );
  }

  /**
   * Generate Jekyll configuration for GitHub Pages
   */
  async generateJekyllConfig() {
    const jekyllConfig = `# GitHub Pages Jekyll Configuration
title: "Buildly Product Labs Documentation"
description: "Comprehensive documentation for the AI-powered product management platform"
baseurl: ""
url: "https://buildly-release-management.github.io/buildly-docs"

# Theme
theme: minima

# Plugins
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag

# Markdown
markdown: kramdown
highlighter: rouge

# Collections
collections:
  features:
    output: true
    permalink: /:collection/:name/
  guides:
    output: true
    permalink: /:collection/:name/

# Defaults
defaults:
  - scope:
      path: ""
      type: "features"
    values:
      layout: "feature"
  - scope:
      path: ""
      type: "guides"
    values:
      layout: "guide"

# Exclude files
exclude:
  - node_modules/
  - package*.json
  - README.md
`;

    fs.writeFileSync(
      path.join(CONFIG.DOCS_OUTPUT_DIR, '_config.yml'),
      jekyllConfig,
      'utf-8'
    );
  }

  /**
   * Copy documentation files to output directory
   */
  copyDocumentationFiles() {
    // Copy JSON file
    if (fs.existsSync(CONFIG.JSON_FILE)) {
      fs.copyFileSync(
        CONFIG.JSON_FILE,
        path.join(CONFIG.DOCS_OUTPUT_DIR, 'buildly-documentation.json')
      );
    }
    
    // Copy Markdown file
    if (fs.existsSync(CONFIG.MARKDOWN_FILE)) {
      fs.copyFileSync(
        CONFIG.MARKDOWN_FILE,
        path.join(CONFIG.DOCS_OUTPUT_DIR, 'README.md')
      );
    }
  }

  /**
   * Generate navigation structure for Jekyll
   */
  async generateNavigation() {
    const navigation = {
      main: [
        { title: "Getting Started", url: "/getting-started/" },
        { title: "Features", url: "/features/" },
        { title: "API Reference", url: "/api/" },
        { title: "Guides", url: "/guides/" }
      ],
      features: Object.entries(this.currentDocs.features || {}).map(([key, feature]) => ({
        title: feature.title,
        url: `/features/${key}/`,
        description: feature.description
      }))
    };

    fs.writeFileSync(
      path.join(CONFIG.DOCS_OUTPUT_DIR, '_data', 'navigation.yml'),
      JSON.stringify(navigation, null, 2),
      'utf-8'
    );
  }

  /**
   * Deploy to GitHub Pages (if repository is configured)
   */
  async deployToGitHubPages() {
    console.log('🚀 Deploying to GitHub Pages...');
    
    try {
      // Check if docs repository exists
      const docsRepoPath = './docs-repo';
      
      if (!fs.existsSync(docsRepoPath)) {
        console.log('📥 Cloning documentation repository...');
        execSync(`git clone ${CONFIG.DOCS_REPO_URL} ${docsRepoPath}`);
      } else {
        console.log('📤 Updating documentation repository...');
        execSync('git pull origin main', { cwd: docsRepoPath });
      }
      
      // Copy generated files to docs repository
      execSync(`cp -r ${CONFIG.DOCS_OUTPUT_DIR}/* ${docsRepoPath}/`);
      
      // Commit and push changes
      const commitMessage = `Update documentation - ${new Date().toISOString()}`;
      
      execSync('git add .', { cwd: docsRepoPath });
      execSync(`git commit -m "${commitMessage}"`, { cwd: docsRepoPath });
      execSync(`git push origin ${CONFIG.DOCS_REPO_BRANCH}`, { cwd: docsRepoPath });
      
      console.log('✅ Documentation deployed to GitHub Pages');
      console.log(`🌐 Available at: https://buildly-release-management.github.io/buildly-docs`);
      
    } catch (error) {
      console.warn('⚠️ Could not deploy to GitHub Pages:', error.message);
      console.log('💡 Make sure the documentation repository exists and you have push access');
    }
  }
}

// CLI interface
if (require.main === module) {
  const updater = new DocumentationUpdater();
  updater.run().catch(error => {
    console.error('Failed to update documentation:', error);
    process.exit(1);
  });
}

module.exports = DocumentationUpdater;
