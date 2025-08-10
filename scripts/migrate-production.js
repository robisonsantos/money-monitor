import { readFileSync } from "fs";
import { createRequire } from "module";
import pg from "pg";
import dotenv from "dotenv";

// Create require function for ES modules
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Combined migration - ensures all tables are created properly
const COMBINED_MIGRATION_SQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_portfolio_name_per_user UNIQUE (user_id, name)
);

-- Create investments table with portfolio support
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add portfolio_id column if it doesn't exist (for existing installations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'investments' AND column_name = 'portfolio_id'
    ) THEN
        ALTER TABLE investments ADD COLUMN portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investments_user_date ON investments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_name ON portfolios(name);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_date ON investments(portfolio_id, date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create "Main Portfolio" for all existing users who don't have one
INSERT INTO portfolios (user_id, name, created_at, updated_at)
SELECT
    id as user_id,
    'Main Portfolio' as name,
    created_at,
    updated_at
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM portfolios WHERE portfolios.user_id = users.id AND portfolios.name = 'Main Portfolio'
);

-- Update all existing investments to reference "Main Portfolio" if they don't have a portfolio
UPDATE investments
SET portfolio_id = (
    SELECT portfolios.id
    FROM portfolios
    WHERE portfolios.user_id = investments.user_id
    AND portfolios.name = 'Main Portfolio'
)
WHERE portfolio_id IS NULL;

-- Make portfolio_id NOT NULL after migration (only if all investments have portfolio_id)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM investments WHERE portfolio_id IS NULL) THEN
        ALTER TABLE investments ALTER COLUMN portfolio_id SET NOT NULL;
    END IF;
END $$;

-- Create function to automatically create "Main Portfolio" for new users
CREATE OR REPLACE FUNCTION create_default_portfolio()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO portfolios (user_id, name, created_at, updated_at)
    VALUES (NEW.id, 'Main Portfolio', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create default portfolio for new users
DROP TRIGGER IF EXISTS create_default_portfolio_trigger ON users;
CREATE TRIGGER create_default_portfolio_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_portfolio();
`;

// Migration configuration
const MIGRATIONS = [
  {
    id: "complete_schema",
    name: "Complete Money Monitor Schema with Portfolios",
    sql: COMBINED_MIGRATION_SQL,
    checkQuery: `
      SELECT
        (SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        )) AND
        (SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'portfolios'
        )) AND
        (SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'investments'
        )) AND
        (SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'sessions'
        )) AND
        (SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'investments' AND column_name = 'portfolio_id'
        )) as schema_complete;
    `,
  },
];

// Database configuration
function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "dev_password_123",
    database: process.env.DB_NAME || "money_monitor",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  };
}

// Migration state tracking
async function createMigrationTable(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64) NOT NULL,
        success BOOLEAN NOT NULL DEFAULT true
      );
    `);
    console.log("✅ Migration tracking table ready");
  } catch (error) {
    console.error("❌ Failed to create migration table:", error.message);
    throw error;
  }
}

// Calculate checksum for migration file
function calculateChecksum(content) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Check if migration has been applied
async function isMigrationApplied(pool, migrationId) {
  try {
    const result = await pool.query("SELECT * FROM schema_migrations WHERE id = $1 AND success = true", [migrationId]);
    return result.rows.length > 0;
  } catch (error) {
    // If table doesn't exist, migration hasn't been applied
    if (error.message.includes('relation "schema_migrations" does not exist')) {
      return false;
    }
    throw error;
  }
}

// Record migration execution
async function recordMigration(pool, migration, checksum, success = true) {
  try {
    await pool.query(
      `
      INSERT INTO schema_migrations (id, name, checksum, success, executed_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        checksum = EXCLUDED.checksum,
        success = EXCLUDED.success,
        executed_at = EXCLUDED.executed_at
    `,
      [migration.id, migration.name, checksum, success],
    );
  } catch (error) {
    console.error("⚠️  Failed to record migration:", error.message);
    // Don't throw - migration succeeded even if recording failed
  }
}

// Verify migration state using business logic
async function verifyMigrationState(pool, migration) {
  if (!migration.checkQuery) {
    return { verified: true, message: "No verification query provided" };
  }

  try {
    const result = await pool.query(migration.checkQuery);
    // Handle both boolean and nested object responses
    const verified = result.rows[0]?.exists === true || result.rows[0]?.schema_complete === true;

    return {
      verified,
      message: verified
        ? "Migration state verified successfully"
        : "Migration state verification failed - database may be in inconsistent state",
    };
  } catch (error) {
    return {
      verified: false,
      message: `Verification failed: ${error.message}`,
    };
  }
}

