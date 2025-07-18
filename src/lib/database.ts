import pg from 'pg';
import { dev } from '$app/environment';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { Pool } = pg;

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-byte-secret-key-here-for-dev!'; // In production, use a proper 32-byte key

// Encryption utilities
function encryptValue(value: number): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('investment-value', 'utf8'));
  
  let encrypted = cipher.update(value.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag, and encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptValue(encryptedValue: string): number {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedValue.split(':');
    
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted value format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('investment-value', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return parseFloat(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    // If decryption fails, it might be an unencrypted value from before migration
    // Try to parse as number directly
    const numValue = parseFloat(encryptedValue);
    if (!isNaN(numValue)) {
      return numValue;
    }
    throw new Error('Failed to decrypt investment value');
  }
}

// PostgreSQL connection configuration
const poolConfig: any = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'money_monitor',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Migration function to set up PostgreSQL schema
async function setupPostgreSQLSchema() {
  const client = await pool.connect();
  try {
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'investments')
    `;
    const result = await client.query(tablesQuery);
    const existingTables = result.rows.map(row => row.table_name);

    if (!existingTables.includes('users') || !existingTables.includes('investments')) {
      console.log('Setting up PostgreSQL schema...');
      
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create investments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS investments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_user_date ON investments(user_id, date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_investments_user_date_unique ON investments(user_id, date)`);

      // Create update trigger function
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);

      // Create triggers
      await client.query(`
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column()
      `);

      await client.query(`
        DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
        CREATE TRIGGER update_investments_updated_at 
            BEFORE UPDATE ON investments 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column()
      `);

      // Create default dev user if in development
      if (dev) {
        const defaultPassword = await bcrypt.hash('123456', 10);
        await client.query(`
          INSERT INTO users (email, password_hash, name) 
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO NOTHING
        `, ['admin@moneymonitor.com', defaultPassword, 'Admin User']);
        console.log('Default user created: admin@moneymonitor.com / 123456');
      }

      console.log('PostgreSQL schema setup completed');
    }
  } catch (error) {
    console.error('Error setting up PostgreSQL schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run schema setup on startup (in dev mode)
if (dev) {
  setupPostgreSQLSchema().catch(console.error);
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: number;
  user_id: number;
  date: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export const userDb = {
  // Create a new user
  createUser: async (email: string, password: string, name?: string): Promise<User> => {
    const client = await pool.connect();
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await client.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
        [email, passwordHash, name || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Authenticate user
  authenticateUser: async (email: string, password: string): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) return null;
      
      const isValid = await bcrypt.compare(password, user.password_hash);
      return isValid ? user : null;
    } finally {
      client.release();
    }
  },

  // Get user by email
  getUserByEmail: async (email: string): Promise<User | undefined> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User | undefined> => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
};

export const investmentDb = {
  // Add or update an investment (user-scoped)
  addInvestment: async (userId: number, date: string, value: number): Promise<void> => {
    const client = await pool.connect();
    try {
      const encryptedValue = encryptValue(value);
      await client.query(`
        INSERT INTO investments (user_id, date, value, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, date) 
        DO UPDATE SET value = $3, updated_at = CURRENT_TIMESTAMP
      `, [userId, date, encryptedValue]);
    } finally {
      client.release();
    }
  },

  // Get investment by date (user-scoped) - decrypts value after retrieval
  getInvestment: async (userId: number, date: string): Promise<Investment | undefined> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM investments WHERE user_id = $1 AND date = $2',
        [userId, date]
      );
      const investment = result.rows[0];
      if (investment) {
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split('T')[0] : investment.date;
        investment.value = decryptValue(investment.value);
      }
      return investment;
    } finally {
      client.release();
    }
  },

  // Get all investments (user-scoped) - decrypts values after retrieval
  getAllInvestments: async (userId: number): Promise<Investment[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM investments WHERE user_id = $1 ORDER BY date ASC',
        [userId]
      );
      return result.rows.map(investment => ({
        ...investment,
        date: investment.date instanceof Date ? investment.date.toISOString().split('T')[0] : investment.date,
        value: decryptValue(investment.value)
      }));
    } finally {
      client.release();
    }
  },

  // Get investments in date range (user-scoped) - decrypts values after retrieval
  getInvestmentsInRange: async (userId: number, startDate: string, endDate: string): Promise<Investment[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM investments WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC',
        [userId, startDate, endDate]
      );
      return result.rows.map(investment => ({
        ...investment,
        date: investment.date instanceof Date ? investment.date.toISOString().split('T')[0] : investment.date,
        value: decryptValue(investment.value)
      }));
    } finally {
      client.release();
    }
  },

  // Delete investment (user-scoped)
  deleteInvestment: async (userId: number, date: string): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM investments WHERE user_id = $1 AND date = $2', [userId, date]);
    } finally {
      client.release();
    }
  },

  // Get latest investment (user-scoped) - decrypts value after retrieval
  getLatestInvestment: async (userId: number): Promise<Investment | undefined> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM investments WHERE user_id = $1 ORDER BY date DESC LIMIT 1',
        [userId]
      );
      const investment = result.rows[0];
      if (investment) {
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split('T')[0] : investment.date;
        investment.value = decryptValue(investment.value);
      }
      return investment;
    } finally {
      client.release();
    }
  },

  // Get investments with pagination (newest first, user-scoped) - decrypts values after retrieval
  getInvestmentsPaginated: async (userId: number, limit: number, offset: number): Promise<Investment[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM investments WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3',
        [userId, limit, offset]
      );
      return result.rows.map(investment => ({
        ...investment,
        date: investment.date instanceof Date ? investment.date.toISOString().split('T')[0] : investment.date,
        value: decryptValue(investment.value)
      }));
    } finally {
      client.release();
    }
  },

  // Get investment with previous value for change calculation (user-scoped) - decrypts values after retrieval
  getInvestmentWithPrevious: async (userId: number, date: string): Promise<any> => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          curr.*,
          prev.value as prev_value
        FROM investments curr
        LEFT JOIN investments prev ON prev.user_id = curr.user_id AND prev.date = (
          SELECT MAX(date) FROM investments 
          WHERE user_id = curr.user_id AND date < curr.date
        )
        WHERE curr.user_id = $1 AND curr.date = $2
      `, [userId, date]);
      
      const investment = result.rows[0];
      if (investment) {
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split('T')[0] : investment.date;
        if (investment.value) investment.value = decryptValue(investment.value);
        if (investment.prev_value) investment.prev_value = decryptValue(investment.prev_value);
      }
      return investment;
    } finally {
      client.release();
    }
  },

  // Clear all investments for a user
  clearAllInvestments: async (userId: number): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM investments WHERE user_id = $1', [userId]);
    } finally {
      client.release();
    }
  },

  // Bulk insert investments (for CSV import, user-scoped) - encrypts values before storing
  bulkInsertInvestments: async (userId: number, investments: Array<{ date: string; value: number }>): Promise<number> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let insertedCount = 0;
      
      for (const investment of investments) {
        const encryptedValue = encryptValue(investment.value);
        await client.query(`
          INSERT INTO investments (user_id, date, value, updated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, date) 
          DO UPDATE SET value = $3, updated_at = CURRENT_TIMESTAMP
        `, [userId, investment.date, encryptedValue]);
        insertedCount++;
      }
      
      await client.query('COMMIT');
      return insertedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Close database connection
  close: async (): Promise<void> => {
    await pool.end();
  }
};

// Export migration function for testing
export { setupPostgreSQLSchema };

// Graceful shutdown
process.on('exit', () => pool.end());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));