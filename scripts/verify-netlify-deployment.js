import { readFileSync } from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Verification configuration
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'ENCRYPTION_KEY',
  'NODE_ENV'
];

const REQUIRED_TABLES = [
  'users',
  'investments',
  'sessions',
  'portfolios',
  'schema_migrations'
];

// Database configuration
function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'dev_password_123',
    database: process.env.DB_NAME || 'money_monitor',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

// Environment validation
function validateEnvironment() {
  console.log('🔍 Validating environment variables...');

  const missing = [];
  const issues = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Validate encryption key format
  if (process.env.ENCRYPTION_KEY) {
    const key = process.env.ENCRYPTION_KEY;
    if (key.length !== 64 || !/^[a-fA-F0-9]+$/.test(key)) {
      issues.push('ENCRYPTION_KEY must be a 64-character hexadecimal string');
    }
  }

  // Validate NODE_ENV
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    issues.push('NODE_ENV must be one of: development, production, test');
  }

  return {
    valid: missing.length === 0 && issues.length === 0,
    missing,
    issues
  };
}

// Database connectivity test
async function testDatabaseConnection(pool) {
  console.log('🔌 Testing database connection...');

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const { current_time, pg_version } = result.rows[0];

    console.log(`✅ Database connected successfully`);
    console.log(`⏰ Database time: ${current_time}`);
    console.log(`🐘 PostgreSQL version: ${pg_version.split(' ')[0]} ${pg_version.split(' ')[1]}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Schema validation
async function validateSchema(pool) {
  console.log('📋 Validating database schema...');

  const results = {
    tables: [],
    migrations: [],
    issues: []
  };

  try {
    // Check required tables
    for (const tableName of REQUIRED_TABLES) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [tableName]);

      const exists = result.rows[0].exists;
      results.tables.push({
        name: tableName,
        exists,
        status: exists ? 'PASS' : 'FAIL'
      });

      if (!exists) {
        results.issues.push(`Table '${tableName}' is missing`);
      }
    }

    // Check migration history
    try {
      const migrationResult = await pool.query(`
        SELECT id, name, executed_at, success
        FROM schema_migrations
        ORDER BY executed_at ASC
      `);

      results.migrations = migrationResult.rows;

      const failedMigrations = migrationResult.rows.filter(m => !m.success);
      if (failedMigrations.length > 0) {
        results.issues.push(`Found ${failedMigrations.length} failed migrations`);
      }

    } catch (error) {
      if (error.message.includes('relation "schema_migrations" does not exist')) {
        results.issues.push('Migration tracking table (schema_migrations) does not exist');
      } else {
        results.issues.push(`Failed to check migration history: ${error.message}`);
      }
    }

    return results;

  } catch (error) {
    results.issues.push(`Schema validation failed: ${error.message}`);
    return results;
  }
}

// Data integrity checks
async function validateDataIntegrity(pool) {
  console.log('🔍 Checking data integrity...');

  const checks = [];

  try {
    // Check for orphaned investments
    const orphanedInvestments = await pool.query(`
      SELECT COUNT(*) as count
      FROM investments
      WHERE portfolio_id IS NULL
    `);

    const orphanedCount = parseInt(orphanedInvestments.rows[0].count);
    checks.push({
      name: 'No orphaned investments',
      status: orphanedCount === 0 ? 'PASS' : 'FAIL',
      value: orphanedCount,
      expected: 0
    });

    // Check for users without default portfolio
    const usersWithoutPortfolio = await pool.query(`
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN portfolios p ON u.id = p.user_id AND p.name = 'Main Portfolio'
      WHERE p.id IS NULL
    `);

    const usersWithoutPortfolioCount = parseInt(usersWithoutPortfolio.rows[0].count);
    checks.push({
      name: 'All users have default portfolio',
      status: usersWithoutPortfolioCount === 0 ? 'PASS' : 'FAIL',
      value: usersWithoutPortfolioCount,
      expected: 0
    });

    // Check for orphaned portfolios
    const orphanedPortfolios = await pool.query(`
      SELECT COUNT(*) as count
      FROM portfolios p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE u.id IS NULL
    `);

    const orphanedPortfolioCount = parseInt(orphanedPortfolios.rows[0].count);
    checks.push({
      name: 'No orphaned portfolios',
      status: orphanedPortfolioCount === 0 ? 'PASS' : 'FAIL',
      value: orphanedPortfolioCount,
      expected: 0
    });

    // Check for expired sessions
    const expiredSessions = await pool.query(`
      SELECT COUNT(*) as count
      FROM sessions
      WHERE expires_at < NOW()
    `);

    const expiredSessionCount = parseInt(expiredSessions.rows[0].count);
    checks.push({
      name: 'Expired sessions check',
      status: 'INFO',
      value: expiredSessionCount,
      note: 'Expired sessions will be cleaned up automatically'
    });

    // Summary statistics
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM portfolios) as portfolio_count,
        (SELECT COUNT(*) FROM investments) as investment_count,
        (SELECT COUNT(*) FROM sessions WHERE expires_at > NOW()) as active_session_count
    `);

    const { user_count, portfolio_count, investment_count, active_session_count } = stats.rows[0];

    return {
      checks,
      statistics: {
        users: parseInt(user_count),
        portfolios: parseInt(portfolio_count),
        investments: parseInt(investment_count),
        activeSessions: parseInt(active_session_count)
      },
      healthy: checks.filter(c => c.status === 'FAIL').length === 0
    };

  } catch (error) {
    return {
      checks: [],
      statistics: {},
      healthy: false,
      error: error.message
    };
  }
}