// Apply a single migration with full safety checks
async function applyMigration(pool, migration) {
  console.log(`🔄 Processing migration: ${migration.name}`);

  try {
    // Check if already applied
    const alreadyApplied = await isMigrationApplied(pool, migration.id);
    if (alreadyApplied) {
      console.log(`✅ Migration '${migration.name}' already applied, skipping`);
      return { success: true, skipped: true };
    }

    // Verify current state
    const preVerification = await verifyMigrationState(pool, migration);
    if (preVerification.verified) {
      console.log(`✅ Migration '${migration.name}' already in correct state, recording as applied`);
      const dummyChecksum = calculateChecksum("already-applied");
      await recordMigration(pool, migration, dummyChecksum, true);
      return { success: true, skipped: true };
    }

    // Get migration SQL
    let migrationSQL;
    if (migration.sql) {
      // Use inline SQL
      migrationSQL = migration.sql;
    } else if (migration.file) {
      // Read from file
      try {
        migrationSQL = readFileSync(migration.file, "utf-8");
      } catch (error) {
        throw new Error(`Failed to read migration file ${migration.file}: ${error.message}`);
      }
    } else {
      throw new Error(`Migration ${migration.id} has neither sql nor file defined`);
    }

    const checksum = calculateChecksum(migrationSQL);
    console.log(`📄 Migration prepared: ${migration.name} (checksum: ${checksum.substring(0, 8)}...)`);

    // Start transaction for atomic migration
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      console.log("🔒 Transaction started");

      // Apply migration
      await client.query(migrationSQL);
      console.log("⚡ Migration SQL executed");

      // Verify post-migration state
      const postVerification = await verifyMigrationState(pool, migration);
      if (!postVerification.verified) {
        throw new Error(`Post-migration verification failed: ${postVerification.message}`);
      }

      // Record successful migration
      await client.query(
        `
        INSERT INTO schema_migrations (id, name, checksum, success, executed_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          checksum = EXCLUDED.checksum,
          success = EXCLUDED.success,
          executed_at = EXCLUDED.executed_at
      `,
        [migration.id, migration.name, checksum, true],
      );

      await client.query("COMMIT");
      console.log("✅ Transaction committed");

      console.log(`🎉 Migration '${migration.name}' applied successfully`);
      return { success: true, skipped: false };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("🔄 Transaction rolled back");

      // Record failed migration
      try {
        await recordMigration(pool, migration, checksum, false);
      } catch (recordError) {
        console.error("⚠️  Failed to record migration failure:", recordError.message);
      }

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`❌ Migration '${migration.name}' failed: ${error.message}`);
    return { success: false, error: error.message, skipped: false };
  }
}

