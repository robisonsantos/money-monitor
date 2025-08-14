import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Handle PostgreSQL connection configuration
const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      database: process.env.DB_NAME || 'money_monitor',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

// Only add password if it's explicitly set
if (process.env.DB_PASSWORD) {
  DB_CONFIG.password = process.env.DB_PASSWORD;
}

async function setupDatabase() {
  console.log('Setting up PostgreSQL database...');
  console.log('Database config:', { ...DB_CONFIG, password: '[HIDDEN]' });

  const client = new Client(DB_CONFIG);

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully');

    // Read schema file
    const schemaPath = join(__dirname, 'postgres-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Execute schema
    await client.query(schema);
    console.log('Database schema created successfully');

    // Create default dev user ONLY in explicit development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating default development user...');

      const bcrypt = await import('bcrypt');
      const defaultPassword = await bcrypt.hash('123456', 10);

      try {
        const userResult = await client.query(`
          INSERT INTO users (email, password_hash, name)
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO NOTHING
          RETURNING id
        `, ['admin@moneymonitor.com', defaultPassword, 'Admin User']);

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;

          // Create default portfolio for the user
          await client.query(`
            INSERT INTO portfolios (user_id, name)
            VALUES ($1, $2)
            ON CONFLICT (user_id, name) DO NOTHING
          `, [userId, 'My Portfolio']);

          console.log('Default user created: admin@moneymonitor.com / 123456');
          console.log('Default portfolio "My Portfolio" created');
        } else {
          // User already exists, ensure they have a default portfolio
          const existingUser = await client.query(`
            SELECT id FROM users WHERE email = $1
          `, ['admin@moneymonitor.com']);

          if (existingUser.rows.length > 0) {
            const userId = existingUser.rows[0].id;
            await client.query(`
              INSERT INTO portfolios (user_id, name)
              VALUES ($1, $2)
              ON CONFLICT (user_id, name) DO NOTHING
            `, [userId, 'My Portfolio']);
            console.log('Default user already exists, ensured default portfolio exists');
          }
        }
      } catch (error) {
        console.log('Default user setup error:', error.message);
      }
    }

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
