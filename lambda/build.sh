#!/bin/bash

# Build script for Lambda functions
set -e

echo "🔨 Building Lambda functions..."

# Build shared code first
echo "📦 Building shared code..."
cd shared
npm install
npm run build
cd ..

build_lambda() {
  local func_name=$1
  local lambda_dir=$(pwd)
  echo "📦 Building $func_name..."
  cd "$lambda_dir/$func_name"
  rm -rf dist
  mkdir -p dist
  npm install
  
  # Compile TypeScript
  npx tsc
  
  # Install production dependencies in dist
  if [ -f "package.json" ]; then
    cp package.json dist/ 2>/dev/null || true
    cd dist
    npm install --production --no-save --silent 2>/dev/null || true
    cd ..
  fi
  
  # Create zip: include dist contents and shared code at root
  # The compiled code has imports like: import { x } from '../shared/utils'
  # When Lambda runs read-api/index.js, ../shared resolves to shared/ at zip root
  cd dist
  zip -r index.zip . -q
  # Add shared code at zip root (so ../shared from read-api/ resolves correctly)
  if [ -d "$lambda_dir/shared/dist" ] && [ "$(ls -A $lambda_dir/shared/dist 2>/dev/null)" ]; then
    cd "$lambda_dir/shared/dist"
    zip -r "$lambda_dir/$func_name/dist/index.zip" . -q 2>/dev/null || true
  fi
  cd "$lambda_dir"
  
  local zip_size=$(du -h "$lambda_dir/$func_name/dist/index.zip" 2>/dev/null | cut -f1 || echo "?")
  echo "✓ $func_name built: $zip_size"
}

# Build both functions
build_lambda "read-api"
build_lambda "admin-api"

echo ""
echo "✅ All Lambda functions built successfully!"
echo ""
echo "📝 Next steps:"
echo "1. cd terraform"
echo "2. cp terraform.tfvars.example terraform.tfvars"  
echo "3. Edit terraform.tfvars with your values"
echo "4. terraform init"
echo "5. terraform apply"
