import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
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

const MIGRATIONS_DIR = './migrations';
const MIGRATION_TABLE = 'schema_migrations';

class MigrationRunner {
  constructor() {
    this.pool = new Pool(getDatabaseConfig());
  }

  async init() {
    console.log('🔄 Initializing migration system...');

    try {
      // Test connection
      await this.pool.query('SELECT 1');
      console.log('✅ Database connection verified');

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
    } catch (error) {
      console.error('❌ Failed to initialize migration system:', error.message);
      throw error;
    }
  }

  async createMigrationsTable() {
    console.log('📋 Creating migrations table...');

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64),
        success BOOLEAN NOT NULL DEFAULT true
      );
    `);

    console.log('✅ Migrations table ready');
  }

  async getMigrationFiles() {
    try {
      const files = await readdir(MIGRATIONS_DIR);

      // Filter for .sql files and extract migration info
      const migrations = files
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const match = file.match(/^(\d{8}_\d{6})_(.+)\.sql$/);
          if (!match) {
            console.warn(`⚠️  Skipping invalid migration filename: ${file}`);
            return null;
          }

          return {
            id: match[1],
            name: match[2],
            filename: file,
            fullPath: join(MIGRATIONS_DIR, file)
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.id.localeCompare(b.id));

      return migrations;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📁 No migrations directory found, creating it...');
        await mkdir(MIGRATIONS_DIR, { recursive: true });
        return [];
      }
      throw error;
    }
  }

  async getExecutedMigrations() {
    const result = await this.pool.query(
      `SELECT id FROM ${MIGRATION_TABLE} WHERE success = true ORDER BY id`
    );
    return new Set(result.rows.map(row => row.id));
  }

  async calculateChecksum(content) {
    // Simple checksum using content length and hash
    const crypto = await import('crypto');
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 16);
  }

  async executeMigration(migration) {
    const client = await this.pool.connect();

    try {
      console.log(`📦 Executing migration: ${migration.id}_${migration.name}`);

      // Read migration file
      const content = await readFile(migration.fullPath, 'utf-8');
      const checksum = await this.calculateChecksum(content);

      // Start transaction
      await client.query('BEGIN');

      try {
        // Execute the migration SQL
        await client.query(content);

        // Record successful execution
        await client.query(
          `INSERT INTO ${MIGRATION_TABLE} (id, name, checksum, success) VALUES ($1, $2, $3, $4)`,
          [migration.id, migration.name, checksum, true]
        );

        await client.query('COMMIT');

        console.log(`✅ Migration completed: ${migration.id}_${migration.name}`);
        return { success: true };

      } catch (migrationError) {
        await client.query('ROLLBACK');

        // Record failed execution
        try {
          await client.query(
            `INSERT INTO ${MIGRATION_TABLE} (id, name, checksum, success) VALUES ($1, $2, $3, $4)`,
            [migration.id, migration.name, checksum, false]
          );
        } catch (recordError) {
          console.warn('⚠️  Could not record migration failure:', recordError.message);
        }

        console.error(`❌ Migration failed: ${migration.id}_${migration.name}`);
        console.error(`   Error: ${migrationError.message}`);

        // In production, provide more context for debugging
        if (process.env.NODE_ENV === 'production') {
          console.error(`   Migration file: ${migration.fullPath}`);
          console.error(`   Stack trace: ${migrationError.stack}`);
          console.error(`   Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Local connection'}`);
        }

        throw migrationError;
      }

    } finally {
      client.release();
    }
  }

  async runMigrations() {
    console.log('🚀 Starting migration run...');

    const allMigrations = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();

    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.has(migration.id)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations found');
      return { executed: 0, total: allMigrations.length };
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(migration => {
      console.log(`   • ${migration.id}_${migration.name}`);
    });

    let successCount = 0;

    for (const migration of pendingMigrations) {
      try {
        await this.executeMigration(migration);
        successCount++;
      } catch (error) {
        console.error(`💥 Migration pipeline stopped due to error in: ${migration.id}_${migration.name}`);

        // In production, provide deployment guidance
        if (process.env.NODE_ENV === 'production') {
          console.error('\n🚨 PRODUCTION MIGRATION FAILURE');
          console.error('This deployment has been aborted to prevent data corruption.');
          console.error('Next steps:');
          console.error('1. Review the migration SQL for syntax or constraint errors');
          console.error('2. Fix the issue and create a new migration if needed');
          console.error('3. Never modify executed migrations - always create new ones');
          console.error('4. Test migrations locally before deploying');
          console.error('\nFor help, see: migrations/README.md\n');
        }

        throw error;
      }
    }

    console.log(`\n🎉 Migration run completed!`);
    console.log(`   ✅ Executed: ${successCount}/${pendingMigrations.length} migrations`);
    console.log(`   📊 Total migrations: ${allMigrations.length}`);

    return { executed: successCount, total: allMigrations.length };
  }

  async getMigrationStatus() {
    const allMigrations = await this.getMigrationFiles();
    const result = await this.pool.query(
      `SELECT id, name, executed_at, success FROM ${MIGRATION_TABLE} ORDER BY id`
    );

    const executedMap = new Map(
      result.rows.map(row => [row.id, row])
    );

    console.log('\n📊 Migration Status:');
    console.log('='.repeat(80));
    console.log('ID              | Name                           | Status    | Executed At');
    console.log('-'.repeat(80));

    for (const migration of allMigrations) {
      const executed = executedMap.get(migration.id);

      if (executed) {
        const status = executed.success ? '✅ Success' : '❌ Failed ';
        const executedAt = executed.executed_at.toISOString().replace('T', ' ').substring(0, 19);
        console.log(`${migration.id} | ${migration.name.padEnd(30)} | ${status} | ${executedAt}`);
      } else {
        console.log(`${migration.id} | ${migration.name.padEnd(30)} | ⏳ Pending | -`);
      }
    }

    console.log('-'.repeat(80));

    const executedCount = allMigrations.filter(m => executedMap.has(m.id)).length;
    const pendingCount = allMigrations.length - executedCount;

    console.log(`Total: ${allMigrations.length} | Executed: ${executedCount} | Pending: ${pendingCount}`);

    return {
      total: allMigrations.length,
      executed: executedCount,
      pending: pendingCount,
      migrations: allMigrations.map(m => ({
        ...m,
        executed: executedMap.has(m.id),
        executedAt: executedMap.get(m.id)?.executed_at,
        success: executedMap.get(m.id)?.success
      }))
    };
  }

  async close() {
    await this.pool.end();
  }
}

