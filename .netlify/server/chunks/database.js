import pg from "pg";
import { B as BROWSER } from "./false.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
const dev = BROWSER;
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
  password: process.env.DB_PASSWORD || "password",
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
});
setInterval(async () => {
  try {
    await sessionDb.cleanupExpiredSessions();
    if (dev) ;
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
  }
}, 60 * 60 * 1e3);
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
      const result = await client.query(
        "SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()",
        [token]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  // Update session expiration
  updateSessionExpiration: async (token, expiresAt) => {
    const client = await pool.connect();
    try {
      await client.query(
        "UPDATE sessions SET expires_at = $1, updated_at = CURRENT_TIMESTAMP WHERE token = $2",
        [expiresAt, token]
      );
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
const investmentDb = {
  // Add or update an investment (user-scoped)
  addInvestment: async (userId, date, value) => {
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
  getInvestment: async (userId, date) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 AND date = $2",
        [userId, date]
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
  // Get all investments (user-scoped) - decrypts values after retrieval
  getAllInvestments: async (userId) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 ORDER BY date ASC",
        [userId]
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
  // Get investments in date range (user-scoped) - decrypts values after retrieval
  getInvestmentsInRange: async (userId, startDate, endDate) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC",
        [userId, startDate, endDate]
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
  // Delete investment (user-scoped)
  deleteInvestment: async (userId, date) => {
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM investments WHERE user_id = $1 AND date = $2", [userId, date]);
    } finally {
      client.release();
    }
  },
  // Get latest investment (user-scoped) - decrypts value after retrieval
  getLatestInvestment: async (userId) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 ORDER BY date DESC LIMIT 1",
        [userId]
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
  // Get investments with pagination (newest first, user-scoped) - decrypts values after retrieval
  getInvestmentsPaginated: async (userId, limit, offset) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM investments WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3",
        [userId, limit, offset]
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
        investment.date = investment.date instanceof Date ? investment.date.toISOString().split("T")[0] : investment.date;
        if (investment.value) investment.value = decryptValue(investment.value);
        if (investment.prev_value) investment.prev_value = decryptValue(investment.prev_value);
      }
      return investment;
    } finally {
      client.release();
    }
  },
  // Clear all investments for a user
  clearAllInvestments: async (userId) => {
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM investments WHERE user_id = $1", [userId]);
    } finally {
      client.release();
    }
  },
  // Bulk insert investments (for CSV import, user-scoped) - encrypts values before storing
  bulkInsertInvestments: async (userId, investments) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
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
      const result = await client.query(`
        SELECT 
          curr.*,
          LAG(curr.value) OVER (ORDER BY curr.date) as prev_value
        FROM investments curr
        WHERE curr.user_id = $1
        ORDER BY curr.date DESC
        LIMIT $2
      `, [userId, limit]);
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
  sessionDb as s,
  userDb as u
};
