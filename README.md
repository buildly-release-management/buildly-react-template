# Buildly React Template
[![Build Status](https://travis-ci.org/buildlyio/buildly-react-template.svg?branch=master)](https://travis-ci.org/buildlyio/buildly-react-template) [![Documentation Status](https://readthedocs.org/projects/buildly-react-template/badge/?version=latest)](https://buildly-react-template.readthedocs.io/en/latest/?badge=latest) [![Gitter](https://badges.gitter.im/Buildlyio/community.svg)](https://gitter.im/Buildlyio/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Buildly React Template is a [React](https://reactjs.org/) web application that implements the core features of the UI core, pre-configure to connect to [Buildly Core](https://github.com/buildlyio/buildly-core).

## Features

### Dashboard
The application includes a comprehensive dashboard that provides:

- **Personalized Welcome**: Time-based greeting with user information
- **Product Overview**: Cards showing accessible products with release progress
- **Task Management**: Assigned issues and features in organized columns
- **Feedback System**: Comments requiring user attention
- **Release Timeline**: Upcoming releases with due date tracking
- **User Role-Based Views**: Different content for Developer vs Product Team roles

### Navigation
- Responsive navigation bar with role-based menu items
- Quick access to key application areas
- User profile and settings management

### Product Management
- Product portfolio overview
- Product roadmap with tabular and Kanban views
- Release management and tracking
- Feature and issue management

### User Management
- User profile management
- Subscription handling
- Group and permission management

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The web application was tested and built with the following versions:

- node v23.10.0 (or v16.13.0+)
- yarn v1.22.17 (or v1.17.3+)
- npm v10.9.2+
- npm v8.0.0+ (tested up to v10.9.2)

### Installing

First of all, you need to have a Buildly Core instance up and running locally.
Further detail about how to deploy Buildly Core locally, check its [documentation](https://buildly-core.readthedocs.io/en/latest/).

To install the application you need to download and install its dependencies, so you have to navigate to the project folder and run the following command:

```bash
yarn install
```

### Environment Configuration

Create a `.env.development.local` file in the project root with the following variables:

```bash
API_URL=https://labs-api.buildly.dev
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_AUTHORIZATION_URL=https://labs-api.buildly.dev/o/authorize/
OAUTH_TOKEN_URL=https://labs-api.buildly.dev/o/token/
OAUTH_REVOKE_URL=https://labs-api.buildly.dev/o/revoke_token/
OAUTH_REDIRECT_URL=http://localhost:3000/auth/callback
OAUTH_SCOPE=read write
PRODUCT_SERVICE_URL=https://labs-api.buildly.dev
RELEASE_SERVICE_URL=https://labs-api.buildly.dev
PRODUCTION=false
```

### Building and Running

To build the project:

```bash
yarn run build
```

To run the development server:

```bash
yarn start
```

```bash
./start-dev.sh
```

This script will:
- Check Node.js version compatibility
- Create a template `.env.development.local` if missing
- Install dependencies if needed
- Load environment variables
- Start the development server

**To serve built files** (for production testing):

```bash
yarn run serve
```

Your Buildly React Template will be running locally and listening to the port 3000, so you can access it via your browser typing this address: 127.0.0.1:3000

## Features

### Dashboard
The application includes a comprehensive dashboard that serves as the homepage for logged-in users. The dashboard provides:

- **Personalized greeting** with time-based salutations
- **Product overview cards** showing products the user has access to with current release progress
- **Task management** with separate columns for assigned Issues and Features
- **Feedback system** displaying comments that mention the user
- **Release timeline** showing upcoming releases with due date warnings
- **Profile-based views** with different content for Developer vs Product Team users

The dashboard automatically becomes the default landing page after user login and is accessible via the main navigation.

**Dashboard Access**: After logging in, you'll be automatically redirected to the dashboard at `/app/dashboard`

## Running the tests

To **run tests** using [Jest](https://jestjs.io/):

```
$ yarn run test
```

## Troubleshooting

### Local Development Issues

If you encounter issues starting the development server:

1. **Environment Variables**: Ensure you have a `.env.development.local` file with the required environment variables
2. **Node Version**: The application has been tested with Node.js v16.13.0+ and v23.10.0
3. **Clear Cache**: Try clearing node_modules and reinstalling:
   ```bash
   rm -rf node_modules yarn.lock
   yarn install
   ```
4. **Build First**: If dev server fails, try building first:
   ```bash
   yarn run build
   yarn run serve
   ```

### Environment Setup

For local development, create a `.env.development.local` file in the project root with your configuration:

```bash
API_URL=https://labs-api.buildly.dev/
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_TOKEN_URL=https://labs-api.buildly.dev/token/
PRODUCT_SERVICE_URL=https://labs-product.buildly.dev/
RELEASE_SERVICE_URL=https://labs-release.buildly.dev/
PRODUCTION=false
# ... other environment variables
```

**⚠️ Security Note:** Never commit actual API keys, tokens, or secrets to Git. Use placeholder values like `your-api-key` in template files.

## Security

### Environment Variables and Secrets

- **Never commit** actual API keys, tokens, or secrets to Git
- Use `.env.development.local` for local development (already in `.gitignore`)
- Use template files (`.env.development.local.template`, `environment.js.template`) with placeholder values
- The `start-dev.sh` script will generate environment files with placeholders that need to be manually updated
- For production deployment, set environment variables through your deployment platform

### Files Ignored by Git

- `.env.development.local` - Contains actual development secrets
- `public/environment.js` - Generated file with runtime configuration
- All files in `.gitignore` should never contain real secrets

To run tests in production mode:

```bash
yarn test:prod
```

To run tests with coverage:

```bash
yarn test-coverage
```

## Troubleshooting

### Development Server Issues

If you encounter issues starting the development server:

1. **Check Node version**: Ensure you're using Node.js v16.13.0 or higher
2. **Clear cache**: Try clearing yarn/npm cache with `yarn cache clean` or `npm cache clean --force`
3. **Reinstall dependencies**: Delete `node_modules` and `yarn.lock`/`package-lock.json`, then run `yarn install`
4. **Environment variables**: Ensure your `.env.development.local` file is properly configured
5. **Port conflicts**: Make sure port 3000 is not in use by another application

### Build Issues

If the build fails:

1. **Check webpack version**: This project uses webpack 5.x
2. **Node memory**: For large builds, you may need to increase Node's memory limit:
   ```bash
   export NODE_OPTIONS="--max_old_space_size=4096"
   ```
3. **Legacy OpenSSL**: If you encounter OpenSSL errors, the build scripts include `--openssl-legacy-provider` flag

### API Connection Issues

If the application can't connect to the API:

1. **CORS settings**: Ensure your Buildly Core instance allows requests from `localhost:3000`
2. **API URL**: Verify the `API_URL` environment variable points to your Buildly Core instance
3. **OAuth configuration**: Check that your OAuth client is properly configured in Buildly Core

## Deployment

To deploy Buildly React Template on live, you can either use our [Buildly React Template Docker image](https://hub.docker.com/r/buildly/buildly-react-template) from Docker Hub or build your own image and host it somewhere, so it can be used with your deployment platform and/or tool.

### Build Docker image

First you need to have the web app dependencies installed and the app initialized locally.
And then you need to build it as a production application executing the following command:

```
$ yarn run build:prod
```

Now, you just need to build a Docker image and host it somewhere. Further info about how to build images, check Docker's [documentation](https://docs.docker.com/).

### Configuration

The following table lists the configurable parameters of Buildly React Template and their default values.  They can be updated in the
Docker container via flags as below or configured as environment variables in Travis.

|             Parameter               |            Description             |                    Default                |
|-------------------------------------|------------------------------------|-------------------------------------------|
| `API_URL`                           | Buildly Core URL                   | `https://labs-api.buildly.dev/`      |
| `OAUTH_CLIENT_ID`                   | The client identifier issued to the client during Buildly Core deployment  | `your-oauth-client-id` |
| `OAUTH_AUTHORIZATION_URL`           | OAuth authorization endpoint       | `https://labs-api.buildly.dev/authorize/` |
| `OAUTH_TOKEN_URL`                   | Buildly Core URL used to authenticate users | `https://labs-api.buildly.dev/token/` |
| `OAUTH_REVOKE_URL`                  | OAuth token revocation endpoint   | `https://labs-api.buildly.dev/revoke_token/` |
| `OAUTH_REDIRECT_URL`                | OAuth callback URL                 | `http://localhost:3000/auth/callback` |
| `OAUTH_SCOPE`                       | OAuth permission scopes            | `read write` |
| `PRODUCT_SERVICE_URL`               | Product service API endpoint       | `https://labs-product.buildly.dev/` |
| `PRODUCT_SERVICE_TOKEN`             | Authentication token for product service | `your-product-service-token` |
| `RELEASE_SERVICE_URL`               | Release service API endpoint       | `https://labs-release.buildly.dev/` |
| `RELEASE_SERVICE_TOKEN`             | Authentication token for release service | `your-release-service-token` |
| `GITHUB_CLIENT_ID`                  | GitHub OAuth client ID             | `your-github-client-id` |
| `TRELLO_API_KEY`                    | Trello integration API key         | `your-trello-api-key` |
| `FEEDBACK_SHEET`                    | Google Sheets URL for feedback     | `https://sheet.best/api/sheets/your-sheet-id` |
| `FREE_COUPON_CODE`                  | Default coupon code for free access | `your-coupon-code` |
| `STRIPE_KEY`                        | Stripe payment integration key     | `your-stripe-key` |
| `BOT_API_KEY`                       | Chatbot API key                     | `your-bot-api-key` |
| `BABBLE_CHATBOT_URL`                | Chatbot service URL                 | `https://labs-babble.buildly.dev/chatbot` |
| `HOSTNAME`                          | Application hostname                | `labs.buildly.dev` |
| `PRODUCTION`                        | Production environment flag         | `false` |
| `OAUTH_AUTHORIZATION_URL`           | OAuth authorization endpoint | `https://labs-api.buildly.dev/o/authorize/` |
| `OAUTH_REVOKE_URL`                  | OAuth token revocation endpoint | `https://labs-api.buildly.dev/o/revoke_token/` |
| `OAUTH_REDIRECT_URL`                | OAuth redirect URL for local development | `http://localhost:3000/auth/callback` |
| `OAUTH_SCOPE`                       | OAuth scope permissions | `read write` |
| `PRODUCT_SERVICE_URL`               | Product service API endpoint | `https://labs-api.buildly.dev` |
| `RELEASE_SERVICE_URL`               | Release service API endpoint | `https://labs-api.buildly.dev` |
| `PRODUCTION`                        | Production mode flag | `false` |

Specify each parameter using `-e`, `--env`, and `--env-file` flags to set simple (non-array) environment variables to `docker run`. For example,

```bash
$ docker run -e MYVAR1 --env MYVAR2=foo \
    --env-file ./env.list \
    buildly/buildly-react-template
```

## Built With

* [Travis CI](https://travis-ci.org/) - Recommended CI/CD

## Contributing

Please read [CONTRIBUTING.md](https://github.com/buildlyio/docs/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/buildlyio/buildly-react-template/tags).

## Authors

* **Buildly** - *Initial work*

See also the list of [contributors](https://github.com/buildlyio/buildly-react-template/graphs/contributors) who participated in this project.

## License

This project is licensed under the GPL v3 License - see the [LICENSE](LICENSE) file for details
