import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import pg from 'pg';
import { runMigrations, performHealthCheck, applyMigration } from '../../scripts/migrate-production.js';

const { Pool } = pg;

// Test database configuration
const testDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'dev_password_123',
  database: 'money_monitor_test',
  ssl: false
};

describe('Migration System', () => {
  let pool: pg.Pool;

  beforeEach(async () => {
    // Create test database
    const adminPool = new Pool({
      ...testDbConfig,
      database: 'postgres' // Connect to default database to create test db
    });

    try {
      await adminPool.query('DROP DATABASE IF EXISTS money_monitor_test');
      await adminPool.query('CREATE DATABASE money_monitor_test');
    } catch (error) {
      console.warn('Could not create test database, it may already exist');
    } finally {
      await adminPool.end();
    }

    // Connect to test database
    pool = new Pool(testDbConfig);
  });

  afterEach(async () => {
    if (pool) {
      await pool.end();
    }
  });

  describe('Migration Tracking', () => {
    it('should create migration tracking table', async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64) NOT NULL,
          success BOOLEAN NOT NULL DEFAULT true
        );
      `);

      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'schema_migrations'
        );
      `);

      expect(result.rows[0].exists).toBe(true);
    });

    it('should track migration execution', async () => {
      // Create tracking table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64) NOT NULL,
          success BOOLEAN NOT NULL DEFAULT true
        );
      `);

      // Record a test migration
      await pool.query(`
        INSERT INTO schema_migrations (id, name, checksum, success)
        VALUES ('test_migration', 'Test Migration', 'abc123', true)
      `);

      const result = await pool.query(`
        SELECT * FROM schema_migrations WHERE id = 'test_migration'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('Test Migration');
      expect(result.rows[0].success).toBe(true);
    });
  });

  describe('Schema Creation', () => {
    it('should create users table with correct structure', async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      const columns = result.rows.map(row => ({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES'
      }));

      expect(columns).toContainEqual({ name: 'id', type: 'integer', nullable: false });
      expect(columns).toContainEqual({ name: 'email', type: 'character varying', nullable: false });
      expect(columns).toContainEqual({ name: 'password_hash', type: 'character varying', nullable: false });
    });

    it('should create investments table with portfolio support', async () => {
      // Create dependencies first
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS portfolios (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_portfolio_name_per_user UNIQUE (user_id, name)
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS investments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'investments'
        ORDER BY ordinal_position;
      `);

      const columnNames = result.rows.map(row => row.column_name);
      expect(columnNames).toContain('portfolio_id');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('date');
      expect(columnNames).toContain('value');
    });
  });

  describe('Data Integrity', () => {
    beforeEach(async () => {
      // Set up basic schema
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS portfolios (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_portfolio_name_per_user UNIQUE (user_id, name)
        );

        CREATE TABLE IF NOT EXISTS investments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    });

    it('should ensure users have default portfolios', async () => {
      // Create a test user
      const userResult = await pool.query(`
        INSERT INTO users (email, password_hash, name)
        VALUES ('test@example.com', 'hashedpassword', 'Test User')
        RETURNING id
      `);
      const userId = userResult.rows[0].id;

      // Create default portfolio
      await pool.query(`
        INSERT INTO portfolios (user_id, name)
        VALUES ($1, 'Main Portfolio')
      `, [userId]);

      // Verify user has default portfolio
      const portfolioResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM portfolios
        WHERE user_id = $1 AND name = 'Main Portfolio'
      `, [userId]);

      expect(parseInt(portfolioResult.rows[0].count)).toBe(1);
    });

    it('should prevent orphaned investments', async () => {
      // Create user and portfolio
      const userResult = await pool.query(`
        INSERT INTO users (email, password_hash, name)
        VALUES ('test@example.com', 'hashedpassword', 'Test User')
        RETURNING id
      `);
      const userId = userResult.rows[0].id;

      const portfolioResult = await pool.query(`
        INSERT INTO portfolios (user_id, name)
        VALUES ($1, 'Main Portfolio')
        RETURNING id
      `, [userId]);
      const portfolioId = portfolioResult.rows[0].id;

      // Create investment
      await pool.query(`
        INSERT INTO investments (user_id, portfolio_id, date, value)
        VALUES ($1, $2, '2024-01-01', 'encrypted_value')
      `, [userId, portfolioId]);

      // Check for orphaned investments
      const orphanedResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM investments
        WHERE portfolio_id IS NULL
      `);

      expect(parseInt(orphanedResult.rows[0].count)).toBe(0);
    });

    it('should maintain referential integrity', async () => {
      // Create user and portfolio
      const userResult = await pool.query(`
        INSERT INTO users (email, password_hash, name)
        VALUES ('test@example.com', 'hashedpassword', 'Test User')
        RETURNING id
      `);
      const userId = userResult.rows[0].id;

      const portfolioResult = await pool.query(`
        INSERT INTO portfolios (user_id, name)
        VALUES ($1, 'Main Portfolio')
        RETURNING id
      `, [userId]);
      const portfolioId = portfolioResult.rows[0].id;

      // Create investment
      await pool.query(`
        INSERT INTO investments (user_id, portfolio_id, date, value)
        VALUES ($1, $2, '2024-01-01', 'encrypted_value')
      `, [userId, portfolioId]);

      // Try to delete user (should cascade)
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      // Check that portfolio and investment were also deleted
      const portfolioCount = await pool.query('SELECT COUNT(*) as count FROM portfolios WHERE id = $1', [portfolioId]);
      const investmentCount = await pool.query('SELECT COUNT(*) as count FROM investments WHERE portfolio_id = $1', [portfolioId]);

      expect(parseInt(portfolioCount.rows[0].count)).toBe(0);
      expect(parseInt(investmentCount.rows[0].count)).toBe(0);
    });
  });

  describe('Migration Idempotency', () => {
    it('should handle repeated table creation safely', async () => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL
        );
      `;

      // Run the same SQL multiple times
      await pool.query(createTableSQL);
      await pool.query(createTableSQL);
      await pool.query(createTableSQL);

      // Should only have one table
      const result = await pool.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_name = 'test_table'
      `);

      expect(parseInt(result.rows[0].count)).toBe(1);
    });

    it('should handle repeated column addition safely', async () => {
      // Create base table
      await pool.query(`
        CREATE TABLE test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL
        );
      `);

      const addColumnSQL = `
        ALTER TABLE test_table
        ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      `;

      // Run the same ALTER multiple times
      await pool.query(addColumnSQL);
      await pool.query(addColumnSQL);
      await pool.query(addColumnSQL);

      // Should only have one email column
      const result = await pool.query(`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_name = 'test_table' AND column_name = 'email'
      `);

      expect(parseInt(result.rows[0].count)).toBe(1);
    });
  });

  describe('Transaction Safety', () => {
    it('should rollback failed migrations', async () => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Successful operation
        await client.query(`
          CREATE TABLE test_success (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255)
          );
        `);

        // Failing operation (syntax error)
        try {
          await client.query('INVALID SQL SYNTAX');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }

      } catch (error) {
        // Verify table was not created due to rollback
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'test_success'
          );
        `);

        expect(result.rows[0].exists).toBe(false);
      } finally {
        client.release();
      }
    });
  });

  describe('Health Checks', () => {
    it('should detect missing tables', async () => {
      // Perform health check without creating tables
      const healthCheck = await performHealthCheck(pool);

      expect(healthCheck.healthy).toBe(false);
      expect(healthCheck.failedChecks.length).toBeGreaterThan(0);

      const failedTableChecks = healthCheck.failedChecks.filter(check =>
        check.name.includes('Table') && check.name.includes('exists')
      );
      expect(failedTableChecks.length).toBeGreaterThan(0);
    });

    it('should pass health checks with complete schema', async () => {
      // Create complete schema
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64) NOT NULL,
          success BOOLEAN NOT NULL DEFAULT true
        );

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS portfolios (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_portfolio_name_per_user UNIQUE (user_id, name)
        );

        CREATE TABLE IF NOT EXISTS investments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(64) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create test user with portfolio
      const userResult = await pool.query(`
        INSERT INTO users (email, password_hash, name)
        VALUES ('test@example.com', 'hashedpassword', 'Test User')
        RETURNING id
      `);
      const userId = userResult.rows[0].id;

      await pool.query(`
        INSERT INTO portfolios (user_id, name)
        VALUES ($1, 'Main Portfolio')
      `, [userId]);

      // Perform health check
      const healthCheck = await performHealthCheck(pool);

      expect(healthCheck.healthy).toBe(true);
      expect(healthCheck.failedChecks.length).toBe(0);
    });
  });
});
