# Database Setup Guide

This guide explains how to set up and manage the Money Monitor database.

## Overview

Money Monitor uses PostgreSQL as its primary database. The application uses an **automatic schema bootstrap** approach instead of traditional migrations. When the application starts, it automatically creates the necessary database schema if it doesn't exist.

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

The database schema is created automatically when you first run the application:

```bash
# This will create tables automatically on first run
npm run dev
```

Alternatively, you can manually set up the schema:

```bash
# Manual schema setup (optional)
npm run db:setup
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

The application automatically creates the database schema on startup if it doesn't exist. No manual migration commands are needed.

1. Deploy your application
2. The schema is created automatically on first request
3. Ready to use!

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

- `scripts/init-db.sql` - Docker container initialization
- `scripts/postgres-schema.sql` - Complete schema definition  
- `scripts/setup-postgres.js` - Development setup script
- `scripts/seed.js` - Development data seeding
- `src/lib/database.ts` - Application database interface

## Schema Bootstrap Logic

The application uses `setupPostgreSQLSchema()` in `src/lib/database.ts` to:

1. Check if required tables exist
2. Create missing tables with proper indexes and constraints
3. Set up triggers for automatic `updated_at` timestamps
4. Create a default development user (in development mode only)

This happens automatically when the database connection pool is first used.

## Migration Strategy

**No Traditional Migrations**: This application doesn't use traditional migration files. Instead:

- Schema changes are made directly in the bootstrap function
- The bootstrap is idempotent (safe to run multiple times)
- New deployments automatically get the latest schema

**For Major Schema Changes**:
1. Update the bootstrap function in `database.ts`
2. Update the schema files (`init-db.sql`, `postgres-schema.sql`)
3. Deploy - schema updates happen automatically

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