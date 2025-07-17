import Database from 'better-sqlite3';
import { dev } from '$app/environment';

const db = new Database(dev ? 'data.db' : 'data.db');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create the investments table
db.exec(`
  CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    value REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create an index on date for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date)
`);

// Prepared statements
const insertInvestment = db.prepare(`
  INSERT OR REPLACE INTO investments (date, value, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
`);

const getInvestmentByDate = db.prepare(`
  SELECT * FROM investments WHERE date = ?
`);

const getAllInvestments = db.prepare(`
  SELECT * FROM investments ORDER BY date ASC
`);

const getInvestmentsInRange = db.prepare(`
  SELECT * FROM investments 
  WHERE date >= ? AND date <= ?
  ORDER BY date ASC
`);

const deleteInvestment = db.prepare(`
  DELETE FROM investments WHERE date = ?
`);

const getLatestInvestment = db.prepare(`
  SELECT * FROM investments ORDER BY date DESC LIMIT 1
`);

const deleteAllInvestments = db.prepare(`
  DELETE FROM investments
`);

export interface Investment {
  id: number;
  date: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export const investmentDb = {
  // Add or update an investment
  addInvestment: (date: string, value: number): void => {
    insertInvestment.run(date, value);
  },

  // Get investment by date
  getInvestment: (date: string): Investment | undefined => {
    return getInvestmentByDate.get(date) as Investment | undefined;
  },

  // Get all investments
  getAllInvestments: (): Investment[] => {
    return getAllInvestments.all() as Investment[];
  },

  // Get investments in date range
  getInvestmentsInRange: (startDate: string, endDate: string): Investment[] => {
    return getInvestmentsInRange.all(startDate, endDate) as Investment[];
  },

  // Delete investment
  deleteInvestment: (date: string): void => {
    deleteInvestment.run(date);
  },

  // Get latest investment
  getLatestInvestment: (): Investment | undefined => {
    return getLatestInvestment.get() as Investment | undefined;
  },

  // Clear all investments
  clearAllInvestments: (): void => {
    deleteAllInvestments.run();
  },

  // Close database connection
  close: (): void => {
    db.close();
  }
};

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));