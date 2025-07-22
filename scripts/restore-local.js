#!/usr/bin/env node

/**
 * Restore package-lock.json to use Block artifactory for local development
 * Usage: node scripts/restore-local.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_LOCK_PATH = path.join(__dirname, '..', 'package-lock.json');
const PUBLIC_NPM_PATTERN = /https:\/\/registry\.npmjs\.org\//g;
const BLOCK_ARTIFACTORY_REGISTRY = 'https://global.block-artifacts.com/artifactory/api/npm/square-npm/';

console.log('🔄 Restoring package-lock.json for local development...');

try {
  // Read package-lock.json
  const packageLockContent = fs.readFileSync(PACKAGE_LOCK_PATH, 'utf8');
  
  // Count current public npm URLs
  const publicUrlCount = (packageLockContent.match(PUBLIC_NPM_PATTERN) || []).length;
  
  if (publicUrlCount === 0) {
    console.log('✅ package-lock.json already uses Block artifactory URLs');
    console.log('🏠 Ready for local development');
    process.exit(0);
  }
  
  console.log(`📦 Found ${publicUrlCount} public npm registry URLs`);
  console.log('🔄 Converting to Block artifactory URLs...');
  
  // Replace all public npm registry URLs with Block artifactory
  const convertedContent = packageLockContent.replace(
    PUBLIC_NPM_PATTERN, 
    BLOCK_ARTIFACTORY_REGISTRY
  );
  
  // Write back the converted content
  fs.writeFileSync(PACKAGE_LOCK_PATH, convertedContent);
  
  console.log('✅ package-lock.json restored for local development');
  console.log('🏠 All dependency URLs now point to Block artifactory');
  console.log('⚡ Local npm installs will be faster on Block network');
  
} catch (error) {
  console.error('❌ Error restoring package-lock.json:', error.message);
  process.exit(1);
} 