async function main() {
  const runner = new MigrationRunner();

  try {
    await runner.init();

    const command = process.argv[2] || 'run';

    // Show environment context in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🏭 Running in PRODUCTION mode');
      console.log(`📊 Database: ${process.env.DATABASE_URL ? 'External' : 'Local'}`);
    }

    switch (command) {
      case 'run':
        await runner.runMigrations();
        break;

      case 'status':
        await runner.getMigrationStatus();
        break;

      case 'create':
        const name = process.argv[3];
        if (!name) {
          console.error('❌ Migration name required: npm run migrate create <name>');
          process.exit(1);
        }
        await createMigration(name);
        break;

      default:
        console.log('📖 Usage:');
        console.log('  npm run migrate         # Run pending migrations');
        console.log('  npm run migrate status  # Show migration status');
        console.log('  npm run migrate create <name>  # Create new migration file');
        break;
    }

  } catch (error) {
    console.error('💥 Migration system error:', error.message);

    if (process.env.NODE_ENV === 'production') {
      console.error('\n🚨 PRODUCTION BUILD FAILED');
      console.error('Migration error prevented deployment.');
      console.error('Check Netlify build logs for details.');
      console.error('Fix migrations and redeploy.\n');
    }

    process.exit(1);
  } finally {
    await runner.close();
  }
}

async function createMigration(name) {
  const { mkdir, writeFile } = await import('fs/promises');

  // Generate timestamp ID
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .substring(0, 15); // YYYYMMDD_HHMMSS

  // Clean name (remove special characters, convert to snake_case)
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const filename = `${timestamp}_${cleanName}.sql`;
  const filepath = join(MIGRATIONS_DIR, filename);

  // Create migrations directory if it doesn't exist
  try {
    await mkdir(MIGRATIONS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Create migration file template
  const template = `-- Migration: ${name}
-- ID: ${timestamp}
-- Description: Add description here

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );

-- Remember to use IF NOT EXISTS where appropriate for idempotency
`;

  await writeFile(filepath, template);

  console.log(`✅ Created migration: ${filename}`);
  console.log(`📝 Edit file: ${filepath}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MigrationRunner };
