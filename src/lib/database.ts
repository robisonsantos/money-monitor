import Database from 'better-sqlite3';
import { dev } from '$app/environment';
import bcrypt from 'bcrypt';

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

// Migration function to add user support
async function migrateToMultiUser() {
  const investmentsColumns = db.prepare("PRAGMA table_info(investments)").all();
  const hasUserId = investmentsColumns.some((col: any) => col.name === 'user_id');

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
    
    // Update the unique constraint to include user_id
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
}

// Run migration on startup (in dev mode, will be called when app starts)
if (dev) {
  migrateToMultiUser().catch(console.error);
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
    insertInvestment.run(userId, date, value);
  },

  // Get investment by date (user-scoped)
  getInvestment: (userId: number, date: string): Investment | undefined => {
    return getInvestmentByDate.get(userId, date) as Investment | undefined;
  },

  // Get all investments (user-scoped)
  getAllInvestments: (userId: number): Investment[] => {
    return getAllInvestments.all(userId) as Investment[];
  },

  // Get investments in date range (user-scoped)
  getInvestmentsInRange: (userId: number, startDate: string, endDate: string): Investment[] => {
    return getInvestmentsInRange.all(userId, startDate, endDate) as Investment[];
  },

  // Delete investment (user-scoped)
  deleteInvestment: (userId: number, date: string): void => {
    deleteInvestment.run(userId, date);
  },

  // Get latest investment (user-scoped)
  getLatestInvestment: (userId: number): Investment | undefined => {
    return getLatestInvestment.get(userId) as Investment | undefined;
  },

  // Get investments with pagination (newest first, user-scoped)
  getInvestmentsPaginated: (userId: number, limit: number, offset: number): Investment[] => {
    return getInvestmentsPaginated.all(userId, limit, offset) as Investment[];
  },

  // Get investment with previous value for change calculation (user-scoped)
  getInvestmentWithPrevious: (userId: number, date: string): any => {
    return getInvestmentWithPrevious.get(userId, date);
  },

  // Clear all investments for a user
  clearAllInvestments: (userId: number): void => {
    deleteAllInvestments.run(userId);
  },

  // Bulk insert investments (for CSV import, user-scoped)
  bulkInsertInvestments: (userId: number, investments: Array<{ date: string; value: number }>): number => {
    const transaction = db.transaction(() => {
      let insertedCount = 0;
      for (const investment of investments) {
        bulkInsertInvestment.run(userId, investment.date, investment.value);
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
export { migrateToMultiUser };

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));