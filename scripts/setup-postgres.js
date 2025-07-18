import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import 'dotenv/config';

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
        await client.query(`
          INSERT INTO users (email, password_hash, name) 
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO NOTHING
        `, ['admin@moneymonitor.com', defaultPassword, 'Admin User']);
        
        console.log('Default user created: admin@moneymonitor.com / 123456');
      } catch (error) {
        console.log('Default user already exists or error creating:', error.message);
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