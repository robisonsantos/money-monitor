# Deployment Guide

<!-- Test commit to verify pre-push hook with commit amend -->

## Overview

This project uses Block's internal artifactory for local development but requires public npm registry URLs for deployment to external platforms.

## 🔄 Registry Conversion Workflow

### Automatic (Recommended)

The repository includes a **pre-push hook** that automatically converts artifactory URLs before pushing:

1. **First time setup**: `npm run setup:hooks`
2. **Normal workflow**: Just use `git push` as usual
3. **Hook handles conversion**: Automatically runs `npm run prepare:deploy` before each push
4. **Result**: Remote repository always contains public npm registry URLs

### Manual

If you need to manually convert for deployment:

```bash
# Convert package-lock.json to public npm registry
npm run prepare:deploy

# Deploy to your platform
# (URLs will work on external platforms)

# Optional: Restore local artifactory URLs for development  
git checkout package-lock.json
```

## 🛡️ Security Features

### Pre-Push Protection

The pre-push hook prevents accidentally exposing Block's internal infrastructure:

- **Detects**: Block artifactory URLs in package-lock.json
- **Converts**: Automatically to public npm registry URLs  
- **Blocks**: Push if conversion fails
- **Adds**: Converted file to the commit

### Demo Credentials

Demo account credentials are hidden in production builds:

- **Development**: Shows demo account (admin@moneymonitor.com / 123456)
- **Production**: Credentials hidden automatically via `{#if dev}` condition

## 🚀 Deployment Platforms

### Vercel (Recommended)
```bash
npm run prepare:deploy  # Optional - pre-push hook handles this
npx vercel --prod
```

### Railway
```bash
npm run prepare:deploy  # Optional - pre-push hook handles this  
# Deploy via Railway dashboard
```

### Render
```bash  
npm run prepare:deploy  # Optional - pre-push hook handles this
# Deploy via Render dashboard  
```

## 📋 Pre-Push Hook Details

**Location**: `.git/hooks/pre-push`
**Triggers**: On every `git push`
**Actions**:
1. Checks package-lock.json for Block artifactory URLs
2. If found, runs `npm run prepare:deploy` 
3. Adds converted package-lock.json to current commit
4. Proceeds with push
5. If conversion fails, blocks push with error

**Output Example**:
```
🔍 Pre-push: Checking package-lock.json for artifactory URLs...
⚠️  Found Block artifactory URLs in package-lock.json
🔄 Converting to public npm registry URLs...
✅ Converted package-lock.json to use public npm registry
📤 Adding converted package-lock.json to this commit...
✅ Ready to push with public registry URLs
🚀 Proceeding with push...
```

## 🛠️ Development Setup

### New Team Members

1. **Clone repository**: `git clone <repo-url>`
2. **Setup hooks**: `npm run setup:hooks`
3. **Install dependencies**: `npm install` (uses Block artifactory)
4. **Start development**: `npm run dev`

### Local Development

- **npm install**: Uses Block artifactory (fast, private network)
- **npm run dev**: Development mode with demo credentials visible
- **npm run build**: Production build with credentials hidden
- **git push**: Automatic conversion to public registry URLs

## 🔍 Troubleshooting

### Hook Not Running
```bash
# Make hook executable
npm run setup:hooks

# Verify hook exists
ls -la .git/hooks/pre-push
```

### Conversion Fails
```bash
# Run conversion manually
npm run prepare:deploy

# Check for script errors
node scripts/prepare-deploy.js
```

### Registry Issues
```bash
# Check current registry
npm config get registry

# Should be: https://artifactory.global.square/artifactory/api/npm/square-npm/
```

## 📊 Registry URLs

### Block Artifactory (Local Development)
```
https://global.block-artifacts.com/artifactory/api/npm/square-npm/
```

### Public NPM (Deployment)  
```
https://registry.npmjs.org/
```

The conversion script performs a simple URL replacement while preserving all package versions and integrity hashes. 