#!/usr/bin/env node

/**
 * GitHub Pages Documentation Repository Initializer
 * 
 * This script creates and sets up the GitHub Pages repository for documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  REPO_NAME: 'buildly-docs',
  REPO_DESCRIPTION: 'Documentation for Buildly Product Labs - AI-powered product management platform',
  GITHUB_ORG: 'buildly-release-management',
  DOCS_REPO_PATH: './docs-repo'
};

class DocsRepoInitializer {
  constructor() {
    this.repoUrl = `https://github.com/${CONFIG.GITHUB_ORG}/${CONFIG.REPO_NAME}.git`;
    this.repoPath = CONFIG.DOCS_REPO_PATH;
  }

  async run() {
    console.log('🚀 Initializing documentation repository...');
    
    try {
      await this.createLocalRepo();
      await this.setupGitHubPagesStructure();
      await this.createInitialContent();
      await this.setupGitHubActions();
      await this.commitAndPush();
      
      console.log('✅ Documentation repository initialized successfully!');
      console.log(`📁 Repository: https://github.com/${CONFIG.GITHUB_ORG}/${CONFIG.REPO_NAME}`);
      console.log(`🌐 GitHub Pages: https://${CONFIG.GITHUB_ORG}.github.io/${CONFIG.REPO_NAME}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize documentation repository:', error);
      process.exit(1);
    }
  }

  async createLocalRepo() {
    console.log('📁 Creating local repository structure...');
    
    // Create repo directory
    if (fs.existsSync(this.repoPath)) {
      console.log('Repository directory already exists, cleaning up...');
      execSync(`rm -rf ${this.repoPath}`);
    }
    
    fs.mkdirSync(this.repoPath, { recursive: true });
    
    // Initialize git repo
    execSync('git init', { cwd: this.repoPath });
    execSync('git branch -M main', { cwd: this.repoPath });
    
    // Set remote origin (you'll need to create the GitHub repo manually first)
    try {
      execSync(`git remote add origin ${this.repoUrl}`, { cwd: this.repoPath });
    } catch (error) {
      console.warn('⚠️ Could not add remote origin - make sure the GitHub repository exists');
    }
  }

  async setupGitHubPagesStructure() {
    console.log('📚 Setting up GitHub Pages structure...');
    
    // Create directory structure
    const directories = [
      '_layouts',
      '_includes',
      '_sass',
      '_data',
      'assets',
      'assets/css',
      'assets/js',
      'assets/images',
      '_features',
      '_guides',
      'api'
    ];
    
    for (const dir of directories) {
      fs.mkdirSync(path.join(this.repoPath, dir), { recursive: true });
    }
  }

  async createInitialContent() {
    console.log('📝 Creating initial content...');
    
    // _config.yml
    this.createJekyllConfig();
    
    // Default layout
    this.createDefaultLayout();
    
    // Feature layout
    this.createFeatureLayout();
    
    // Navigation include
    this.createNavigationInclude();
    
    // Main stylesheet
    this.createStylesheet();
    
    // JavaScript for interactive features
    this.createJavaScript();
    
    // Index page
    this.createIndexPage();
    
    // README
    this.createReadme();
    
    // 404 page
    this.create404Page();
    
    // Sample feature page
    this.createSampleFeature();
  }

  createJekyllConfig() {
    const config = `# Buildly Product Labs Documentation
title: "Buildly Product Labs Documentation"
description: "Comprehensive documentation for the AI-powered product management platform"
baseurl: "/${CONFIG.REPO_NAME}"
url: "https://${CONFIG.GITHUB_ORG}.github.io"

# Build settings
markdown: kramdown
highlighter: rouge
theme: minima

# Plugins
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag
  - jekyll-toc

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

# Navigation
header_pages:
  - getting-started.md
  - features/index.md
  - guides/index.md
  - api/index.md

# Exclude from processing
exclude:
  - vendor/
  - Gemfile
  - Gemfile.lock
  - node_modules/
  - package*.json
  - scripts/

# SEO
author: Buildly Team
twitter:
  username: buildlyio
social:
  name: Buildly
  links:
    - https://twitter.com/buildlyio
    - https://github.com/buildlyio

# Google Analytics (add your tracking ID)
# google_analytics: UA-XXXXXXXXX-X
`;

    fs.writeFileSync(path.join(this.repoPath, '_config.yml'), config);
  }

  createDefaultLayout() {
    const layout = `<!DOCTYPE html>
<html lang="{{ site.lang | default: "en-US" }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <title>{% if page.title %}{{ page.title }} | {{ site.title }}{% else %}{{ site.title }}{% endif %}</title>
    <meta name="description" content="{{ page.description | default: site.description }}">
    
    <link rel="stylesheet" href="{{ "/assets/css/style.css" | relative_url }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <link rel="icon" type="image/x-icon" href="{{ "/assets/images/favicon.ico" | relative_url }}">
    
    {% seo %}
</head>
<body>
    {% include navigation.html %}
    
    <main class="container-fluid">
        <div class="row">
            {% if page.layout != 'home' %}
            <nav class="col-md-3 col-lg-2 d-md-block sidebar">
                <div class="position-sticky pt-3">
                    {% include sidebar.html %}
                </div>
            </nav>
            {% endif %}
            
            <div class="{% if page.layout == 'home' %}col-12{% else %}col-md-9 ms-sm-auto col-lg-10{% endif %} px-md-4">
                {{ content }}
            </div>
        </div>
    </main>
    
    <footer class="footer mt-auto py-3 bg-light">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <span class="text-muted">© {{ "now" | date: "%Y" }} Buildly. All rights reserved.</span>
                </div>
                <div class="col-md-6 text-end">
                    <a href="https://github.com/buildlyio" class="text-muted me-3">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                    <a href="https://buildly.io" class="text-muted">
                        <i class="fas fa-globe"></i> Website
                    </a>
                </div>
            </div>
        </div>
    </footer>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ "/assets/js/main.js" | relative_url }}"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(this.repoPath, '_layouts', 'default.html'), layout);
  }

  createFeatureLayout() {
    const layout = `---
layout: default
---

<div class="feature-page">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ "/" | relative_url }}">Home</a></li>
            <li class="breadcrumb-item"><a href="{{ "/features/" | relative_url }}">Features</a></li>
            <li class="breadcrumb-item active" aria-current="page">{{ page.title }}</li>
        </ol>
    </nav>
    
    <div class="row">
        <div class="col-lg-9">
            <header class="feature-header mb-4">
                <h1 class="display-4">{{ page.title }}</h1>
                {% if page.description %}
                <p class="lead">{{ page.description }}</p>
                {% endif %}
                
                <div class="feature-meta">
                    {% if page.category %}
                    <span class="badge bg-primary me-2">{{ page.category }}</span>
                    {% endif %}
                    {% if page.version %}
                    <span class="badge bg-secondary me-2">v{{ page.version }}</span>
                    {% endif %}
                    {% if page.ai_powered %}
                    <span class="badge bg-success me-2"><i class="fas fa-robot"></i> AI Powered</span>
                    {% endif %}
                </div>
            </header>
            
            <div class="feature-content">
                {{ content }}
            </div>
            
            {% if page.screenshots %}
            <section class="screenshots mt-5">
                <h3>Screenshots</h3>
                <div class="row">
                    {% for screenshot in page.screenshots %}
                    <div class="col-md-6 mb-3">
                        <img src="{{ screenshot.url | relative_url }}" 
                             alt="{{ screenshot.alt }}" 
                             class="img-fluid rounded shadow">
                        {% if screenshot.caption %}
                        <p class="text-muted mt-2">{{ screenshot.caption }}</p>
                        {% endif %}
                    </div>
                    {% endfor %}
                </div>
            </section>
            {% endif %}
            
            {% if page.related_features %}
            <section class="related-features mt-5">
                <h3>Related Features</h3>
                <div class="row">
                    {% for feature in page.related_features %}
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">{{ feature.title }}</h5>
                                <p class="card-text">{{ feature.description }}</p>
                                <a href="{{ feature.url | relative_url }}" class="btn btn-outline-primary btn-sm">Learn More</a>
                            </div>
                        </div>
                    </div>
                    {% endfor %}
                </div>
            </section>
            {% endif %}
        </div>
        
        <div class="col-lg-3">
            <div class="sticky-top">
                <div class="card">
                    <div class="card-header">
                        <h6 class="card-title mb-0">On This Page</h6>
                    </div>
                    <div class="card-body">
                        <div id="toc"></div>
                    </div>
                </div>
                
                {% if page.documentation_links %}
                <div class="card mt-3">
                    <div class="card-header">
                        <h6 class="card-title mb-0">Documentation</h6>
                    </div>
                    <div class="list-group list-group-flush">
                        {% for link in page.documentation_links %}
                        <a href="{{ link.url }}" class="list-group-item list-group-item-action">
                            <i class="fas fa-external-link-alt me-2"></i>{{ link.title }}
                        </a>
                        {% endfor %}
                    </div>
                </div>
                {% endif %}
            </div>
        </div>
    </div>
</div>`;

    fs.writeFileSync(path.join(this.repoPath, '_layouts', 'feature.html'), layout);
  }

  createNavigationInclude() {
    const navigation = `<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
        <a class="navbar-brand" href="{{ "/" | relative_url }}">
            <strong>Buildly</strong> Docs
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link {% if page.url == '/' %}active{% endif %}" href="{{ "/" | relative_url }}">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if page.url contains '/getting-started' %}active{% endif %}" href="{{ "/getting-started/" | relative_url }}">Getting Started</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle {% if page.url contains '/features' %}active{% endif %}" href="#" id="featuresDropdown" role="button" data-bs-toggle="dropdown">
                        Features
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="{{ "/features/" | relative_url }}">All Features</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="{{ "/features/dashboard/" | relative_url }}">Dashboard</a></li>
                        <li><a class="dropdown-item" href="{{ "/features/product-roadmap/" | relative_url }}">Product Roadmap</a></li>
                        <li><a class="dropdown-item" href="{{ "/features/ai-assistant/" | relative_url }}">AI Assistant</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if page.url contains '/guides' %}active{% endif %}" href="{{ "/guides/" | relative_url }}">Guides</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if page.url contains '/api' %}active{% endif %}" href="{{ "/api/" | relative_url }}">API</a>
                </li>
            </ul>
            
            <div class="d-flex">
                <a href="https://github.com/buildlyio/buildly-react-template" class="btn btn-outline-light btn-sm me-2">
                    <i class="fab fa-github"></i> GitHub
                </a>
                <button class="btn btn-outline-light btn-sm" id="theme-toggle">
                    <i class="fas fa-moon" id="theme-icon"></i>
                </button>
            </div>
        </div>
    </div>
</nav>`;

    fs.writeFileSync(path.join(this.repoPath, '_includes', 'navigation.html'), navigation);
  }

  createStylesheet() {
    const css = `/* Buildly Documentation Styles */