// Application functionality test
async function testApplicationFunctionality(pool) {
  console.log('🧪 Testing application functionality...');

  const tests = [];

  try {
    // Test encryption key availability
    try {
      const crypto = require('crypto');
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || '', 'salt', 32);
      tests.push({
        name: 'Encryption key derivation',
        status: 'PASS',
        note: 'Encryption key can be derived successfully'
      });
    } catch (error) {
      tests.push({
        name: 'Encryption key derivation',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test basic database operations
    try {
      await pool.query('BEGIN');

      // Test insert (will be rolled back)
      const testResult = await pool.query(`
        INSERT INTO schema_migrations (id, name, checksum, success)
        VALUES ('test_migration', 'Test Migration', 'test_checksum', true)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name
        RETURNING id
      `);

      tests.push({
        name: 'Database write operations',
        status: 'PASS',
        note: 'Can perform insert/update operations'
      });

      await pool.query('ROLLBACK');

    } catch (error) {
      await pool.query('ROLLBACK');
      tests.push({
        name: 'Database write operations',
        status: 'FAIL',
        error: error.message
      });
    }

    return {
      tests,
      allPassed: tests.filter(t => t.status === 'FAIL').length === 0
    };

  } catch (error) {
    return {
      tests: [],
      allPassed: false,
      error: error.message
    };
  }
}

// Main verification function
async function verifyDeployment() {
  const startTime = Date.now();
  console.log('🚀 Starting Netlify deployment verification...');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Netlify Site: ${process.env.NETLIFY_SITE_NAME || 'Unknown'}`);
  console.log(`📦 Deploy ID: ${process.env.DEPLOY_ID || 'Unknown'}`);

  let overallSuccess = true;
  let pool;

  try {
    // Step 1: Environment validation
    console.log('\n' + '='.repeat(50));
    console.log('STEP 1: Environment Validation');
    console.log('='.repeat(50));

    const envValidation = validateEnvironment();

    if (!envValidation.valid) {
      overallSuccess = false;
      console.error('❌ Environment validation failed');

      if (envValidation.missing.length > 0) {
        console.error('Missing environment variables:');
        envValidation.missing.forEach(var_ => console.error(`  - ${var_}`));
      }

      if (envValidation.issues.length > 0) {
        console.error('Environment issues:');
        envValidation.issues.forEach(issue => console.error(`  - ${issue}`));
      }
    } else {
      console.log('✅ Environment validation passed');
    }

    // Step 2: Database connection
    console.log('\n' + '='.repeat(50));
    console.log('STEP 2: Database Connection');
    console.log('='.repeat(50));

    pool = new Pool(getDatabaseConfig());
    const connectionTest = await testDatabaseConnection(pool);

    if (!connectionTest.success) {
      overallSuccess = false;
      console.error('❌ Database connection failed');
      console.error(`Error: ${connectionTest.error}`);
    }

    // Step 3: Schema validation
    console.log('\n' + '='.repeat(50));
    console.log('STEP 3: Schema Validation');
    console.log('='.repeat(50));

    const schemaValidation = await validateSchema(pool);

    console.log('📋 Table Status:');
    schemaValidation.tables.forEach(table => {
      const icon = table.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${table.name}: ${table.status}`);
    });

    if (schemaValidation.migrations.length > 0) {
      console.log('\n📊 Migration History:');
      schemaValidation.migrations.forEach(migration => {
        const icon = migration.success ? '✅' : '❌';
        const date = new Date(migration.executed_at).toISOString();
        console.log(`${icon} ${migration.id}: ${migration.name} (${date})`);
      });
    }

    if (schemaValidation.issues.length > 0) {
      overallSuccess = false;
      console.error('\n❌ Schema validation issues:');
      schemaValidation.issues.forEach(issue => console.error(`  - ${issue}`));
    } else {
      console.log('\n✅ Schema validation passed');
    }

    // Step 4: Data integrity
    console.log('\n' + '='.repeat(50));
    console.log('STEP 4: Data Integrity');
    console.log('='.repeat(50));

    const integrityCheck = await validateDataIntegrity(pool);

    if (integrityCheck.error) {
      overallSuccess = false;
      console.error(`❌ Data integrity check failed: ${integrityCheck.error}`);
    } else {
      console.log('🔍 Integrity Checks:');
      integrityCheck.checks.forEach(check => {
        const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : 'ℹ️';
        console.log(`${icon} ${check.name}: ${check.status}`);
        if (check.status === 'FAIL') {
          console.log(`   └─ Expected: ${check.expected}, Found: ${check.value}`);
        }
        if (check.note) {
          console.log(`   └─ ${check.note}`);
        }
      });

      console.log('\n📊 Database Statistics:');
      Object.entries(integrityCheck.statistics).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });

      if (!integrityCheck.healthy) {
        overallSuccess = false;
        console.error('❌ Data integrity issues detected');
      } else {
        console.log('✅ Data integrity validation passed');
      }
    }

    // Step 5: Application functionality
    console.log('\n' + '='.repeat(50));
    console.log('STEP 5: Application Functionality');
    console.log('='.repeat(50));

    const functionalityTest = await testApplicationFunctionality(pool);

    if (functionalityTest.error) {
      overallSuccess = false;
      console.error(`❌ Functionality test failed: ${functionalityTest.error}`);
    } else {
      console.log('🧪 Functionality Tests:');
      functionalityTest.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${test.name}: ${test.status}`);
        if (test.note) {
          console.log(`   └─ ${test.note}`);
        }
        if (test.error) {
          console.log(`   └─ Error: ${test.error}`);
        }
      });

      if (!functionalityTest.allPassed) {
        overallSuccess = false;
        console.error('❌ Some functionality tests failed');
      } else {
        console.log('✅ All functionality tests passed');
      }
    }

    // Final summary
    const duration = Date.now() - startTime;
    console.log('\n' + '='.repeat(50));
    console.log('DEPLOYMENT VERIFICATION SUMMARY');
    console.log('='.repeat(50));

    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`🎯 Overall Status: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 Deployment: ${process.env.DEPLOY_ID || 'local'}`);

    if (overallSuccess) {
      console.log('\n🎉 Deployment verification completed successfully!');
      console.log('✅ Application is ready for production use');
      console.log('🚀 All systems are operational');

      // Output success for CI/CD
      if (process.env.NETLIFY) {
        console.log('\n::set-output name=verification_status::success');
        console.log('::set-output name=verification_message::All checks passed');
      }

      process.exit(0);
    } else {
      console.log('\n💥 Deployment verification failed!');
      console.log('🚨 Issues detected that require attention');
      console.log('🔧 Please review the errors above and fix before deploying');

      // Output failure for CI/CD
      if (process.env.NETLIFY) {
        console.log('\n::set-output name=verification_status::failed');
        console.log('::set-output name=verification_message::Verification checks failed');
      }

      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal verification error:', error.message);
    console.error('🔍 Stack trace:', error.stack);

    if (process.env.NETLIFY) {
      console.log('\n::set-output name=verification_status::error');
      console.log(`::set-output name=verification_message::Fatal error: ${error.message}`);
    }

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Handle process signals gracefully
process.on('SIGINT', async () => {
  console.log('\n⚠️  Verification interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Verification terminated by system');
  process.exit(1);
});

// Export for testing
export { verifyDeployment, validateEnvironment, validateSchema, validateDataIntegrity };

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyDeployment().catch(error => {
    console.error('💥 Verification runner crashed:', error);
    process.exit(1);
  });
}
