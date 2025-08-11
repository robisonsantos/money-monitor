# Migration System Implementation Summary

This document summarizes the implementation of a Rails-like migration system for the Money Monitor application.

## What Was Implemented

### Rails-like Migration System
- `migrations/` - Directory for timestamped SQL migration files
- `scripts/migrate.js` - Migration runner with Rails-like functionality
- `schema_migrations` table - Tracks executed migrations
- Timestamped migration files (`YYYYMMDD_HHMMSS_description.sql`)

### Migration Commands
- `npm run migrate` - Run pending migrations
- `npm run migrate:status` - Show migration status
- `npm run migrate:create "description"` - Create new migration file

### Key Features
- **Timestamped Files**: Each migration has unique timestamp ID
- **Execution Tracking**: Migrations tracked in `schema_migrations` table
- **Idempotent**: Safe to run multiple times
- **Transaction Safety**: Each migration runs in transaction
- **Automatic Discovery**: Finds and runs pending migrations in order

## Migration Files

### File Structure
```
migrations/
├── README.md
└── 20241210_000001_add_is_default_to_portfolios.sql
```

### Naming Convention
```
YYYYMMDD_HHMMSS_description.sql
```

Example: `20241210_143022_add_user_preferences.sql`

### Migration Template
```sql
-- Migration: Description
-- ID: 20241210_143022
-- Description: Detailed explanation

-- Migration SQL here
ALTER TABLE example ADD COLUMN new_field VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_example ON example(new_field);
```

## Implementation Details

### Migration Runner (`scripts/migrate.js`)
- Discovers migration files in `migrations/` directory
- Creates `schema_migrations` table automatically
- Tracks execution with ID, name, timestamp, checksum, and success status
- Runs migrations in chronological order
- Supports transaction rollback on failure

### Database Integration
- Bootstrap function in `database.ts` creates initial schema
- Migration system handles subsequent schema changes
- Automatic execution during application startup (future enhancement)

### Portfolio System Migration
- `20241210_000001_add_is_default_to_portfolios.sql` - Adds `is_default` column
- Handles existing data by setting default portfolios intelligently
- Uses partial unique index to allow multiple `false` values
- Ensures each user has exactly one default portfolio

## New Approach: Rails-like Migrations

### How It Works
1. Create migration file with timestamp: `npm run migrate:create "description"`
2. Edit the generated SQL file with your changes
3. Run migrations: `npm run migrate`
4. System tracks execution in `schema_migrations` table
5. Only pending migrations are executed

### Benefits
- ✅ **Version Control**: Database schema changes are versioned
- ✅ **Team Collaboration**: Consistent schema across environments
- ✅ **Rollback Safety**: Failed migrations don't corrupt database
- ✅ **Audit Trail**: Complete history of schema changes
- ✅ **Rails Familiarity**: Uses proven Rails migration patterns

## Updated Files

### New Files
- `migrations/README.md` - Migration system documentation
- `migrations/20241210_000001_add_is_default_to_portfolios.sql` - Portfolio default column
- `scripts/migrate.js` - Migration runner system

### Updated Files
- `package.json` - Added migration commands
- `DATABASE_SETUP.md` - Updated with migration documentation
- Portfolio-related files - Updated to use `is_default` flag instead of name

### Database Schema Changes
- Added `is_default` boolean column to `portfolios` table
- Added partial unique index for default portfolios
- Updated Portfolio interface to include `is_default` field
- Enhanced portfolio management with default marking

## Migration Commands Usage

### Create New Migration
```bash
npm run migrate:create "add user preferences"
# Creates: migrations/20241210_143022_add_user_preferences.sql
```

### Run Pending Migrations
```bash
npm run migrate
# Output:
# 🚀 Starting migration run...
# 📋 Found 1 pending migrations:
#    • 20241210_143022_add_user_preferences
# ✅ Migration completed: 20241210_143022_add_user_preferences
```

### Check Migration Status
```bash
npm run migrate:status
# Output:
# 📊 Migration Status:
# ID              | Name                    | Status    | Executed At
# 20241210_143022 | add_user_preferences    | ✅ Success | 2024-12-10 14:30:45
```

## Migration Best Practices

### Idempotent Operations
```sql
-- Good: Safe to run multiple times
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Avoid: May fail on second run
ALTER TABLE users ADD COLUMN email_verified BOOLEAN;
```

### Transaction Safety
```sql
-- Use transactions for complex changes
BEGIN;
ALTER TABLE users ADD COLUMN temp_field VARCHAR(255);
UPDATE users SET temp_field = 'default';
ALTER TABLE users ALTER COLUMN temp_field SET NOT NULL;
COMMIT;
```

### Data Migrations
```sql
-- Handle existing data properly
WITH default_candidates AS (
  SELECT user_id, id, ROW_NUMBER() OVER (...) as rn
  FROM portfolios WHERE is_default IS NULL
)
UPDATE portfolios SET is_default = (rn = 1)
FROM default_candidates
WHERE portfolios.user_id = default_candidates.user_id;
```

## Development Workflow

### For Schema Changes
1. Create migration: `npm run migrate:create "description"`
2. Edit the generated SQL file
3. Test locally: `npm run migrate`
4. Commit migration file
5. Deploy - migrations run automatically

### For Production
1. Deploy application with new migration files
2. Run `npm run migrate` (or automatic on startup)
3. Verify with `npm run migrate:status`

## Benefits Summary

1. **Rails-like Workflow**: Familiar migration pattern for developers
2. **Version Control**: Database changes are tracked like code
3. **Team Collaboration**: Consistent schema across all environments
4. **Safety**: Transactions prevent partial migrations
5. **Audit Trail**: Complete history of when changes were made
6. **Flexibility**: Can handle both schema and data migrations

## Future Enhancements

- Automatic migration execution on application startup
- Migration rollback capabilities
- Schema validation and drift detection
- Integration with CI/CD pipelines

---

This migration system provides a professional, Rails-like approach to database schema management while maintaining safety and auditability.