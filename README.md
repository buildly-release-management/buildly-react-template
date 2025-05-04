# Buildly React Template
[![Build Status](https://github.com/buildlyio/buildly-react-template/actions/workflows/ci.yml/badge.svg)](https://github.com/buildlyio/buildly-react-template/actions) [![Documentation Status](https://readthedocs.org/projects/buildly-react-template/badge/?version=latest)](https://buildly-react-template.readthedocs.io/en/latest/?badge=latest) [![Gitter](https://badges.gitter.im/Buildlyio/community.svg)](https://gitter.im/Buildlyio/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Buildly React Template is a [React](https://reactjs.org/) web application that implements the core features of the UI core, pre-configured to connect to [Buildly Core](https://github.com/buildlyio/buildly-core).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The web application was tested and built with the following versions:

- Node.js v16.13.0
- Yarn v1.17.3

### Installing

First of all, you need to have a Buildly Core instance up and running locally.
Further details about how to deploy Buildly Core locally can be found in its [documentation](https://buildly-core.readthedocs.io/en/latest/).

To install the application, navigate to the project folder and run the following command:

```bash
$ yarn install
```

Now, initialize and build the project:

```bash
$ yarn run build --env build=local
```

To run the web app:

```bash
$ yarn run start --env build=local
```

Your Buildly React Template will be running locally and listening on port 3000. You can access it via your browser at `http://127.0.0.1:3000`.

## Configuration

The Buildly React Template uses environment variables to configure the application. These variables can be set in the following files:

1. **`.env`**:
   - This file contains shared or default environment variables for all environments (e.g., development, production).
   - Example:
     ```plaintext
     API_URL=https://labs-api.buildly.dev
     OAUTH_CLIENT_ID=your-client-id
     ```

2. **`.env.development.local`**:
   - This file is specific to local development and can override variables in `.env`.
   - Example:
     ```plaintext
     API_URL=http://localhost:8000
     OAUTH_CLIENT_ID=your-local-client-id
     ```

   > **Note**: If `.env.development.local` is missing, the build process will fall back to using `window.environment.js`.

### Using Environment Files

1. **For Local Development**:
   - Create a `.env.development.local` file in the root of your project and add environment-specific variables.
   - Example:
     ```bash
     cp .env .env.development.local
     ```

2. **For Production**:
   - Use `.env` for production variables or configure them directly in your deployment environment.

3. **Fallback Behavior**:
   - If `.env.development.local` is not present, the build process will use `window.environment.js` as a fallback.

## Running the Tests

To **run tests** using [Jest](https://jestjs.io/):

```bash
$ yarn run test
```

## Deployment

To deploy Buildly React Template, you can either use our [Buildly React Template Docker image](https://hub.docker.com/r/buildly/buildly-react-template) from Docker Hub or build your own image and host it somewhere.

### Build Docker Image

First, ensure the web app dependencies are installed and the app is initialized locally. Then, build it as a production application by executing the following command:

```bash
$ yarn run build:prod
```

Now, build a Docker image and host it somewhere. For more information about building images, check Docker's [documentation](https://docs.docker.com/).

### Configuration for Docker

The following table lists the configurable parameters of Buildly React Template and their default values. These parameters can be updated in the Docker container via flags or configured as environment variables.

| Parameter               | Description                                      | Default Value |
|-------------------------|--------------------------------------------------|---------------|
| `API_URL`               | Buildly Core URL                                |               |
| `OAUTH_CLIENT_ID`       | OAuth client identifier                         |               |
| `OAUTH_TOKEN_URL`       | OAuth token URL                                 |               |
| `GITHUB_CLIENT_ID`      | GitHub client identifier                        |               |
| `TRELLO_API_KEY`        | Trello API key                                  |               |
| `FEEDBACK_SHEET`        | Feedback sheet URL                              |               |

Specify each parameter using `-e`, `--env`, and `--env-file` flags to set environment variables in `docker run`. For example:

```bash
$ docker run -e API_URL=https://api.example.com \
    --env-file ./env.list \
    buildly/buildly-react-template
```

### Connecting to Buildly Core

To connect the Buildly React Template to a local or remote Buildly Core instance, you need to configure the `API_URL` environment variable.

1. **Local Buildly Core**:
   If you are running Buildly Core locally, set the `API_URL` to the local instance's URL. For example:
   ```bash
   API_URL=http://localhost:8000
   ```

2. **Remote Buildly Core**:
   If you are connecting to a remote Buildly Core instance, set the `API_URL` to the remote instance's URL. For example:
   ```bash
   API_URL=https://api.buildly.io
   ```

You can set this environment variable in the `.env` file, pass it as a flag when running the Docker container, or configure it directly in your deployment environment.

## Continuous Integration and Deployment

This project uses **GitHub Actions** for CI/CD. The workflows are defined in the `.github/workflows/` directory.

### Key Workflows

1. **Build and Test**  
   The `ci.yml` workflow ensures that the code builds successfully and passes all tests.  
   File: `.github/workflows/ci.yml`

2. **Deployment**  
   The `deploy.yml` workflow automates the deployment process.  
   File: `.github/workflows/deploy.yml`

### Viewing Workflow Results

You can view the status of the workflows on the [Actions tab](https://github.com/buildlyio/buildly-react-template/actions) of the repository.

## Built With

* [GitHub Actions](https://github.com/features/actions) - Recommended CI/CD
* [React](https://reactjs.org/) - Frontend framework

## Contributing

Please read [CONTRIBUTING.md](https://github.com/buildlyio/docs/blob/master/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/buildlyio/buildly-react-template/tags).

## Authors

* **Buildly** - *Initial work*

See also the list of [contributors](https://github.com/buildlyio/buildly-react-template/graphs/contributors) who participated in this project.

## License

This project is licensed under the GPL v3 License - see the [LICENSE](LICENSE) file for details.