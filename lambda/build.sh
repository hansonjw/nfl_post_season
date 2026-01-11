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
  echo "📦 Building $func_name..."
  cd $func_name
  rm -rf dist
  mkdir -p dist
  npm install
  
  # Compile TypeScript
  npx tsc
  
  # Copy shared code into dist (so imports from ../shared work)
  # The compiled code has imports like: import { x } from '../shared/utils'
  # So we need ../shared relative to dist/ to point to shared code
  # We'll copy shared/dist to the parent of dist, as 'shared'
  mkdir -p ../shared_compiled
  cp -r ../shared/dist/* ../shared_compiled/
  
  # Install production dependencies in dist
  if [ -f "package.json" ]; then
    cp package.json dist/ 2>/dev/null || true
    cd dist
    npm install --production --no-save --silent 2>/dev/null || true
    cd ..
  fi
  
  # Create zip: include dist contents and the shared_compiled sibling
  cd dist
  zip -r index.zip . -q
  cd ..
  # Add shared code to zip
  cd dist
  zip -r index.zip ../../shared_compiled -q 2>/dev/null || true
  cd ../..
  
  # Cleanup
  rm -rf shared_compiled
  
  local zip_size=$(du -h $func_name/dist/index.zip 2>/dev/null | cut -f1 || echo "?")
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