:root {
  --primary-color: #0C5595;
  --secondary-color: #F9943B;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}

/* Custom Bootstrap theme */
.bg-primary {
  background-color: var(--primary-color) !important;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: #0A4A85;
  border-color: #0A4A85;
}

/* Layout */
.sidebar {
  background-color: var(--light-color);
  border-right: 1px solid #dee2e6;
  min-height: calc(100vh - 76px);
}

.sidebar .nav-link {
  color: var(--dark-color);
  border-radius: 0.375rem;
  margin: 0.125rem 0;
}

.sidebar .nav-link:hover,
.sidebar .nav-link.active {
  background-color: var(--primary-color);
  color: white;
}

/* Feature pages */
.feature-header {
  border-bottom: 2px solid var(--light-color);
  padding-bottom: 1rem;
}

.feature-meta .badge {
  font-size: 0.75rem;
}

/* AI-powered features */
.ai-feature {
  border-left: 4px solid var(--success-color);
  background-color: rgba(40, 167, 69, 0.1);
}

.ai-feature .card-header {
  background-color: var(--success-color);
  color: white;
}

/* Code blocks */
pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 1rem;
  overflow-x: auto;
}

code {
  background-color: #f8f9fa;
  color: #e83e8c;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

/* Table of contents */
#toc ul {
  list-style: none;
  padding-left: 1rem;
}

