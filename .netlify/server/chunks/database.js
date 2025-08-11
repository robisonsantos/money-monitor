import pg from "pg";
import { D as DEV } from "./true.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
const dev = DEV;
dotenv.config();
const { Pool } = pg;
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
let ENCRYPTION_KEY = null;
function getEncryptionKey() {
  if (ENCRYPTION_KEY === null) {
    ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
    if (!ENCRYPTION_KEY) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("ENCRYPTION_KEY environment variable is required in production");
      }
      ENCRYPTION_KEY = "your-32-byte-secret-key-here-for-dev!";
      console.warn("⚠️  Using default encryption key for development. Set ENCRYPTION_KEY environment variable.");
    }
  }
  return ENCRYPTION_KEY;
}
let cachedKey = null;
function getDerivedKey() {
  if (!cachedKey) {
    cachedKey = crypto.scryptSync(getEncryptionKey(), "salt", 32);
  }
  return cachedKey;
}
function encryptValue(value) {
  const iv = crypto.randomBytes(16);
  const key = getDerivedKey();
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from("investment-value", "utf8"));
  let encrypted = cipher.update(value.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}
function decryptValue(encryptedValue) {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedValue.split(":");
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error("Invalid encrypted value format");
    }
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = getDerivedKey();
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from("investment-value", "utf8"));
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return parseFloat(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    const numValue = parseFloat(encryptedValue);
    if (!isNaN(numValue)) {
      return numValue;
    }
    throw new Error("Failed to decrypt investment value");
  }
}
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "dev_password_123",
  database: process.env.DB_NAME || "money_monitor",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 10,
  // maximum number of clients in the pool
  min: 1,
  // minimum number of clients in the pool
  idleTimeoutMillis: 3e4,
  // close idle clients after 30 seconds
  connectionTimeoutMillis: 3e4,
  // return an error after 30 seconds if connection could not be established
  acquireTimeoutMillis: 3e4
  // return an error after 30 seconds if a client cannot be acquired
};
const pool = new Pool(poolConfig);
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});
pool.on("connect", (client) => {
  console.log("New PostgreSQL client connected");
});
{
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Error connecting to PostgreSQL:", err);
      console.error("Connection configuration:", poolConfig);
    } else {
      console.log("PostgreSQL connection test successful");
      release();
    }
  });
}
async function setupPostgreSQLSchema() {
  const client = await pool.connect();
  try {
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('users', 'investments')
    `;
    const result = await client.query(tablesQuery);
    const existingTables = result.rows.map((row) => row.table_name);
    if (existingTables.length >= 2) {
      return;
    }
    if (!existingTables.includes("users") || !existingTables.includes("investments")) {
      if (dev) console.log("Setting up PostgreSQL schema...");
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
      await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_user_date ON investments(user_id, date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_investments_user_date_unique ON investments(user_id, date)`
      );
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`);
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);
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
      if (dev && process.env.NODE_ENV === "development") {
        const defaultPassword = await bcrypt.hash("123456", 10);
        await client.query(
          `
          INSERT INTO users (email, password_hash, name)
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO NOTHING
        `,
          ["admin@moneymonitor.com", defaultPassword, "Admin User"]
        );
        console.log("Default user created: admin@moneymonitor.com / 123456");
      }
      if (dev) console.log("PostgreSQL schema setup completed");
    }
  } catch (error) {
    console.error("Error setting up PostgreSQL schema:", error);
    throw error;
  } finally {
    client.release();
  }
}
{
  setupPostgreSQLSchema().catch((error) => {
    if (!error.message.includes("already exists")) {
      console.error("Schema setup error:", error.message);
    }
  });
}
setInterval(
  async () => {
    try {
      await sessionDb.cleanupExpiredSessions();
      if (dev) console.log("Cleaned up expired sessions");
    } catch (error) {
      console.error("Error cleaning up sessions:", error);
    }
  },
  60 * 60 * 1e3
);
const userDb = {
  // Create a new user
  createUser: async (email, password, name) => {
    const client = await pool.connect();
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await client.query(
        "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
        [email, passwordHash, name || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Authenticate user
  authenticateUser: async (email, password) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];
      if (!user) return null;
      const isValid = await bcrypt.compare(password, user.password_hash);
      return isValid ? user : null;
    } finally {
      client.release();
    }
  },
  // Get user by email
  getUserByEmail: async (email) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Get user by ID
  getUserById: async (id) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};
const sessionDb = {
  // Create a new session
  createSession: async (userId, token, expiresAt) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *",
        [userId, token, expiresAt]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Get session by token
  getSession: async (token) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()", [token]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Update session expiration
  updateSessionExpiration: async (token, expiresAt) => {
    const client = await pool.connect();
    try {
      await client.query("UPDATE sessions SET expires_at = $1, updated_at = CURRENT_TIMESTAMP WHERE token = $2", [
        expiresAt,
        token
      ]);
    } finally {
      client.release();
    }
  },
  // Delete session (logout)
  deleteSession: async (token) => {
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM sessions WHERE token = $1", [token]);
    } finally {
      client.release();
    }
  },
  // Delete all sessions for a user
  deleteUserSessions: async (userId) => {
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
    } finally {
      client.release();
    }
  },
  // Clean up expired sessions
  cleanupExpiredSessions: async () => {
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM sessions WHERE expires_at <= NOW()");
    } finally {
      client.release();
    }
  },
  // Generate secure session token
  generateSessionToken: () => {
    return crypto.randomBytes(32).toString("hex");
  }
};
const portfolioDb = {
  // Get all portfolios for a user
  getUserPortfolios: async (userId) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC", [
        userId
      ]);
      return result.rows;
    } finally {
      client.release();
    }
  },
  // Get a specific portfolio by ID (user-scoped)
  getPortfolio: async (userId, portfolioId) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM portfolios WHERE id = $1 AND user_id = $2", [
        portfolioId,
        userId
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Get portfolio by name (user-scoped)
  getPortfolioByName: async (userId, name) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM portfolios WHERE user_id = $1 AND name = $2", [userId, name]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Create a new portfolio
  createPortfolio: async (userId, name) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO portfolios (user_id, name, created_at, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, name]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Update portfolio name
  updatePortfolio: async (userId, portfolioId, name) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE portfolios
         SET name = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [name, portfolioId, userId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },
  // Delete a portfolio (only if it has no investments)
  deletePortfolio: async (userId, portfolioId) => {
    const client = await pool.connect();
    try {
      const investmentCheck = await client.query("SELECT COUNT(*) as count FROM investments WHERE portfolio_id = $1", [
        portfolioId
      ]);
      const investmentCount = parseInt(investmentCheck.rows[0].count);
      if (investmentCount > 0) {
        throw new Error("Cannot delete portfolio with existing investments");
      }
      const portfolioCheck = await client.query("SELECT COUNT(*) as count FROM portfolios WHERE user_id = $1", [
        userId
      ]);
      const portfolioCount = parseInt(portfolioCheck.rows[0].count);
      if (portfolioCount <= 1) {
        throw new Error("Cannot delete the last portfolio");
      }
      const result = await client.query("DELETE FROM portfolios WHERE id = $1 AND user_id = $2", [portfolioId, userId]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },
  // Get default portfolio for user (Main Portfolio)
  getDefaultPortfolio: async (userId) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM portfolios WHERE user_id = $1 AND name = $2", [
        userId,
        "Main Portfolio"
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Ensure user has a default portfolio
  ensureDefaultPortfolio: async (userId) => {
    const existing = await portfolioDb.getDefaultPortfolio(userId);
    if (existing) {
      return existing;
    }
    return await portfolioDb.createPortfolio(userId, "Main Portfolio");
  },
  // Get portfolio with investment count
  getPortfolioWithStats: async (userId, portfolioId) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT p.*, COUNT(i.id) as investment_count
         FROM portfolios p
         LEFT JOIN investments i ON p.id = i.portfolio_id
         WHERE p.id = $1 AND p.user_id = $2
         GROUP BY p.id`,
        [portfolioId, userId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};
const investmentDb = {
  // Add or update an investment (user-scoped) - backward compatible
  addInvestment: async (userId, date, value) => {
    const defaultPortfolio = await portfolioDb.ensureDefaultPortfolio(userId);
    return await investmentDb.addInvestmentToPortfolio(userId, defaultPortfolio.id, date, value);
  },
  // Add or update an investment to a specific portfolio
  addInvestmentToPortfolio: async (userId, portfolioId, date, value) => {
    const client = await pool.connect();
    try {
      const portfolio = await portfolioDb.getPortfolio(userId, portfolioId);
      if (!portfolio) {
        throw new Error("Portfolio not found or access denied");
      }
      const encryptedValue = encryptValue(value);
      await client.query(
        `
        INSERT INTO investments (user_id, portfolio_id, date, value, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (portfolio_id, date)
        DO UPDATE SET value = $4, updated_at = CURRENT_TIMESTAMP
      `,
        [userId, portfolioId, date, encryptedValue]
      );
    } finally {
      client.release();
    }
  },
  // Get investment by date (user-scoped) - decrypts value after retrieval
  getInvestment: async (userId, date) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM investments WHERE user_id = $1 AND date = $2", [userId, date]);
      const investment = result.rows[0];
      if (investment) {
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date;
        investment.value = decryptValue(investment.value);
      }
      return investment;
    } finally {
      client.release();
    }
  },
  // Get investment by date from specific portfolio - decrypts value after retrieval
  getInvestmentFromPortfolio: async (userId, portfolioId, date) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 AND portfolio_id = $2 AND date = $3",
        [userId, portfolioId, date]
      );
      const investment = result.rows[0];
      if (investment) {
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date;
        investment.value = decryptValue(investment.value);
      }
      return investment;
    } finally {
      client.release();
    }
  },
  // Get all investments (user-scoped) - backward compatible
  getAllInvestments: async (userId) => {
    const defaultPortfolio = await portfolioDb.getDefaultPortfolio(userId);
    if (!defaultPortfolio) return [];
    return await investmentDb.getAllInvestmentsFromPortfolio(userId, defaultPortfolio.id);
  },
  // Get all investments from specific portfolio
  getAllInvestmentsFromPortfolio: async (userId, portfolioId) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 AND portfolio_id = $2 ORDER BY date ASC",
        [userId, portfolioId]
      );
      return result.rows.map((investment) => ({
        ...investment,
        date: investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date,
        value: decryptValue(investment.value)
      }));
    } finally {
      client.release();
    }
  },
  // Get investments in date range (user-scoped) - backward compatible
  getInvestmentsInRange: async (userId, startDate, endDate) => {
    const defaultPortfolio = await portfolioDb.getDefaultPortfolio(userId);
    if (!defaultPortfolio) return [];
    return await investmentDb.getInvestmentsInRangeFromPortfolio(userId, defaultPortfolio.id, startDate, endDate);
  },
  // Get investments in date range from specific portfolio
  getInvestmentsInRangeFromPortfolio: async (userId, portfolioId, startDate, endDate) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 AND portfolio_id = $2 AND date >= $3 AND date <= $4 ORDER BY date ASC",
        [userId, portfolioId, startDate, endDate]
      );
      return result.rows.map((investment) => ({
        ...investment,
        date: investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date,
        value: decryptValue(investment.value)
      }));
    } finally {
      client.release();
    }
  },
  // Delete investment by date (user-scoped) - backward compatible
  deleteInvestment: async (userId, date) => {
    const defaultPortfolio = await portfolioDb.getDefaultPortfolio(userId);
    if (!defaultPortfolio) return false;
    return await investmentDb.deleteInvestmentFromPortfolio(userId, defaultPortfolio.id, date);
  },
  // Delete investment from specific portfolio
  deleteInvestmentFromPortfolio: async (userId, portfolioId, date) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM investments WHERE user_id = $1 AND portfolio_id = $2 AND date = $3",
        [userId, portfolioId, date]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },
  // Get latest investment (user-scoped) - decrypts value after retrieval
  getLatestInvestment: async (userId) => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM investments WHERE user_id = $1 ORDER BY date DESC LIMIT 1", [
        userId
      ]);
      const investment = result.rows[0];
      if (investment) {
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date;
        investment.value = decryptValue(investment.value);
      }
      return investment;
    } finally {
      client.release();
    }
  },
  // Get investments with pagination (newest first, user-scoped) - backward compatible
  getInvestmentsPaginated: async (userId, limit, offset) => {
    const defaultPortfolio = await portfolioDb.getDefaultPortfolio(userId);
    if (!defaultPortfolio) return [];
    return await investmentDb.getInvestmentsPaginatedFromPortfolio(userId, defaultPortfolio.id, limit, offset);
  },
  // Get investments with pagination from specific portfolio
  getInvestmentsPaginatedFromPortfolio: async (userId, portfolioId, limit, offset) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 AND portfolio_id = $2 ORDER BY date DESC LIMIT $3 OFFSET $4",
        [userId, portfolioId, limit, offset]
      );
      return result.rows.map((investment) => ({
        ...investment,
        date: investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date,
        value: decryptValue(investment.value)
      }));
    } finally {
      client.release();
    }
  },
  // Get investment with previous value for change calculation (user-scoped) - decrypts values after retrieval
  getInvestmentWithPrevious: async (userId, date) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT
          curr.*,
          prev.value as prev_value
        FROM investments curr
        LEFT JOIN investments prev ON prev.user_id = curr.user_id AND prev.date = (
          SELECT MAX(date) FROM investments
          WHERE user_id = curr.user_id AND date < curr.date
        )
        WHERE curr.user_id = $1 AND curr.date = $2
      `,
        [userId, date]
      );
      const investment = result.rows[0];
      if (investment) {
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date;
        if (investment.value) investment.value = decryptValue(investment.value);
        if (investment.prev_value) investment.prev_value = decryptValue(investment.prev_value);
      }
      return investment;
    } finally {
      client.release();
    }
  },
  // Clear all investments for a user - backward compatible
  clearAllInvestments: async (userId) => {
    const defaultPortfolio = await portfolioDb.getDefaultPortfolio(userId);
    if (!defaultPortfolio) return;
    return await investmentDb.clearAllInvestmentsFromPortfolio(userId, defaultPortfolio.id);
  },
  // Clear all investments from specific portfolio
  clearAllInvestmentsFromPortfolio: async (userId, portfolioId) => {
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM investments WHERE user_id = $1 AND portfolio_id = $2", [userId, portfolioId]);
    } finally {
      client.release();
    }
  },
  // Bulk insert investments (for CSV import, user-scoped) - backward compatible
  bulkInsertInvestments: async (userId, investments) => {
    const defaultPortfolio = await portfolioDb.ensureDefaultPortfolio(userId);
    return await investmentDb.bulkInsertInvestmentsToPortfolio(userId, defaultPortfolio.id, investments);
  },
  // Bulk insert investments to specific portfolio
  bulkInsertInvestmentsToPortfolio: async (userId, portfolioId, investments) => {
    const client = await pool.connect();
    try {
      const portfolio = await portfolioDb.getPortfolio(userId, portfolioId);
      if (!portfolio) {
        throw new Error("Portfolio not found or access denied");
      }
      await client.query("BEGIN");
      let insertedCount = 0;
      for (const investment of investments) {
        const encryptedValue = encryptValue(investment.value);
        await client.query(
          `
          INSERT INTO investments (user_id, portfolio_id, date, value, updated_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (portfolio_id, date)
          DO UPDATE SET value = $4, updated_at = CURRENT_TIMESTAMP
        `,
          [userId, portfolioId, investment.date, encryptedValue]
        );
        insertedCount++;
      }
      await client.query("COMMIT");
      return insertedCount;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
  // Get recent investments with previous values in a single efficient query
  getRecentInvestmentsWithChanges: async (userId, limit = 20) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT
          curr.*,
          LAG(curr.value) OVER (ORDER BY curr.date) as prev_value
        FROM investments curr
        WHERE curr.user_id = $1
        ORDER BY curr.date DESC
        LIMIT $2
      `,
        [userId, limit]
      );
      return result.rows.map((investment) => {
        const decryptedValue = decryptValue(investment.value);
        const decryptedPrevValue = investment.prev_value ? decryptValue(investment.prev_value) : null;
        const change = decryptedPrevValue ? decryptedValue - decryptedPrevValue : 0;
        const changePercent = decryptedPrevValue ? change / decryptedPrevValue * 100 : 0;
        return {
          ...investment,
          date: investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date,
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
  close: async () => {
    await pool.end();
  }
};
process.on("exit", () => pool.end());
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
export {
  investmentDb as i,
  portfolioDb as p,
  sessionDb as s,
  userDb as u
};