// Comprehensive database health check
async function performHealthCheck(pool) {
  console.log("🏥 Performing database health check...");

  const checks = [];

  try {
    // Basic connectivity
    await pool.query("SELECT 1");
    checks.push({ name: "Database connectivity", status: "PASS" });

    // Check required tables exist
    const tables = ["users", "investments", "sessions", "portfolios", "schema_migrations"];
    for (const table of tables) {
      const result = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `,
        [table],
      );

      const exists = result.rows[0].exists;
      checks.push({
        name: `Table '${table}' exists`,
        status: exists ? "PASS" : "FAIL",
      });
    }

    // Check data integrity
    const orphanedInvestments = await pool.query(`
      SELECT COUNT(*) as count
      FROM investments
      WHERE portfolio_id IS NULL
    `);

    const orphanedCount = parseInt(orphanedInvestments.rows[0].count);
    checks.push({
      name: "No orphaned investments",
      status: orphanedCount === 0 ? "PASS" : "FAIL",
      details: orphanedCount > 0 ? `Found ${orphanedCount} orphaned investments` : undefined,
    });

    // Check each user has a default portfolio
    const usersWithoutPortfolio = await pool.query(`
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN portfolios p ON u.id = p.user_id AND p.name = 'Main Portfolio'
      WHERE p.id IS NULL
    `);

    const usersWithoutPortfolioCount = parseInt(usersWithoutPortfolio.rows[0].count);
    checks.push({
      name: "All users have default portfolio",
      status: usersWithoutPortfolioCount === 0 ? "PASS" : "FAIL",
      details:
        usersWithoutPortfolioCount > 0
          ? `Found ${usersWithoutPortfolioCount} users without default portfolio`
          : undefined,
    });

    // Summary
    const failedChecks = checks.filter((check) => check.status === "FAIL");
    const healthStatus = failedChecks.length === 0 ? "HEALTHY" : "UNHEALTHY";

    console.log("\n📊 Health Check Results:");
    checks.forEach((check) => {
      const icon = check.status === "PASS" ? "✅" : "❌";
      console.log(`${icon} ${check.name}: ${check.status}`);
      if (check.details) {
        console.log(`   └─ ${check.details}`);
      }
    });

    console.log(`\n🏥 Overall Database Health: ${healthStatus}`);

    return {
      healthy: healthStatus === "HEALTHY",
      checks,
      failedChecks,
    };
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return {
      healthy: false,
      checks: [],
      failedChecks: [{ name: "Health check execution", status: "FAIL", details: error.message }],
    };
  }
}

// Main migration runner
async function runMigrations() {
  const startTime = Date.now();
  console.log("🚀 Starting automated production migration...");
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔧 Build Context: ${process.env.NETLIFY ? "Netlify" : "Local"}`);

  let pool;
  let overallSuccess = true;
  const results = [];

  try {
    // Connect to database
    console.log("\n🔌 Connecting to database...");
    const dbConfig = getDatabaseConfig();
    console.log(`🔗 Database host: ${dbConfig.host || "from connection string"}`);
    pool = new Pool(dbConfig);

    // Test connection with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout after 30 seconds")), 30000),
    );

    await Promise.race([pool.query("SELECT NOW()"), timeoutPromise]);
    console.log("✅ Database connection established");

    // Ensure migration tracking table exists
    await createMigrationTable(pool);

    // Run migrations in order
    console.log("\n📋 Applying migrations...");
    for (const migration of MIGRATIONS) {
      const result = await applyMigration(pool, migration);
      results.push({ migration: migration.name, ...result });

      if (!result.success) {
        overallSuccess = false;
        console.error(`💥 Critical error in migration '${migration.name}', stopping here`);
        break;
      }
    }

    // Perform comprehensive health check
    console.log("\n🏥 Running post-migration health check...");
    const healthCheck = await performHealthCheck(pool);

    if (!healthCheck.healthy) {
      overallSuccess = false;
      console.error("❌ Post-migration health check failed");
      console.error("🚨 Database may be in an inconsistent state");
    }

    // Final summary
    const duration = Date.now() - startTime;
    console.log("\n📊 Migration Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    results.forEach((result) => {
      const icon = result.success ? (result.skipped ? "⏭️ " : "✅") : "❌";
      const status = result.success ? (result.skipped ? "SKIPPED" : "SUCCESS") : "FAILED";
      console.log(`${icon} ${result.migration}: ${status}`);
      if (result.error) {
        console.log(`   └─ Error: ${result.error}`);
      }
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`🎯 Overall Status: ${overallSuccess ? "SUCCESS" : "FAILED"}`);
    console.log(`🏥 Database Health: ${healthCheck.healthy ? "HEALTHY" : "UNHEALTHY"}`);

    if (overallSuccess && healthCheck.healthy) {
      console.log("\n🎉 All migrations completed successfully!");
      console.log("✅ Database is ready for production use");
      process.exit(0);
    } else {
      console.log("\n💥 Migration process completed with errors");
      console.log("🚨 Manual intervention may be required");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal migration error:", error.message);
    console.error("🔍 Stack trace:", error.stack);

    if (error.message.includes("password authentication failed")) {
      console.log("\n💡 Database connection troubleshooting:");
      console.log("   1. Verify DATABASE_URL environment variable is set correctly");
      console.log("   2. Check database credentials and permissions");
      console.log("   3. Verify database server is accessible from this environment");
      console.log("   4. For managed databases, verify SSL settings");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("timeout")) {
      console.log("\n💡 Network troubleshooting:");
      console.log("   1. Check if DATABASE_URL hostname is correct");
      console.log("   2. Verify network connectivity to database");
      console.log("   3. Check if database accepts connections from Netlify");
    }

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Handle process signals gracefully
process.on("SIGINT", async () => {
  console.log("\n⚠️  Migration interrupted by user");
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("\n⚠️  Migration terminated by system");
  process.exit(1);
});

// Handle unhandled errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Export for testing
export { runMigrations, performHealthCheck, applyMigration };

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch((error) => {
    console.error("💥 Migration runner crashed:", error);
    process.exit(1);
  });
}
