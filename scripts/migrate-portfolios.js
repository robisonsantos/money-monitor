import { readFileSync } from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Database configuration
function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
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

console.log('🔄 Starting portfolio migration...');

async function runMigration() {
  let pool;

  try {
    // Connect to database
    pool = new Pool(getDatabaseConfig());
    console.log('🔌 Connected to PostgreSQL database');

    // Test the connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');

    // Check if migration has already been run
    const portfolioTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'portfolios'
      );
    `);

    if (portfolioTableExists.rows[0].exists) {
      console.log('ℹ️  Portfolios table already exists, checking migration status...');

      // Check if portfolio_id column exists in investments table
      const portfolioColumnExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'investments'
          AND column_name = 'portfolio_id'
        );
      `);

      if (portfolioColumnExists.rows[0].exists) {
        console.log('✅ Migration appears to already be complete');

        // Verify data integrity
        const verificationResults = await verifyMigration(pool);
        if (verificationResults.success) {
          console.log('🎉 Migration verification successful');
          return;
        } else {
          console.log('⚠️  Migration verification found issues, attempting to fix...');
        }
      }
    }

    console.log('📋 Reading migration SQL...');
    const migrationSQL = readFileSync('./scripts/migrate-portfolios.sql', 'utf-8');

    console.log('🔄 Executing migration...');
    await pool.query(migrationSQL);

    console.log('✅ Migration SQL executed successfully');

    // Verify the migration
    console.log('🔍 Verifying migration...');
    const verificationResults = await verifyMigration(pool);

    if (verificationResults.success) {
      console.log('🎉 Portfolio migration completed successfully!');
      console.log(`✅ ${verificationResults.userCount} users with default portfolios`);
      console.log(`✅ ${verificationResults.investmentCount} investments migrated`);
      console.log(`✅ ${verificationResults.orphanedInvestments} orphaned investments (should be 0)`);
    } else {
      console.error('❌ Migration verification failed');
      console.error('Issues found:', verificationResults.issues);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('💡 Some components may already exist. Run verification separately.');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Database connection tips:');
      console.log('   1. Make sure Docker PostgreSQL is running: npm run db:status');
      console.log('   2. Check credentials in .env file');
      console.log('   3. Verify database is accessible: npm run db:connect');
    }

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

async function verifyMigration(pool) {
  const issues = [];

  try {
    // Check 1: All users should have a "Main Portfolio"
    const usersWithoutMainPortfolio = await pool.query(`
      SELECT u.id, u.email
      FROM users u
      LEFT JOIN portfolios p ON u.id = p.user_id AND p.name = 'Main Portfolio'
      WHERE p.id IS NULL
    `);

    if (usersWithoutMainPortfolio.rows.length > 0) {
      issues.push(`${usersWithoutMainPortfolio.rows.length} users missing "Main Portfolio"`);
    }

    // Check 2: No investments should be orphaned (without portfolio_id)
    const orphanedInvestments = await pool.query(`
      SELECT COUNT(*) as count
      FROM investments
      WHERE portfolio_id IS NULL
    `);

    const orphanedCount = parseInt(orphanedInvestments.rows[0].count);
    if (orphanedCount > 0) {
      issues.push(`${orphanedCount} investments without portfolio_id`);
    }

    // Check 3: All portfolios should belong to existing users
    const orphanedPortfolios = await pool.query(`
      SELECT COUNT(*) as count
      FROM portfolios p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE u.id IS NULL
    `);

    const orphanedPortfolioCount = parseInt(orphanedPortfolios.rows[0].count);
    if (orphanedPortfolioCount > 0) {
      issues.push(`${orphanedPortfolioCount} portfolios without valid users`);
    }

    // Get summary statistics
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const investmentCount = await pool.query('SELECT COUNT(*) as count FROM investments');

    return {
      success: issues.length === 0,
      issues,
      userCount: parseInt(userCount.rows[0].count),
      investmentCount: parseInt(investmentCount.rows[0].count),
      orphanedInvestments: orphanedCount
    };

  } catch (error) {
    return {
      success: false,
      issues: [`Verification error: ${error.message}`],
      userCount: 0,
      investmentCount: 0,
      orphanedInvestments: 0
    };
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
