import Database from 'better-sqlite3';
import { dev } from '$app/environment';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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

const db = new Database(dev ? 'data.db' : 'data.db');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create the users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create the investments table (will be updated with migration function)
db.exec(`
  CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    value REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration function to add user support and encryption
async function migrateToMultiUserAndEncryption() {
  const investmentsColumns = db.prepare("PRAGMA table_info(investments)").all() as Array<{name: string, type: string}>;
  const hasUserId = investmentsColumns.some((col) => col.name === 'user_id');
  const valueColumn = investmentsColumns.find((col) => col.name === 'value');

  // First, handle user migration
  if (!hasUserId) {
    // Add user_id column if it doesn't exist
    db.exec(`ALTER TABLE investments ADD COLUMN user_id INTEGER REFERENCES users(id)`);
    
    // Create a default user for existing data if any exists
    const existingInvestments = db.prepare("SELECT COUNT(*) as count FROM investments").get() as { count: number };
    if (existingInvestments.count > 0) {
      // Create default user
      const defaultPassword = await bcrypt.hash('123456', 10);
      const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (email, password_hash, name) 
        VALUES (?, ?, ?)
      `);
      const result = insertUser.run('admin@moneymonitor.com', defaultPassword, 'Admin User');
      const userId = result.lastInsertRowid;
      
      // Assign existing investments to default user
      db.exec(`UPDATE investments SET user_id = ${userId} WHERE user_id IS NULL`);
    }
    
    console.log('Migration completed: Added user support to investments table');
  }

  // Handle encryption migration (change REAL to TEXT and encrypt existing values)
  if (valueColumn && valueColumn.type === 'REAL') {
    console.log('Starting encryption migration for investment values...');
    
    // Create new table with encrypted value column
    db.exec(`
      CREATE TABLE investments_encrypted (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        date TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrate and encrypt existing data
    const existingInvestments = db.prepare("SELECT * FROM investments").all();
    const insertEncrypted = db.prepare(`
      INSERT INTO investments_encrypted (id, user_id, date, value, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const investment of existingInvestments as any[]) {
      const encryptedValue = encryptValue(investment.value);
      insertEncrypted.run(
        investment.id,
        investment.user_id,
        investment.date,
        encryptedValue,
        investment.created_at,
        investment.updated_at
      );
    }
    
    // Replace old table with new encrypted table
    db.exec(`DROP TABLE investments`);
    db.exec(`ALTER TABLE investments_encrypted RENAME TO investments`);
    
    console.log(`Migration completed: Encrypted ${existingInvestments.length} investment values`);
  }
  
  // Create indexes after migration
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_investments_user_date_unique 
    ON investments(user_id, date)
  `);
  
  // Drop the old unique constraint on date only (if exists)
  try {
    db.exec(`DROP INDEX IF EXISTS sqlite_autoindex_investments_1`);
  } catch (e) {
    // Index might not exist, that's fine
  }
}

// Run migration on startup (in dev mode, will be called when app starts)
if (dev) {
  migrateToMultiUserAndEncryption().catch(console.error);
}

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_investments_user_date ON investments(user_id, date)
`);
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date)
`);
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
`);

// User authentication prepared statements
const insertUser = db.prepare(`
  INSERT INTO users (email, password_hash, name)
  VALUES (?, ?, ?)
`);

const getUserByEmail = db.prepare(`
  SELECT * FROM users WHERE email = ?
`);

const getUserById = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

// Investment prepared statements (user-scoped)
const insertInvestment = db.prepare(`
  INSERT OR REPLACE INTO investments (user_id, date, value, updated_at)
  VALUES (?, ?, ?, CURRENT_TIMESTAMP)
`);

const getInvestmentByDate = db.prepare(`
  SELECT * FROM investments WHERE user_id = ? AND date = ?
`);

const getAllInvestments = db.prepare(`
  SELECT * FROM investments WHERE user_id = ? ORDER BY date ASC
`);

const getInvestmentsInRange = db.prepare(`
  SELECT * FROM investments 
  WHERE user_id = ? AND date >= ? AND date <= ?
  ORDER BY date ASC
`);

const deleteInvestment = db.prepare(`
  DELETE FROM investments WHERE user_id = ? AND date = ?
`);

const getLatestInvestment = db.prepare(`
  SELECT * FROM investments WHERE user_id = ? ORDER BY date DESC LIMIT 1
`);

const getInvestmentsPaginated = db.prepare(`
  SELECT * FROM investments 
  WHERE user_id = ?
  ORDER BY date DESC 
  LIMIT ? OFFSET ?
`);

