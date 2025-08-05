#!/bin/bash

# Development startup script for Buildly React Template
# This script helps ensure proper environment setup

echo "🚀 Starting Buildly React Template Development Server"

# Change to project root directory
cd "$(dirname "$0")/.."

# Check if .env.development.local exists
if [ ! -f ".env.development.local" ]; then
    echo "⚠️  Warning: .env.development.local not found"
    echo "📝 Creating a template .env.development.local file..."
    
    cat > .env.development.local << EOF
API_URL=https://labs-api.buildly.io/
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_AUTHORIZATION_URL=https://labs-api.buildly.io/authorize/
OAUTH_TOKEN_URL=https://labs-api.buildly.io/token/
OAUTH_REVOKE_URL=https://labs-api.buildly.io/revoke_token/
OAUTH_REDIRECT_URL=http://localhost:3000/auth/callback
OAUTH_SCOPE=read write
TRELLO_API_KEY=your-trello-api-key
FEEDBACK_SHEET=https://sheet.best/api/sheets/your-sheet-id
PRODUCT_SERVICE_URL=https://labs-product.buildly.io/
PRODUCT_SERVICE_TOKEN=your-product-service-token
RELEASE_SERVICE_URL=https://labs-release.buildly.io/
RELEASE_SERVICE_TOKEN=your-release-service-token
FREE_COUPON_CODE=your-coupon-code
STRIPE_KEY=your-stripe-key
BOT_API_KEY=your-bot-api-key
HOSTNAME=labs.buildly.io
BABBLE_CHATBOT_URL=https://labs-babble.buildly.io/chatbot
GITHUB_CLIENT_ID=your-github-client-id
PRODUCTION=false
EOF

    echo "✅ Template .env.development.local created"
    echo "📝 Please update the OAuth client ID and other tokens as needed"
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

echo "🔧 Loading environment variables..."
set -a
source .env.development.local
set +a

echo "📝 Creating environment.js for development..."
cat > public/environment.js << EOF
window.env = {
API_URL: "$API_URL",
OAUTH_CLIENT_ID: "$OAUTH_CLIENT_ID",
OAUTH_AUTHORIZATION_URL: "$OAUTH_AUTHORIZATION_URL",
OAUTH_TOKEN_URL: "$OAUTH_TOKEN_URL",
OAUTH_REVOKE_URL: "$OAUTH_REVOKE_URL",
OAUTH_REDIRECT_URL: "$OAUTH_REDIRECT_URL",
OAUTH_SCOPE: "$OAUTH_SCOPE",
GITHUB_CLIENT_ID: "$GITHUB_CLIENT_ID",
TRELLO_API_KEY: "$TRELLO_API_KEY",
FEEDBACK_SHEET: "$FEEDBACK_SHEET",
PRODUCT_SERVICE_URL: "$PRODUCT_SERVICE_URL",
PRODUCT_SERVICE_TOKEN: "$PRODUCT_SERVICE_TOKEN",
RELEASE_SERVICE_URL: "$RELEASE_SERVICE_URL",
RELEASE_SERVICE_TOKEN: "$RELEASE_SERVICE_TOKEN",
FREE_COUPON_CODE: "$FREE_COUPON_CODE",
STRIPE_KEY: "$STRIPE_KEY",
BOT_API_KEY: "$BOT_API_KEY",
HOSTNAME: "$HOSTNAME",
BABBLE_CHATBOT_URL: "$BABBLE_CHATBOT_URL",
PRODUCTION: $PRODUCTION
};
EOF

echo "🌐 Starting development server on http://localhost:3000"
echo "📊 Dashboard will be available at http://localhost:3000/app/dashboard"

# Start the development server
yarn start
