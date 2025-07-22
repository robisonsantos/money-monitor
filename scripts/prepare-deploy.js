#!/usr/bin/env node

/**
 * Convert package-lock.json from Block artifactory to public npm registry
 * Usage: node scripts/prepare-deploy.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_LOCK_PATH = path.join(__dirname, '..', 'package-lock.json');
const BLOCK_ARTIFACTORY_PATTERN = /https:\/\/global\.block-artifacts\.com\/artifactory\/api\/npm\/square-npm\//g;
const PUBLIC_NPM_REGISTRY = 'https://registry.npmjs.org/';

console.log('🔄 Converting package-lock.json for deployment...');

try {
  // Read package-lock.json
  const packageLockContent = fs.readFileSync(PACKAGE_LOCK_PATH, 'utf8');
  
  // Replace all Block artifactory URLs with public npm registry
  const convertedContent = packageLockContent.replace(
    BLOCK_ARTIFACTORY_PATTERN, 
    PUBLIC_NPM_REGISTRY
  );
  
  // Write back the converted content
  fs.writeFileSync(PACKAGE_LOCK_PATH, convertedContent);
  
  console.log('✅ package-lock.json converted for public deployment');
  console.log('📦 All dependency URLs now point to public npm registry');
  
} catch (error) {
  console.error('❌ Error converting package-lock.json:', error.message);
  process.exit(1);
} 