const getInvestmentWithPrevious = db.prepare(`
  SELECT 
    curr.*,
    prev.value as prev_value
  FROM investments curr
  LEFT JOIN investments prev ON prev.date = (
    SELECT MAX(date) FROM investments 
    WHERE user_id = curr.user_id AND date < curr.date
  )
  WHERE curr.user_id = ? AND curr.date = ?
`);

const deleteAllInvestments = db.prepare(`
  DELETE FROM investments WHERE user_id = ?
`);

const bulkInsertInvestment = db.prepare(`
  INSERT OR REPLACE INTO investments (user_id, date, value, updated_at)
  VALUES (?, ?, ?, CURRENT_TIMESTAMP)
`);

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
    const passwordHash = await bcrypt.hash(password, 10);
    const result = insertUser.run(email, passwordHash, name || null);
    return getUserById.get(result.lastInsertRowid) as User;
  },

  // Authenticate user
  authenticateUser: async (email: string, password: string): Promise<User | null> => {
    const user = getUserByEmail.get(email) as User | undefined;
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  },

  // Get user by email
  getUserByEmail: (email: string): User | undefined => {
    return getUserByEmail.get(email) as User | undefined;
  },

  // Get user by ID
  getUserById: (id: number): User | undefined => {
    return getUserById.get(id) as User | undefined;
  },
};

export const investmentDb = {
  // Add or update an investment (user-scoped)
  addInvestment: (userId: number, date: string, value: number): void => {
    const encryptedValue = encryptValue(value);
    insertInvestment.run(userId, date, encryptedValue);
  },

  // Get investment by date (user-scoped) - decrypts value after retrieval
  getInvestment: (userId: number, date: string): Investment | undefined => {
    const result = getInvestmentByDate.get(userId, date) as Investment | undefined;
    if (result) {
      result.value = decryptValue(result.value as any);
    }
    return result;
  },

  // Get all investments (user-scoped) - decrypts values after retrieval
  getAllInvestments: (userId: number): Investment[] => {
    const results = getAllInvestments.all(userId) as Investment[];
    return results.map(investment => ({
      ...investment,
      value: decryptValue(investment.value as any)
    }));
  },

  // Get investments in date range (user-scoped) - decrypts values after retrieval
  getInvestmentsInRange: (userId: number, startDate: string, endDate: string): Investment[] => {
    const results = getInvestmentsInRange.all(userId, startDate, endDate) as Investment[];
    return results.map(investment => ({
      ...investment,
      value: decryptValue(investment.value as any)
    }));
  },

  // Delete investment (user-scoped)
  deleteInvestment: (userId: number, date: string): void => {
    deleteInvestment.run(userId, date);
  },

  // Get latest investment (user-scoped) - decrypts value after retrieval
  getLatestInvestment: (userId: number): Investment | undefined => {
    const result = getLatestInvestment.get(userId) as Investment | undefined;
    if (result) {
      result.value = decryptValue(result.value as any);
    }
    return result;
  },

  // Get investments with pagination (newest first, user-scoped) - decrypts values after retrieval
  getInvestmentsPaginated: (userId: number, limit: number, offset: number): Investment[] => {
    const results = getInvestmentsPaginated.all(userId, limit, offset) as Investment[];
    return results.map(investment => ({
      ...investment,
      value: decryptValue(investment.value as any)
    }));
  },

  // Get investment with previous value for change calculation (user-scoped) - decrypts values after retrieval
  getInvestmentWithPrevious: (userId: number, date: string): any => {
    const result = getInvestmentWithPrevious.get(userId, date) as any;
    if (result) {
      if (result.value) result.value = decryptValue(result.value);
      if (result.prev_value) result.prev_value = decryptValue(result.prev_value);
    }
    return result;
  },

  // Clear all investments for a user
  clearAllInvestments: (userId: number): void => {
    deleteAllInvestments.run(userId);
  },

  // Bulk insert investments (for CSV import, user-scoped) - encrypts values before storing
  bulkInsertInvestments: (userId: number, investments: Array<{ date: string; value: number }>): number => {
    const transaction = db.transaction(() => {
      let insertedCount = 0;
      for (const investment of investments) {
        const encryptedValue = encryptValue(investment.value);
        bulkInsertInvestment.run(userId, investment.date, encryptedValue);
        insertedCount++;
      }
      return insertedCount;
    });
    
    return transaction();
  },

  // Close database connection
  close: (): void => {
    db.close();
  }
};

// Export migration function for testing
export { migrateToMultiUserAndEncryption };

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));