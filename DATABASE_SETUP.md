# Database Setup Guide

This guide explains how to set up and manage the Money Monitor database.

## Overview

Money Monitor uses PostgreSQL as its primary database. The application uses a **Rails-like migration system** with timestamped SQL files to manage database schema changes. Migrations are tracked in a `schema_migrations` table and run automatically when needed.

## Database Schema

The application creates the following tables:

- **users** - User accounts with authentication data
- **portfolios** - Investment portfolios belonging to users  
- **investments** - Daily investment values (encrypted)
- **sessions** - User session management

## Development Setup

### 1. Start PostgreSQL with Docker

```bash
# Start the database container
npm run db:start

# Check if it's running
npm run db:status
```

### 2. Initialize Database Schema

The database schema is created automatically through migrations when you first run the application:

```bash
# This will run migrations automatically on first run
npm run dev
```

Alternatively, you can manually set up the schema and run migrations:

```bash
# Manual schema setup and migrations
npm run db:setup
npm run migrate
```

### 3. Seed Development Data

```bash
# Add sample data for development
npm run seed
```

This creates:
- Default user: `admin@moneymonitor.com` / `123456`
- A "Main Portfolio" for the user
- Sample investment data from the seed file

## Production Setup

### Environment Variables

Set these environment variables in production:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
ENCRYPTION_KEY=your-32-byte-encryption-key-here
NODE_ENV=production
```

### Automatic Schema Creation

The application automatically runs pending migrations on startup. For production deployments, you can also run migrations explicitly:

1. Deploy your application with migration files
2. Run `npm run migrate` (optional - migrations run automatically)
3. The application will have the latest schema
4. Ready to use!

## Available Scripts

### Database Management

```bash
# Start/stop database container
npm run db:start
npm run db:stop
npm run db:status

# Reset database (deletes all data)
npm run db:reset

# Connect to database CLI
npm run db:connect

# View database logs
npm run db:logs
```

### Migrations

```bash
# Run pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Create new migration
npm run migrate:create "description"
```

### Development

```bash
# Set up schema manually (optional)
npm run db:setup

# Add sample data
npm run seed

# Clean up old sessions
npm run db:cleanup-sessions
```

## Database Files

- `migrations/` - Database migration files (timestamped SQL files)
- `scripts/migrate.js` - Migration runner system
- `scripts/init-db.sql` - Docker container initialization
- `scripts/postgres-schema.sql` - Complete schema definition  
- `scripts/setup-postgres.js` - Development setup script
- `scripts/seed.js` - Development data seeding
- `src/lib/database.ts` - Application database interface

## Migration System

The application uses a Rails-like migration system with timestamped SQL files:

### Migration Files
- Located in `migrations/` directory
- Named with timestamp format: `YYYYMMDD_HHMMSS_description.sql`
- Tracked in `schema_migrations` table
- Run automatically in chronological order

### Migration Commands
```bash
# Create new migration
npm run migrate:create "add user preferences"

# Run pending migrations  
npm run migrate

# Check migration status
npm run migrate:status
```

### How It Works
1. Each migration file has a unique timestamp ID
2. Executed migrations are recorded in `schema_migrations` table
3. Only pending migrations are executed
4. Migrations run in transaction for safety
5. Failed migrations are recorded and must be fixed manually

### Schema Bootstrap
The application also uses `setupPostgreSQLSchema()` for initial setup:

1. Creates core tables if they don't exist
2. Runs pending migrations automatically
3. Sets up triggers and basic constraints
4. Creates default development user (in development mode only)

**For Schema Changes**:
1. Create a new migration file: `npm run migrate:create "description"`
2. Add your SQL changes to the generated file
3. Test locally, then deploy
4. Migrations run automatically on deployment

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
npm run db:status

# Check port usage
lsof -i :5432

# View database logs
npm run db:logs
```

### Schema Issues

```bash
# Connect to database and inspect
npm run db:connect

# List tables
\dt

# Describe table structure
\d users
\d portfolios
\d investments
\d sessions
```

### Reset Everything

```bash
# Nuclear option - deletes all data
npm run db:reset
npm run db:setup
npm run seed
```

## Security Notes

- All investment values are encrypted in the database
- Session tokens are securely hashed
- Foreign key constraints ensure data integrity
- Passwords are bcrypt hashed with salt

## Performance

The schema includes optimized indexes for:
- User lookups by email
- Investment queries by portfolio and date
- Session validation by token
- Portfolio queries by user

---

For questions or issues, check the main README.md or create an issue in the repository.