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

async function validateDatabaseSetup() {
  console.log('🔍 Validating database setup...');

  let pool;
  let allChecks = [];
  let failedChecks = [];

  try {
    // Connect to database
    pool = new Pool(getDatabaseConfig());
    console.log('🔌 Connected to PostgreSQL database');

    // Test connection
    await pool.query('SELECT 1');
    allChecks.push({ name: 'Database connection', status: 'PASS' });

    // Check required tables exist
    const requiredTables = ['users', 'portfolios', 'investments', 'sessions'];

    for (const tableName of requiredTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [tableName]);

      if (result.rows[0].exists) {
        allChecks.push({ name: `Table '${tableName}' exists`, status: 'PASS' });
      } else {
        allChecks.push({ name: `Table '${tableName}' exists`, status: 'FAIL' });
        failedChecks.push(`Missing table: ${tableName}`);
      }
    }

    // Check table structures
    const tableChecks = [
      {
        table: 'users',
        columns: ['id', 'email', 'name', 'password_hash', 'created_at', 'updated_at']
      },
      {
        table: 'portfolios',
        columns: ['id', 'user_id', 'name', 'created_at', 'updated_at']
      },
      {
        table: 'investments',
        columns: ['id', 'user_id', 'portfolio_id', 'date', 'value', 'created_at', 'updated_at']
      },
      {
        table: 'sessions',
        columns: ['id', 'user_id', 'token', 'expires_at', 'created_at', 'updated_at']
      }
    ];

    for (const check of tableChecks) {
      try {
        const result = await pool.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [check.table]);

        const actualColumns = result.rows.map(row => row.column_name);
        const missingColumns = check.columns.filter(col => !actualColumns.includes(col));

        if (missingColumns.length === 0) {
          allChecks.push({ name: `Table '${check.table}' structure`, status: 'PASS' });
        } else {
          allChecks.push({ name: `Table '${check.table}' structure`, status: 'FAIL' });
          failedChecks.push(`Table ${check.table} missing columns: ${missingColumns.join(', ')}`);
        }
      } catch (error) {
        allChecks.push({ name: `Table '${check.table}' structure`, status: 'FAIL' });
        failedChecks.push(`Error checking table ${check.table}: ${error.message}`);
      }
    }

    // Check foreign key constraints
    const fkChecks = [
      { table: 'portfolios', column: 'user_id', references: 'users(id)' },
      { table: 'investments', column: 'user_id', references: 'users(id)' },
      { table: 'investments', column: 'portfolio_id', references: 'portfolios(id)' },
      { table: 'sessions', column: 'user_id', references: 'users(id)' }
    ];

    for (const fk of fkChecks) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = $1
            AND kcu.column_name = $2
            AND tc.constraint_type = 'FOREIGN KEY'
          );
        `, [fk.table, fk.column]);

        if (result.rows[0].exists) {
          allChecks.push({ name: `FK: ${fk.table}.${fk.column} → ${fk.references}`, status: 'PASS' });
        } else {
          allChecks.push({ name: `FK: ${fk.table}.${fk.column} → ${fk.references}`, status: 'FAIL' });
          failedChecks.push(`Missing foreign key: ${fk.table}.${fk.column} → ${fk.references}`);
        }
      } catch (error) {
        allChecks.push({ name: `FK: ${fk.table}.${fk.column} → ${fk.references}`, status: 'FAIL' });
        failedChecks.push(`Error checking FK ${fk.table}.${fk.column}: ${error.message}`);
      }
    }

    // Check unique constraints
    const uniqueChecks = [
      { table: 'users', column: 'email' },
      { table: 'portfolios', columns: ['user_id', 'name'] },
      { table: 'investments', columns: ['portfolio_id', 'date'] },
      { table: 'sessions', column: 'token' }
    ];

    for (const unique of uniqueChecks) {
      try {
        const columnList = Array.isArray(unique.columns) ? unique.columns.join(', ') : unique.column;
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_name = $1
            AND constraint_type = 'UNIQUE'
          );
        `, [unique.table]);

        if (result.rows[0].exists) {
          allChecks.push({ name: `Unique constraint: ${unique.table}(${columnList})`, status: 'PASS' });
        } else {
          allChecks.push({ name: `Unique constraint: ${unique.table}(${columnList})`, status: 'FAIL' });
          failedChecks.push(`Missing unique constraint: ${unique.table}(${columnList})`);
        }
      } catch (error) {
        allChecks.push({ name: `Unique constraint: ${unique.table}`, status: 'FAIL' });
        failedChecks.push(`Error checking unique constraint ${unique.table}: ${error.message}`);
      }
    }

    // Check indexes
    const indexChecks = [
      'idx_users_email',
      'idx_portfolios_user_id',
      'idx_investments_portfolio_id',
      'idx_investments_date',
      'idx_sessions_token'
    ];

    for (const indexName of indexChecks) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE indexname = $1
          );
        `, [indexName]);

        if (result.rows[0].exists) {
          allChecks.push({ name: `Index: ${indexName}`, status: 'PASS' });
        } else {
          allChecks.push({ name: `Index: ${indexName}`, status: 'FAIL' });
          failedChecks.push(`Missing index: ${indexName}`);
        }
      } catch (error) {
        allChecks.push({ name: `Index: ${indexName}`, status: 'FAIL' });
        failedChecks.push(`Error checking index ${indexName}: ${error.message}`);
      }
    }

    // Check triggers
    const triggerChecks = [
      'update_users_updated_at',
      'update_portfolios_updated_at',
      'update_investments_updated_at',
      'update_sessions_updated_at'
    ];

    for (const triggerName of triggerChecks) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.triggers
            WHERE trigger_name = $1
          );
        `, [triggerName]);

        if (result.rows[0].exists) {
          allChecks.push({ name: `Trigger: ${triggerName}`, status: 'PASS' });
        } else {
          allChecks.push({ name: `Trigger: ${triggerName}`, status: 'FAIL' });
          failedChecks.push(`Missing trigger: ${triggerName}`);
        }
      } catch (error) {
        allChecks.push({ name: `Trigger: ${triggerName}`, status: 'FAIL' });
        failedChecks.push(`Error checking trigger ${triggerName}: ${error.message}`);
      }
    }

    // Data integrity checks
    try {
      // Check for orphaned portfolios
      const orphanedPortfolios = await pool.query(`
        SELECT COUNT(*) as count
        FROM portfolios p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE u.id IS NULL
      `);

      const orphanedPortfolioCount = parseInt(orphanedPortfolios.rows[0].count);
      if (orphanedPortfolioCount === 0) {
        allChecks.push({ name: 'No orphaned portfolios', status: 'PASS' });
      } else {
        allChecks.push({ name: 'No orphaned portfolios', status: 'FAIL' });
        failedChecks.push(`Found ${orphanedPortfolioCount} orphaned portfolios`);
      }

      // Check for orphaned investments
      const orphanedInvestments = await pool.query(`
        SELECT COUNT(*) as count
        FROM investments i
        LEFT JOIN portfolios p ON i.portfolio_id = p.id
        WHERE p.id IS NULL
      `);

      const orphanedInvestmentCount = parseInt(orphanedInvestments.rows[0].count);
      if (orphanedInvestmentCount === 0) {
        allChecks.push({ name: 'No orphaned investments', status: 'PASS' });
      } else {
        allChecks.push({ name: 'No orphaned investments', status: 'FAIL' });
        failedChecks.push(`Found ${orphanedInvestmentCount} orphaned investments`);
      }

      // Check for users without portfolios (if any users exist)
      const usersWithoutPortfolios = await pool.query(`
        SELECT COUNT(*) as count
        FROM users u
        LEFT JOIN portfolios p ON u.id = p.user_id
        WHERE p.id IS NULL
      `);

      const usersWithoutPortfolioCount = parseInt(usersWithoutPortfolios.rows[0].count);
      if (usersWithoutPortfolioCount === 0) {
        allChecks.push({ name: 'All users have portfolios', status: 'PASS' });
      } else {
        // This might be OK if no users exist yet
        const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
        const totalUserCount = parseInt(totalUsers.rows[0].count);

        if (totalUserCount === 0) {
          allChecks.push({ name: 'All users have portfolios', status: 'PASS', note: 'No users exist yet' });
        } else {
          allChecks.push({ name: 'All users have portfolios', status: 'WARN' });
          failedChecks.push(`Found ${usersWithoutPortfolioCount} users without portfolios`);
        }
      }

    } catch (error) {
      allChecks.push({ name: 'Data integrity checks', status: 'FAIL' });
      failedChecks.push(`Data integrity check error: ${error.message}`);
    }

    // Summary
    console.log('\n📋 Validation Results:');
    console.log('='.repeat(50));

    const passedChecks = allChecks.filter(check => check.status === 'PASS');
    const warnChecks = allChecks.filter(check => check.status === 'WARN');
    const failedChecksCount = allChecks.filter(check => check.status === 'FAIL');

    console.log(`✅ Passed: ${passedChecks.length}`);
    if (warnChecks.length > 0) {
      console.log(`⚠️  Warnings: ${warnChecks.length}`);
    }
    if (failedChecksCount.length > 0) {
      console.log(`❌ Failed: ${failedChecksCount.length}`);
    }

    // Show all checks
    console.log('\n📊 Detailed Results:');
    for (const check of allChecks) {
      const icon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
      const note = check.note ? ` (${check.note})` : '';
      console.log(`${icon} ${check.name}${note}`);
    }

    if (failedChecks.length > 0) {
      console.log('\n❌ Issues Found:');
      for (const issue of failedChecks) {
        console.log(`   • ${issue}`);
      }
      console.log('\n💡 To fix issues, try:');
      console.log('   npm run db:setup  # Manual schema setup');
      console.log('   npm run db:reset  # Reset and recreate database');
    }

    const isHealthy = failedChecks.length === 0;
    console.log(`\n${isHealthy ? '🎉' : '💥'} Database is ${isHealthy ? 'HEALTHY' : 'NOT HEALTHY'}`);

    if (isHealthy) {
      console.log('✅ Ready for development!');
      console.log('   npm run seed  # Add sample data');
      console.log('   npm run dev   # Start the application');
    }

    process.exit(isHealthy ? 0 : 1);

  } catch (error) {
    console.error('❌ Validation failed:', error.message);

    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 Database does not exist. Try:');
      console.log('   npm run db:start  # Start PostgreSQL');
      console.log('   npm run db:setup  # Create schema');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Authentication failed. Check:');
      console.log('   - Database is running: npm run db:status');
      console.log('   - Environment variables in .env file');
      console.log('   - Database credentials');
    } else if (error.message.includes('connection refused')) {
      console.log('\n💡 Connection refused. Try:');
      console.log('   - Start database: npm run db:start');
      console.log('   - Check port 5432: lsof -i :5432');
    }

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run validation
validateDatabaseSetup().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
