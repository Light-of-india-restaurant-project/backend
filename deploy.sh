#!/bin/bash

VPS_USER="root"
VPS_HOST="31.14.99.171"
VPS_PATH="/var/www/light-of-india/backend"
PM2_APP_NAME="light-of-india-backend"
SSH_OPTIONS="-o StrictHostKeyChecking=no -o BatchMode=yes"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Deploying Backend to lightofindia.nl...${NC}"

# Step 1: TypeScript Check
echo "📋 Checking TypeScript..."
if ! npm run build 2>&1 | tee /tmp/backend-build.log; then
  echo -e "${RED}❌ TypeScript build failed!${NC}"
  cat /tmp/backend-build.log
  exit 1
fi
echo -e "${GREEN}✓ TypeScript check passed${NC}"

# Step 2: Upload files
echo "📤 Uploading files..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'log' \
  --exclude '.env' \
  -e "ssh ${SSH_OPTIONS}" \
  ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ File upload failed!${NC}"
  exit 1
fi

# Step 3: Copy production env if exists
if [ -f ".env.production" ]; then
  echo "📋 Copying production environment..."
  scp -o StrictHostKeyChecking=no -o BatchMode=yes .env.production ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/.env
fi

# Step 4: Install dependencies and restart on VPS
echo "🔄 Installing dependencies and restarting..."
ssh ${SSH_OPTIONS} ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && npm install --production --silent && (pm2 restart ${PM2_APP_NAME} 2>/dev/null || pm2 start build/src/server.js --name ${PM2_APP_NAME}) && pm2 save && pm2 list | grep ${PM2_APP_NAME}"

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Server restart failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
