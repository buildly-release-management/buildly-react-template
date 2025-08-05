# Scripts Directory

This directory contains all shell scripts for the Buildly React Template project.

## Available Scripts

### Development Scripts

#### `./scripts/start-dev.sh`
**Purpose**: Start the development server with enhanced environment setup  
**Features**:
- Creates template `.env.development.local` if missing
- Checks Node.js version compatibility
- Installs dependencies if needed
- Loads environment variables
- Starts the development server

**Usage**:
```bash
./scripts/start-dev.sh
```

#### `./scripts/start-dashboard.sh`
**Purpose**: Enhanced development server startup with dashboard focus  
**Features**:
- Similar to start-dev.sh but with dashboard-specific messaging
- Checks environment configuration
- Provides Node.js compatibility handling

**Usage**:
```bash
./scripts/start-dashboard.sh
```

### Testing Scripts

#### `./scripts/run-tests.sh`
**Purpose**: Comprehensive test suite runner  
**Features**:
- Runs Jest test suite
- Provides colored output
- Test coverage reporting
- Error handling and reporting

**Usage**:
```bash
./scripts/run-tests.sh
```

#### `./scripts/test-deployment.sh`
**Purpose**: Pre-deployment validation and testing  
**Features**:
- Checks Node.js/npm availability
- Validates critical file syntax
- Runs production build test
- Analyzes bundle sizes
- Code quality checks
- Provides deployment readiness report

**Usage**:
```bash
./scripts/test-deployment.sh
```

### Deployment Scripts

#### `./scripts/deploy.sh`
**Purpose**: Docker Hub deployment  
**Features**:
- Tags Docker images
- Pushes to Docker Hub
- Travis CI integration

**Usage** (typically in CI/CD):
```bash
./scripts/deploy.sh
```

#### `./scripts/deploy-aws.sh`
**Purpose**: AWS ECR deployment  
**Features**:
- AWS ECR authentication
- Image tagging and pushing
- Container registry management

**Usage** (typically in CI/CD):
```bash
./scripts/deploy-aws.sh
```

### Container Scripts

#### `./scripts/initialize_container.sh`
**Purpose**: Docker container initialization  
**Features**:
- Exports Git commit information
- Creates runtime environment configuration
- Sets up window.env object for browser

**Usage** (automatically in Docker):
```bash
./scripts/initialize_container.sh
```

## Script Conventions

### Directory Navigation
All scripts automatically change to the project root directory using:
```bash
cd "$(dirname "$0")/.."
```

This ensures scripts work correctly whether called from the project root or scripts directory.

### Environment Variables
Scripts respect and use the following environment files:
- `.env.development.local` - Local development settings
- `.env.production` - Production configuration
- `public/environment.js` - Runtime browser configuration

### Error Handling
Scripts include proper error handling with:
- Colored output (green ✅, red ❌, yellow ⚠️)
- Exit codes (0 = success, 1 = failure)
- Descriptive error messages
- Rollback recommendations where applicable

### Dependencies
Scripts check for and handle:
- Node.js version compatibility (v16.13.0+)
- Package manager availability (npm/yarn)
- Required dependencies installation
- Environment variable validation

## Usage Examples

### Development Workflow
```bash
# Start development server
./scripts/start-dev.sh

# Run tests during development
./scripts/run-tests.sh
```

### Pre-Deployment Workflow
```bash
# Run comprehensive pre-deployment tests
./scripts/test-deployment.sh

# If tests pass, build for production
npm run build
# or
yarn build
```

### CI/CD Integration
```bash
# In your CI/CD pipeline
./scripts/test-deployment.sh  # Validation
./scripts/deploy.sh           # Docker Hub deployment
# or
./scripts/deploy-aws.sh       # AWS ECR deployment
```

## Troubleshooting

### Permission Issues
If you get permission denied:
```bash
chmod +x scripts/*.sh
```

### Path Issues
Scripts should work from any directory, but if you encounter path issues:
```bash
# Always run from project root
cd /path/to/buildly-react-template
./scripts/script-name.sh
```

### Node.js Issues
If Node.js is not found:
1. Ensure Node.js v16.13.0+ is installed
2. Check your PATH includes Node.js binary directory
3. Try using nvm if available: `nvm use 16`

### Build Issues
If build fails:
1. Run `./scripts/test-deployment.sh` first
2. Check the build log for specific errors
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

## Contributing

When adding new scripts:
1. Place them in the `scripts/` directory
2. Make them executable: `chmod +x scripts/your-script.sh`
3. Add directory navigation: `cd "$(dirname "$0")/.."`
4. Include proper error handling and colored output
5. Document the script in this README
6. Test from both project root and scripts directory

## Support

For script-related issues:
1. Check this documentation
2. Review the specific script's output messages
3. Ensure all prerequisites are met
4. Check the main project README for additional context
