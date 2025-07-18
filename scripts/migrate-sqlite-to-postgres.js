import Database from 'better-sqlite3';
import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const POSTGRES_CONFIG = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/money_monitor'
};

async function migrateData() {
  console.log('Starting data migration from SQLite to PostgreSQL...');

  // Check if SQLite database exists
  let sqliteDb;
  try {
    sqliteDb = new Database('data.db');
    console.log('Connected to SQLite database');
  } catch (error) {
    console.log('No SQLite database found - nothing to migrate');
    return;
  }

  // Connect to PostgreSQL
  const pgClient = new Client(POSTGRES_CONFIG);
  await pgClient.connect();
  console.log('Connected to PostgreSQL database');

  try {
    // Migrate users
    console.log('Migrating users...');
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    let userCount = 0;
    
    for (const user of users) {
      await pgClient.query(`
        INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, [
        user.id,
        user.email,
        user.password_hash,
        user.name,
        user.created_at,
        user.updated_at
      ]);
      userCount++;
    }
    console.log(`Migrated ${userCount} users`);

    // Migrate investments
    console.log('Migrating investments...');
    const investments = sqliteDb.prepare('SELECT * FROM investments').all();
    let investmentCount = 0;

    for (const investment of investments) {
      await pgClient.query(`
        INSERT INTO investments (id, user_id, date, value, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, date) DO UPDATE SET
          value = $4,
          updated_at = $6
      `, [
        investment.id,
        investment.user_id,
        investment.date,
        investment.value, // Already encrypted in SQLite
        investment.created_at,
        investment.updated_at
      ]);
      investmentCount++;
    }
    console.log(`Migrated ${investmentCount} investments`);

    // Update PostgreSQL sequences to handle next inserts
    console.log('Updating PostgreSQL sequences...');
    
    const maxUserId = sqliteDb.prepare('SELECT MAX(id) as max_id FROM users').get();
    if (maxUserId && maxUserId.max_id) {
      await pgClient.query(`SELECT setval('users_id_seq', $1, true)`, [maxUserId.max_id]);
      console.log(`Set users_id_seq to ${maxUserId.max_id}`);
    }

    const maxInvestmentId = sqliteDb.prepare('SELECT MAX(id) as max_id FROM investments').get();
    if (maxInvestmentId && maxInvestmentId.max_id) {
      await pgClient.query(`SELECT setval('investments_id_seq', $1, true)`, [maxInvestmentId.max_id]);
      console.log(`Set investments_id_seq to ${maxInvestmentId.max_id}`);
    }

    console.log('Migration completed successfully!');
    console.log(`Summary: ${userCount} users, ${investmentCount} investments migrated`);

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { migrateData }; 