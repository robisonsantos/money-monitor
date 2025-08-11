# Database Migrations

This directory contains database migration files for the Money Monitor application. Migrations are used to version control your database schema changes in a reliable and repeatable way.

## Migration File Format

Migration files must follow this naming convention:
```
YYYYMMDD_HHMMSS_description.sql
```

- **YYYYMMDD_HHMMSS**: Timestamp (e.g., `20241210_143022`)
- **description**: Snake_case description (e.g., `add_is_default_to_portfolios`)

### Example filename:
```
20241210_143022_add_is_default_to_portfolios.sql
```

## Migration File Structure

Each migration file should include:

```sql
-- Migration: Description of what this migration does
-- ID: 20241210_143022
-- Description: Detailed explanation of changes

-- Your SQL migration code here
ALTER TABLE example ADD COLUMN new_field VARCHAR(255);

-- Use IF NOT EXISTS for idempotency where possible
CREATE INDEX IF NOT EXISTS idx_example_field ON example(new_field);
```

## Commands

### Run Migrations
```bash
# Run all pending migrations
npm run migrate

# Show migration status
npm run migrate:status

# Create a new migration file
npm run migrate:create "add user preferences"
```

### Migration Status Examples

```
📊 Migration Status:
================================================================================
ID              | Name                           | Status    | Executed At
--------------------------------------------------------------------------------
20241210_143022 | add_is_default_to_portfolios   | ✅ Success | 2024-12-10 14:30:45
20241210_150000 | create_user_preferences        | ⏳ Pending | -
--------------------------------------------------------------------------------
Total: 2 | Executed: 1 | Pending: 1
```

## Best Practices

### 1. Make Migrations Idempotent
Always use `IF NOT EXISTS` or `IF EXISTS` where possible:

```sql
-- Good
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Avoid
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
```

### 2. Use Transactions for Complex Changes
For multi-step migrations:

```sql
BEGIN;

-- Multiple related changes
ALTER TABLE users ADD COLUMN temp_field VARCHAR(255);
UPDATE users SET temp_field = 'default_value';
ALTER TABLE users ALTER COLUMN temp_field SET NOT NULL;

COMMIT;
```

### 3. Handle Data Transformations Safely
When migrating data:

```sql
-- Update existing records to set default portfolio
WITH default_candidates AS (
  SELECT
    user_id,
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE WHEN name = 'Main Portfolio' THEN 0 ELSE 1 END,
        created_at ASC
    ) as rn
  FROM portfolios
  WHERE user_id NOT IN (
    SELECT user_id FROM portfolios WHERE is_default = true
  )
)
UPDATE portfolios
SET is_default = true
FROM default_candidates
WHERE portfolios.id = default_candidates.id
  AND default_candidates.rn = 1;
```

### 4. Add Proper Constraints
Always add database constraints to maintain data integrity:

```sql
-- Add unique constraint with proper handling of concurrent modifications
ALTER TABLE portfolios ADD CONSTRAINT unique_default_portfolio_per_user
  UNIQUE (user_id, is_default) DEFERRABLE INITIALLY DEFERRED;
```

## Migration Tracking

The system automatically tracks migrations in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
  id VARCHAR(255) PRIMARY KEY,          -- Migration timestamp ID
  name VARCHAR(255) NOT NULL,           -- Migration name
  executed_at TIMESTAMP WITH TIME ZONE, -- When it was executed
  checksum VARCHAR(64),                 -- Content checksum
  success BOOLEAN NOT NULL DEFAULT true -- Execution status
);
```

## Migration Lifecycle

1. **Create**: Use `npm run migrate:create "description"` to generate a new migration file
2. **Edit**: Add your SQL changes to the generated file
3. **Test**: Test the migration on a copy of production data
4. **Deploy**: Migrations run automatically during application startup
5. **Verify**: Check `npm run migrate:status` to confirm execution

## Environment Integration

- **Development**: Migrations run automatically when starting the app
- **Production**: Include `npm run migrate` in your deployment pipeline
- **Testing**: Migrations are part of the test database setup

## Rollbacks

This system doesn't support automatic rollbacks. For rollback scenarios:

1. Create a new migration that reverses the changes
2. Test thoroughly before deploying
3. Consider data backup strategies for critical changes

## Troubleshooting

### Migration Failed
```bash
# Check migration status
npm run migrate:status

# Review the failed migration
# Fix the SQL and create a new migration
npm run migrate:create "fix previous migration"
```

### Checksum Mismatch
If you need to modify an executed migration:
1. Create a new migration with the additional changes
2. Never modify executed migration files

### Database Schema Drift
```bash
# Compare current schema with migrations
npm run migrate:status

# Ensure all migrations are applied
npm run migrate
```

## Examples

See the existing migration files in this directory for examples:
- `20241210_000001_add_is_default_to_portfolios.sql` - Adding columns with constraints

---

For more information about the migration system, see the main database documentation in `DATABASE_SETUP.md`.