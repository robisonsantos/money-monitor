import pg from 'pg';
import { dev } from '$app/environment';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { Pool } = pg;

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

// Validate encryption key
let ENCRYPTION_KEY: string = process.env.ENCRYPTION_KEY || '';
if (!ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY environment variable is required in production');
  }
  // Use development key only in development
  ENCRYPTION_KEY = 'your-32-byte-secret-key-here-for-dev!';
  console.warn('⚠️  Using default encryption key for development. Set ENCRYPTION_KEY environment variable.');
}

// Cache the derived key to avoid expensive scryptSync calls
let cachedKey: Buffer | null = null;
function getDerivedKey(): Buffer {
  if (!cachedKey) {
    cachedKey = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  }
  return cachedKey;
}

// Encryption utilities
function encryptValue(value: number): string {
  const iv = crypto.randomBytes(16);
  const key = getDerivedKey();
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
    const key = getDerivedKey(); // Use cached key instead of computing each time
    
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
  max: 10, // maximum number of clients in the pool
  min: 1, // minimum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 30000, // return an error after 30 seconds if connection could not be established
  acquireTimeoutMillis: 30000, // return an error after 30 seconds if a client cannot be acquired
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Test connection on startup
pool.on('connect', (client) => {
  if (dev) console.log('New PostgreSQL client connected');
});

// Add connection test
if (dev) {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting to PostgreSQL:', err);
    } else {
      console.log('PostgreSQL connection test successful');
      release();
    }
  });
}

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

    if (existingTables.length >= 2) {
      // Tables already exist, no need to set up schema
      return;
    }

    if (!existingTables.includes('users') || !existingTables.includes('investments')) {
      if (dev) console.log('Setting up PostgreSQL schema...');
      
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

      // Create sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(64) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_user_date ON investments(user_id, date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_investments_user_date_unique ON investments(user_id, date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`);

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

      await client.query(`
        DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
        CREATE TRIGGER update_sessions_updated_at 
            BEFORE UPDATE ON sessions 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column()
      `);

      // Create default dev user ONLY in explicit development mode
      if (dev && process.env.NODE_ENV === 'development') {
        const defaultPassword = await bcrypt.hash('123456', 10);
        await client.query(`
          INSERT INTO users (email, password_hash, name) 
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO NOTHING
        `, ['admin@moneymonitor.com', defaultPassword, 'Admin User']);
        console.log('Default user created: admin@moneymonitor.com / 123456');
      }

      if (dev) console.log('PostgreSQL schema setup completed');
    }
  } catch (error) {
    console.error('Error setting up PostgreSQL schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run schema setup on startup (in dev mode) - only if tables don't exist
if (dev) {
  setupPostgreSQLSchema().catch(error => {
    // Don't log schema setup errors in development to avoid noise
    if (!error.message.includes('already exists')) {
      console.error('Schema setup error:', error.message);
    }
  });
}

// Start periodic session cleanup (every hour)
setInterval(async () => {
  try {
    await sessionDb.cleanupExpiredSessions();
    if (dev) console.log('Cleaned up expired sessions');
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}, 60 * 60 * 1000); // 1 hour

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
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

export const sessionDb = {
  // Create a new session
  createSession: async (userId: number, token: string, expiresAt: Date): Promise<Session> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
        [userId, token, expiresAt]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Get session by token
  getSession: async (token: string): Promise<Session | undefined> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
        [token]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Update session expiration
  updateSessionExpiration: async (token: string, expiresAt: Date): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE sessions SET expires_at = $1, updated_at = CURRENT_TIMESTAMP WHERE token = $2',
        [expiresAt, token]
      );
    } finally {
      client.release();
    }
  },

  // Delete session (logout)
  deleteSession: async (token: string): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sessions WHERE token = $1', [token]);
    } finally {
      client.release();
    }
  },

  // Delete all sessions for a user
  deleteUserSessions: async (userId: number): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    } finally {
      client.release();
    }
  },

  // Clean up expired sessions
  cleanupExpiredSessions: async (): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sessions WHERE expires_at <= NOW()');
    } finally {
      client.release();
    }
  },

  // Generate secure session token
  generateSessionToken: (): string => {
    return crypto.randomBytes(32).toString('hex');
  }
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

  // Get recent investments with previous values in a single efficient query
  getRecentInvestmentsWithChanges: async (userId: number, limit: number = 20): Promise<any[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          curr.*,
          LAG(curr.value) OVER (ORDER BY curr.date) as prev_value
        FROM investments curr
        WHERE curr.user_id = $1
        ORDER BY curr.date DESC
        LIMIT $2
      `, [userId, limit]);
      
      return result.rows.map(investment => {
        const decryptedValue = decryptValue(investment.value);
        const decryptedPrevValue = investment.prev_value ? decryptValue(investment.prev_value) : null;
        
        const change = decryptedPrevValue ? decryptedValue - decryptedPrevValue : 0;
        const changePercent = decryptedPrevValue ? (change / decryptedPrevValue) * 100 : 0;
        
        return {
          ...investment,
          date: investment.date instanceof Date ? investment.date.toISOString().split('T')[0] : investment.date,
          value: decryptedValue,
          prev_value: decryptedPrevValue,
          change,
          changePercent
        };
      });
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