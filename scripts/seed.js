import { readFileSync } from 'fs';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import pg from 'pg';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Configuration
const SEED_FILE = './seed/seed_data.json';

// Encryption configuration (same as database.ts)
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY || 'dev_key_32_bytes_for_local_development_only_never_use_in_production_123456';
  return key;
}

function getDerivedKey() {
  return crypto.scryptSync(getEncryptionKey(), 'salt', 32);
}

function encryptValue(value) {
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

console.log('🌱 Quick seeding database with investment data...');

async function createDefaultUser(pool) {
  const defaultEmail = 'admin@moneymonitor.com';
  const defaultName = 'Admin User';
  const defaultPassword = '123456';

  // Check if default user exists
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [defaultEmail]);

  if (existingUser.rows.length > 0) {
    console.log(`👤 Using existing user: ${defaultEmail}`);
    return existingUser.rows[0].id;
  }

  // Create password hash
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const result = await pool.query(`
    INSERT INTO users (email, name, password_hash, created_at, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id
  `, [defaultEmail, defaultName, passwordHash]);

  console.log(`✅ Created default user: ${defaultEmail} (password: ${defaultPassword})`);
  return result.rows[0].id;
}

async function seedDatabase() {
  let pool;

  try {
    // Connect to database
    pool = new Pool(getDatabaseConfig());
    console.log('🔌 Connected to PostgreSQL database');

    // Test the connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');

    // Create default user
    const userId = await createDefaultUser(pool);

    // Check if seed file exists
    let seedData;
    try {
      seedData = JSON.parse(readFileSync(SEED_FILE, 'utf-8'));
    } catch (error) {
      console.error(`❌ Error reading seed file: ${SEED_FILE}`);
      console.log('💡 Tip: Copy seed/seed_data.example.json to seed/seed_data.json and customize it');
      process.exit(1);
    }

    let totalEntries = 0;
    let skippedEntries = 0;
    const today = new Date();

    console.log('📊 Processing seed data...');

    // Convert monthly data to daily entries
    for (const [year, months] of Object.entries(seedData)) {
      for (const [month, value] of Object.entries(months)) {
        // Map month names to numbers
        const monthMap = {
          'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };

        const monthIndex = monthMap[month];
        if (monthIndex === undefined) continue;

        // Get all days in this month
        const monthStart = startOfMonth(new Date(parseInt(year), monthIndex));
        const monthEnd = endOfMonth(new Date(parseInt(year), monthIndex));

        // Skip future months
        if (isAfter(monthStart, today)) {
          console.log(`⏭️  Skipping future month: ${year}-${month}`);
          continue;
        }

        // Get all days in the month, but don't go beyond today
        const endDate = isBefore(monthEnd, today) ? monthEnd : today;
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: endDate });

        console.log(`📅 Processing ${year}-${month}: ${daysInMonth.length} days with value $${value.toLocaleString()}`);

        // Add an entry for each day in the month
        for (const day of daysInMonth) {
          const date = format(day, 'yyyy-MM-dd');
          const encryptedValue = encryptValue(value);

          try {
            const result = await pool.query(`
              INSERT INTO investments (user_id, date, value, created_at, updated_at)
              VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT (user_id, date) DO NOTHING
              RETURNING id
            `, [userId, date, encryptedValue]);

            if (result.rows.length > 0) {
              totalEntries++;
              if (totalEntries % 100 === 0) {
                console.log(`✅ Added ${totalEntries} entries... (latest: ${date})`);
              }
            } else {
              skippedEntries++;
            }
          } catch (error) {
            console.error(`❌ Error inserting ${date}:`, error.message);
            skippedEntries++;
          }
        }
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`✅ Added ${totalEntries} new daily investment entries`);
    if (skippedEntries > 0) {
      console.log(`⏭️  Skipped ${skippedEntries} existing entries`);
    }

    // Show final stats
    const statsResult = await pool.query('SELECT COUNT(*) as total FROM investments WHERE user_id = $1', [userId]);
    const totalInvestments = parseInt(statsResult.rows[0].total);

    if (totalInvestments > 0) {
      const firstResult = await pool.query(`
        SELECT date FROM investments WHERE user_id = $1 ORDER BY date ASC LIMIT 1
      `, [userId]);

      const lastResult = await pool.query(`
        SELECT date FROM investments WHERE user_id = $1 ORDER BY date DESC LIMIT 1
      `, [userId]);

      console.log(`📊 Total entries in database: ${totalInvestments}`);
      console.log(`📅 Date range: ${firstResult.rows[0].date} to ${lastResult.rows[0].date}`);
    }

    console.log(`\n🚀 Ready to start the application!`);
    console.log(`   npm run dev`);
    console.log(`   Login with: admin@moneymonitor.com / 123456`);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);

    if (error.message.includes('role "postgres" does not exist')) {
      console.log('\n💡 Database connection tips:');
      console.log('   1. Make sure Docker PostgreSQL is running: npm run db:status');
      console.log('   2. Stop local PostgreSQL if running: brew services stop postgresql@14');
      console.log('   3. Check port 5432: lsof -i :5432');
    }

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the seeding
seedDatabase().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
