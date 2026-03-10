#!/bin/bash

# Configuration
VPS_USER="root"
VPS_HOST="31.14.99.171"
IMAGE_NAME="ghcr.io/light-of-india-restaurant-project/backend:latest"
CONTAINER_NAME="light-of-india-backend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Deploying Backend to lightofindia.nl...${NC}"

# Step 1: Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t $IMAGE_NAME . || { echo -e "${RED}❌ Docker build failed!${NC}"; exit 1; }
echo -e "${GREEN}✓ Docker build complete${NC}"

# Step 2: Push to GitHub Container Registry
echo -e "${YELLOW}📤 Pushing to GHCR...${NC}"
docker push $IMAGE_NAME || { echo -e "${RED}❌ Docker push failed! Run: docker login ghcr.io${NC}"; exit 1; }
echo -e "${GREEN}✓ Image pushed to GHCR${NC}"

# Step 3: Copy .env.production to VPS if exists
if [ -f ".env.production" ]; then
  echo -e "${YELLOW}📋 Uploading environment file...${NC}"
  scp -o StrictHostKeyChecking=no .env.production $VPS_USER@$VPS_HOST:/var/www/light-of-india/backend/.env
fi

# Step 4: Deploy to VPS
echo -e "${YELLOW}🔄 Deploying to VPS...${NC}"
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "
  docker pull $IMAGE_NAME
  docker stop $CONTAINER_NAME 2>/dev/null
  docker rm $CONTAINER_NAME 2>/dev/null
  cd /var/www/light-of-india && docker-compose up -d backend
  docker image prune -f
" || { echo -e "${RED}❌ VPS deployment failed!${NC}"; exit 1; }

echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
echo -e "${GREEN}🌐 API: https://api.lightofindia.nl${NC}"
