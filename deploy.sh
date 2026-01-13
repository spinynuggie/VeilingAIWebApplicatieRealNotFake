#!/bin/bash

# Configuration
DOCKER_USERNAME="rayantjedo"
VERCEL_URL="veiling-ai-web-applicatie-real-not.vercel.app"

# Automated Tagging: Uses timestamp so you don't have to manually update this file
TIMESTAMP=$(date +%Y%m%d%H%M%S)
TAG="ai-ext-${TIMESTAMP}"

echo "-----------------------------------"
echo "🚀 Starting AI Experimental Deployment"
echo "📦 Image: $DOCKER_USERNAME/veiling-backend:$TAG"
echo "-----------------------------------"

# Check if logged in (Optional but helpful)
if ! docker info > /dev/null 2>&1; then
    echo "⚠️ Docker is not running. Please start Docker first."
    exit 1
fi

# 1. Build the backend image
echo "🔨 Building AI Experimental Docker image (Alpine)..."
docker build -t $DOCKER_USERNAME/veiling-backend:$TAG -f backend/Dockerfile.alpine backend/

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# 2. Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/veiling-backend:$TAG

if [ $? -ne 0 ]; then
    echo "❌ Push failed! Are you logged in? Run 'docker login' if not."
    exit 1
fi

echo "-----------------------------------"
echo "✅ Image is now in the cloud!"
echo "-----------------------------------"
echo "Next steps in Plesk:"
echo "1. Go to the Docker menu."
echo "2. Click 'Add Image' and search for '$DOCKER_USERNAME/veiling-backend'."
echo "3. Use the NEW tag: $TAG"
echo "4. Update the container settings if needed."
echo "-----------------------------------"