#toc > ul {
  padding-left: 0;
}

#toc a {
  text-decoration: none;
  color: var(--dark-color);
  font-size: 0.875rem;
  padding: 0.25rem 0;
  display: block;
  border-radius: 0.25rem;
}

#toc a:hover {
  background-color: var(--light-color);
  color: var(--primary-color);
}

/* Search */
.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1050;
}

.search-result {
  padding: 0.75rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
}

.search-result:hover {
  background-color: var(--light-color);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    min-height: auto;
  }
}

/* Dark theme */
[data-theme="dark"] {
  background-color: #1a1a1a;
  color: #e9ecef;
}

[data-theme="dark"] .card {
  background-color: #2d3748;
  border-color: #4a5568;
}

[data-theme="dark"] .sidebar {
  background-color: #2d3748;
  border-color: #4a5568;
}

[data-theme="dark"] pre {
  background-color: #2d3748;
  border-color: #4a5568;
  color: #e9ecef;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Print styles */
@media print {
  .navbar,
  .sidebar,
  .btn,
  .search-container {
    display: none !important;
  }
  
  .container-fluid .row .col-md-9 {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}`;

    fs.writeFileSync(path.join(this.repoPath, 'assets', 'css', 'style.css'), css);
  }

  createJavaScript() {
    const js = `// Buildly Documentation JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize features
  initializeSearch();
  initializeTableOfContents();
  initializeThemeToggle();
  initializeNavigation();
  
  // Load documentation data
  loadDocumentationData();
});

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput) return;
  
  let searchData = [];
  
  // Load search index
  fetch('/buildly-docs/assets/data/search-index.json')
    .then(response => response.json())
    .then(data => {
      searchData = data;
    })
    .catch(error => console.warn('Search index not found'));
  
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }
    
    const results = searchData.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
    ).slice(0, 5);
    
    displaySearchResults(results);
  });
  
  // Hide search results when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
      searchResults.style.display = 'none';
    }
  });
}

