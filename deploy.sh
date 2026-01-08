#!/bin/bash

# Configuration - EDIT THESE
DOCKER_USERNAME="rayantjedo"
VERCEL_URL="veiling-ai-web-applicatie-real-not.vercel.app"
TAG="v10-productfix-otherstuff" # SameSite=None + ForwardedProto

echo "🚀 Starting Magic Deployment (Tag: $TAG)..."

# 1. Build the backend image
echo "📦 Building Docker image..."
docker build -t $DOCKER_USERNAME/veiling-backend:$TAG -f backend/Dockerfile.alpine backend/

# 2. Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/veiling-backend:$TAG

echo "✅ Image is now in the cloud!"
echo "-----------------------------------"
echo "Next steps in Plesk:"
echo "1. Go to the Docker menu."
echo "2. Click 'Add Image' and search for '$DOCKER_USERNAME/veiling-backend'."
echo "3. We will then setup the environment variables in Plesk."
echo "-----------------------------------"
