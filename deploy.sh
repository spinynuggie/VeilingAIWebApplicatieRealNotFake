#!/bin/bash

# Configuration
DOCKER_USERNAME="rayantjedo"
VERCEL_URL="veiling-ai-web-applicatie-real-not.vercel.app"

TAG="final-production"

echo "deploying"
echo "image: $DOCKER_USERNAME/veiling-backend:$TAG"

if ! docker info > /dev/null 2>&1; then
    echo "docker is not running."
    exit 1
fi

# 1. build image...
echo "building image..."
docker build -t $DOCKER_USERNAME/veiling-backend:$TAG -f backend/Dockerfile.alpine backend/

if [ $? -ne 0 ]; then
    echo "build failed!"
    exit 1
fi

# 2. Push to Docker Hub
echo "pushing to docker hub..."
docker push $DOCKER_USERNAME/veiling-backend:$TAG

if [ $? -ne 0 ]; then
    echo "push failed! make sure you're logged into docker."
    exit 1
fi

echo "image is in the cloud, gj"