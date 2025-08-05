#!/usr/bin/env bash

# Tag image and push to Docker Hub
if [ -z "$TRAVIS_TAG" ]; then
  TRAVIS_TAG="latest"
fi

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker tag "$DOCKER_REPO" "$DOCKER_REPO:$TRAVIS_TAG"
docker push "$DOCKER_REPO:$TRAVIS_TAG"