function displaySearchResults(results) {
  const searchResults = document.getElementById('search-results');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result">No results found</div>';
  } else {
    searchResults.innerHTML = results.map(result => 
      \`<div class="search-result" onclick="window.location.href='\${result.url}'">
        <h6>\${result.title}</h6>
        <p class="mb-0 text-muted">\${result.excerpt}</p>
      </div>\`
    ).join('');
  }
  
  searchResults.style.display = 'block';
}

// Table of Contents
function initializeTableOfContents() {
  const toc = document.getElementById('toc');
  if (!toc) return;
  
  const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    toc.innerHTML = '<p class="text-muted">No headings found</p>';
    return;
  }
  
  let tocHTML = '<ul>';
  let currentLevel = 2;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substr(1));
    const id = heading.id || \`heading-\${index}\`;
    const text = heading.textContent;
    
    if (!heading.id) {
      heading.id = id;
    }
    
    if (level > currentLevel) {
      tocHTML += '<ul>'.repeat(level - currentLevel);
    } else if (level < currentLevel) {
      tocHTML += '</ul>'.repeat(currentLevel - level);
    }
    
    tocHTML += \`<li><a href="#\${id}">\${text}</a></li>\`;
    currentLevel = level;
  });
  
  tocHTML += '</ul>'.repeat(currentLevel - 1);
  toc.innerHTML = tocHTML;
  
  // Smooth scrolling for TOC links
  toc.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Theme toggle
function initializeThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  if (!themeToggle) return;
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

// Navigation
function initializeNavigation() {
  // Highlight active navigation items
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
    }
  });
  
  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
    });
  }
}

// Load documentation data
async function loadDocumentationData() {
  try {
    const response = await fetch('/buildly-docs/buildly-documentation.json');
    const data = await response.json();
    
    // Update last updated timestamp
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated && data.last_updated) {
      const date = new Date(data.last_updated).toLocaleDateString();
      lastUpdated.textContent = date;
    }
    
    // Update version
    const version = document.getElementById('version');
    if (version && data.version) {
      version.textContent = data.version;
    }
    
    // Load features if on features page
    if (window.location.pathname.includes('/features/')) {
      loadFeaturesGrid(data.features);
    }
    
  } catch (error) {
    console.warn('Could not load documentation data:', error);
  }
}

// Load features grid
function loadFeaturesGrid(features) {
  const featuresGrid = document.getElementById('features-grid');
  if (!featuresGrid || !features) return;
  
  const featureCards = Object.entries(features).map(([key, feature]) => {
    const badges = [];
    
    if (feature.ai_powered) {
      badges.push('<span class="badge bg-success me-1"><i class="fas fa-robot"></i> AI</span>');
    }
    
    if (feature.needs_documentation) {
      badges.push('<span class="badge bg-warning me-1">Needs Docs</span>');
    }
    
    return \`
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 feature-card">
          <div class="card-body">
            <h5 class="card-title">\${feature.title}</h5>
            <p class="card-text">\${feature.description}</p>
            <div class="mb-2">\${badges.join('')}</div>
          </div>
          <div class="card-footer">
            <a href="/buildly-docs/features/\${key}/" class="btn btn-primary btn-sm">Learn More</a>
          </div>
        </div>
      </div>
    \`;
  }).join('');
  
  featuresGrid.innerHTML = featureCards;
}

// Utility functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    showToast('Copied to clipboard!');
  });
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = \`toast align-items-center text-white bg-\${type} border-0\`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = \`
    <div class="d-flex">
      <div class="toast-body">\${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  \`;
  
  document.body.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 5000);
}`;

    fs.writeFileSync(path.join(this.repoPath, 'assets', 'js', 'main.js'), js);
  }

  createIndexPage() {
    const index = `---
layout: default
title: "Buildly Product Labs Documentation"
description: "Comprehensive documentation for the AI-powered product management platform"
---

<div class="hero-section bg-primary text-white py-5 mb-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-4 fw-bold">Buildly Product Labs</h1>
                <p class="lead">AI-powered product management platform for modern development teams</p>
                <div class="mt-4">
                    <a href="{{ "/getting-started/" | relative_url }}" class="btn btn-light btn-lg me-3">
                        <i class="fas fa-rocket"></i> Get Started
                    </a>
                    <a href="{{ "/features/" | relative_url }}" class="btn btn-outline-light btn-lg">
                        <i class="fas fa-list"></i> View Features
                    </a>
                </div>
            </div>
            <div class="col-lg-6 text-center">
                <img src="{{ "/assets/images/buildly-hero.png" | relative_url }}" 
                     alt="Buildly Product Labs" 
                     class="img-fluid rounded shadow"
                     style="max-height: 400px;">
            </div>
        </div>
    </div>
</div>

<div class="container">
    <div class="row">
        <div class="col-lg-8">
            <section class="mb-5">
                <h2>What is Buildly Product Labs?</h2>
                <p class="lead">A comprehensive platform that combines traditional product management tools with AI-powered assistance to streamline your development workflow.</p>
                
                <div class="row mt-4">
                    <div class="col-md-6 mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-robot fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5>AI-Powered Features</h5>
                                <p>Intelligent suggestions for features, releases, and project planning with contextual assistance.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-chart-line fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5>Analytics & Insights</h5>
                                <p>Deep insights into team performance, feature completion, and project health.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-users fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5>Team Collaboration</h5>
                                <p>Built-in tools for team communication, task assignment, and progress tracking.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-cogs fa-2x text-primary"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5>Flexible Workflows</h5>
                                <p>Kanban boards, tabular views, and customizable workflows to fit your team's process.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mb-5">
                <h2>Key Features</h2>
                <div class="row" id="features-grid">
                    <!-- Features will be loaded dynamically -->
                    <div class="col-12 text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading features...</span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mb-5">
                <h2>Quick Start Guide</h2>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="card text-center h-100">
                            <div class="card-body">
                                <div class="mb-3">
                                    <span class="badge bg-primary rounded-pill fs-6">1</span>
                                </div>
                                <h5 class="card-title">Setup</h5>
                                <p class="card-text">Install and configure Buildly Product Labs for your organization.</p>
                                <a href="{{ "/getting-started/installation/" | relative_url }}" class="btn btn-outline-primary">Learn More</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card text-center h-100">
                            <div class="card-body">
                                <div class="mb-3">
                                    <span class="badge bg-primary rounded-pill fs-6">2</span>
                                </div>
                                <h5 class="card-title">Create Project</h5>
                                <p class="card-text">Set up your first product and invite your team members.</p>
                                <a href="{{ "/guides/first-project/" | relative_url }}" class="btn btn-outline-primary">Learn More</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card text-center h-100">
                            <div class="card-body">
                                <div class="mb-3">
                                    <span class="badge bg-primary rounded-pill fs-6">3</span>
                                </div>
                                <h5 class="card-title">Start Building</h5>
                                <p class="card-text">Use AI features to plan releases and track progress.</p>
                                <a href="{{ "/guides/using-ai-features/" | relative_url }}" class="btn btn-outline-primary">Learn More</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
        <div class="col-lg-4">
            <div class="sticky-top">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Documentation Status</h5>
                    </div>
                    <div class="card-body">
                        <p><strong>Last Updated:</strong> <span id="last-updated">Loading...</span></p>
                        <p><strong>Version:</strong> <span id="version">Loading...</span></p>
                        <p><strong>Coverage:</strong> <span class="badge bg-success">95%</span></p>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Quick Links</h5>
                    </div>
                    <div class="list-group list-group-flush">
                        <a href="{{ "/api/" | relative_url }}" class="list-group-item list-group-item-action">
                            <i class="fas fa-code me-2"></i>API Reference
                        </a>
                        <a href="https://github.com/buildlyio/buildly-react-template" class="list-group-item list-group-item-action">
                            <i class="fab fa-github me-2"></i>Source Code
                        </a>
                        <a href="https://buildly.io/support" class="list-group-item list-group-item-action">
                            <i class="fas fa-question-circle me-2"></i>Support
                        </a>
                        <a href="https://buildly.io/changelog" class="list-group-item list-group-item-action">
                            <i class="fas fa-history me-2"></i>Changelog
                        </a>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Community</h5>
                    </div>
                    <div class="card-body">
                        <p>Join our community for support and discussions:</p>
                        <div class="d-grid gap-2">
                            <a href="https://github.com/buildlyio/buildly-react-template/discussions" class="btn btn-outline-primary btn-sm">
                                <i class="fab fa-github me-2"></i>GitHub Discussions
                            </a>
                            <a href="https://buildly.io/slack" class="btn btn-outline-primary btn-sm">
                                <i class="fab fa-slack me-2"></i>Slack Community
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

    fs.writeFileSync(path.join(this.repoPath, 'index.md'), index);
  }

  createReadme() {
    const readme = `# Buildly Product Labs Documentation

This repository contains the documentation for Buildly Product Labs, an AI-powered product management platform.

## 🌐 Live Documentation

Visit [https://${CONFIG.GITHUB_ORG}.github.io/${CONFIG.REPO_NAME}](https://${CONFIG.GITHUB_ORG}.github.io/${CONFIG.REPO_NAME}) to view the live documentation.

## 🏗️ Built With

- **Jekyll** - Static site generator
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icons
- **GitHub Pages** - Hosting

## 📁 Repository Structure

\`\`\`
├── _config.yml          # Jekyll configuration
├── _layouts/            # Page layouts
├── _includes/           # Reusable components
├── _features/           # Feature documentation pages
├── _guides/             # User guides
├── assets/             # CSS, JS, images
├── api/                # API documentation
└── buildly-documentation.json  # Structured data
\`\`\`

## 🔄 Auto-Update Process

This documentation is automatically updated when changes are detected in the main Buildly repository:

1. **Detection**: Script scans for new features and changes
2. **Analysis**: AI analyzes code changes for documentation relevance
3. **Update**: Documentation files are automatically updated
4. **Deploy**: Changes are pushed to GitHub Pages

## 🛠️ Local Development

To run the documentation locally:

\`\`\`bash
# Clone the repository
git clone https://github.com/${CONFIG.GITHUB_ORG}/${CONFIG.REPO_NAME}.git
cd ${CONFIG.REPO_NAME}

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Open http://localhost:4000
\`\`\`

## 📝 Contributing

To contribute to the documentation:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.

## 🔗 Links

- **Main Repository**: [buildly-react-template](https://github.com/buildlyio/buildly-react-template)
- **Website**: [buildly.io](https://buildly.io)
- **Support**: [buildly.io/support](https://buildly.io/support)

## 📄 License

This documentation is licensed under the MIT License - see the main repository for details.

---

*Last updated: ${new Date().toISOString().split('T')[0]}*`;

    fs.writeFileSync(path.join(this.repoPath, 'README.md'), readme);
  }

  create404Page() {
    const notFound = `---
layout: default
title: "Page Not Found"
permalink: /404.html
---

<div class="text-center py-5">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-6">
                <h1 class="display-1 text-primary">404</h1>
                <h2 class="mb-4">Page Not Found</h2>
                <p class="lead mb-4">The page you're looking for doesn't exist or has been moved.</p>
                
                <div class="mb-4">
                    <a href="{{ "/" | relative_url }}" class="btn btn-primary me-3">
                        <i class="fas fa-home"></i> Go Home
                    </a>
                    <a href="{{ "/features/" | relative_url }}" class="btn btn-outline-primary">
                        <i class="fas fa-search"></i> Browse Features
                    </a>
                </div>
                
                <hr class="my-4">
                
                <h5>Popular Pages</h5>
                <ul class="list-unstyled">
                    <li><a href="{{ "/getting-started/" | relative_url }}">Getting Started</a></li>
                    <li><a href="{{ "/features/ai-assistant/" | relative_url }}">AI Assistant</a></li>
                    <li><a href="{{ "/features/product-roadmap/" | relative_url }}">Product Roadmap</a></li>
                    <li><a href="{{ "/api/" | relative_url }}">API Reference</a></li>
                </ul>
            </div>
        </div>
    </div>
</div>`;

    fs.writeFileSync(path.join(this.repoPath, '404.md'), notFound);
  }

  createSampleFeature() {
    const feature = `---
layout: feature
title: "AI Assistant"
description: "Personal AI assistant for navigation, questions, and contextual guidance"
category: "AI Features"
version: "2.0"
ai_powered: true
permalink: /features/ai-assistant/
documentation_links:
  - title: "AI Assistant Guide"
    url: "https://docs.buildly.io/ai-assistant"
  - title: "Getting Help"
    url: "https://docs.buildly.io/support"
related_features:
  - title: "AI Feature Suggestions"
    description: "Smart feature recommendations"
    url: "/features/ai-feature-suggestions/"
  - title: "Form AI Helper"
    description: "Smart form completion assistance"
    url: "/features/form-ai-helper/"
---

## Overview

The AI Assistant is your personal guide within Buildly Product Labs, providing contextual help, answering questions, and offering smart suggestions based on your current workflow.

## Key Features

### Contextual Help
- **Page-specific guidance** with dynamic suggestions
- **Documentation links** relevant to your current context
- **Smart question generation** based on where you are in the platform

### Natural Language Processing
- Ask questions in plain English
- Understands project context and user roles
- Provides specific, actionable answers

### Always Available
- Floating button accessible from any page
- Mobile-friendly interface
- 24/7 instant responses

## How to Use

### Starting a Conversation

1. Click the floating AI assistant button (🤖) in the bottom-right corner
2. Choose from suggested questions or type your own
3. Get instant answers and follow-up suggestions

### Common Questions

The AI Assistant can help with questions like:

- "How do I create a new product?"
- "What's the difference between features and issues?"
- "How do I invite team members?"
- "Can you explain the release process?"
- "How do I generate an AI feature suggestion?"

### Getting Contextual Help

The assistant automatically adapts to your current page:

- **Dashboard**: Questions about getting started and navigation
- **Product Roadmap**: Feature management and AI suggestions
- **Release Management**: Release planning and tracking
- **Insights**: Analytics and team assistance

## Best Practices

### Effective Questions
- Be specific about what you want to accomplish
- Include context about your current task
- Ask follow-up questions for clarification

### Using Suggestions
- Try the auto-generated question suggestions
- They're tailored to your current workflow
- Perfect for discovering new features

## Technical Details

### AI Technology
- Powered by BabbleBeaver AI service
- Contextual understanding of Buildly workflows
- Continuous learning from user interactions

### Privacy & Security
- Conversations are not stored permanently
- No sensitive data is transmitted
- Respects user privacy and organizational policies

## Troubleshooting

### AI Not Responding
- Check your internet connection
- Verify AI services are enabled for your organization
- Try refreshing the page

### Getting Better Answers
- Provide more context in your questions
- Use specific terminology when possible
- Ask follow-up questions for clarification

## Updates

The AI Assistant is continuously improved with:
- Better understanding of Buildly workflows
- More accurate responses
- Enhanced contextual awareness
- New features and capabilities

For the latest updates and improvements, check the [changelog](https://buildly.io/changelog).`;

    fs.writeFileSync(path.join(this.repoPath, '_features', 'ai-assistant.md'), feature);
  }

  async setupGitHubActions() {
    console.log('⚙️ Setting up GitHub Actions...');
    
    // Create .github/workflows directory
    const workflowsDir = path.join(this.repoPath, '.github', 'workflows');
    fs.mkdirSync(workflowsDir, { recursive: true });
    
    // Create Jekyll deployment workflow
    const workflow = `name: Build and Deploy Jekyll

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  # Allow manual trigger
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
          cache-version: 0
          
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v3
        
      - name: Build with Jekyll
        run: bundle exec jekyll build --baseurl "\${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: production
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2`;

    fs.writeFileSync(path.join(workflowsDir, 'deploy.yml'), workflow);
    
    // Create Gemfile for Jekyll
    const gemfile = `source "https://rubygems.org"

gem "jekyll", "~> 4.3.2"
gem "minima", "~> 2.5"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-toc"
end

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]`;

    fs.writeFileSync(path.join(this.repoPath, 'Gemfile'), gemfile);
  }

  async commitAndPush() {
    console.log('📤 Committing and pushing initial content...');
    
    try {
      // Add all files
      execSync('git add .', { cwd: this.repoPath });
      
      // Commit
      execSync('git commit -m "Initial documentation setup with Jekyll and GitHub Pages"', { cwd: this.repoPath });
      
      // Push (this will fail if remote repo doesn't exist yet)
      try {
        execSync('git push -u origin main', { cwd: this.repoPath });
        console.log('✅ Pushed to remote repository');
      } catch (error) {
        console.warn('⚠️ Could not push to remote - make sure the GitHub repository exists');
        console.log('💡 Create the repository on GitHub and then run:');
        console.log(`   cd ${this.repoPath} && git push -u origin main`);
      }
      
    } catch (error) {
      console.error('❌ Failed to commit changes:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const initializer = new DocsRepoInitializer();
  initializer.run().catch(error => {
    console.error('Failed to initialize documentation repository:', error);
    process.exit(1);
  });
}

module.exports = DocsRepoInitializer;
