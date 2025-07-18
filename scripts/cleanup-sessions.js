#!/usr/bin/env node

import { sessionDb } from '../src/lib/database.js';

async function cleanupSessions() {
  console.log('Starting session cleanup...');
  
  try {
    await sessionDb.cleanupExpiredSessions();
    console.log('✅ Session cleanup completed successfully');
    
    const stats = sessionDb.getStats ? sessionDb.getStats() : null;
    if (stats) {
      console.log(`📊 Active sessions: ${stats.totalEntries}`);
    }
    
  } catch (error) {
    console.error('❌ Error during session cleanup:', error);
    process.exit(1);
  }
  
  // Close database connections
  try {
    await sessionDb.close ? await sessionDb.close() : null;
  } catch (error) {
    console.error('Warning: Error closing database connection:', error);
  }
  
  process.exit(0);
}

// Run cleanup
cleanupSessions(); 