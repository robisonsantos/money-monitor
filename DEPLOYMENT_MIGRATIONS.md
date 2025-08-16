# Deployment Migrations Guide

This guide explains how database migrations are integrated into the Money Monitor deployment pipeline and how to manage them effectively.

## 🚀 Automatic Migration Deployment

### How It Works

Every Netlify deployment automatically runs database migrations as part of the build process:

```bash
# This runs automatically on every deployment:
npm run build:netlify
  ↓
npm run migrate  # ← Migrations run FIRST
  ↓  
vite build       # ← Build happens AFTER migrations succeed
```

### Deployment Flow

```
1. Code Push → GitHub
2. Netlify Trigger → Build Start
3. Install Dependencies
4. Run Migrations (npm run migrate)
   ├─ ✅ Success → Continue to Build
   └─ ❌ Failure → STOP (deployment aborted)
5. Build Application (vite build)
6. Deploy to CDN
7. Health Check
8. Deployment Complete ✅
```

## 📋 Migration Safety Features

### Build Integration Benefits
- **Atomic Deployments**: Migrations run before app deployment
- **Rollback Safety**: Failed migrations prevent broken app deployments
- **Visibility**: Migration status visible in Netlify build logs
- **Consistency**: Same migration process for all environments

### Transaction Safety
- Each migration runs in a database transaction
- Failed migrations automatically rollback
- No partial schema changes
- Database remains in consistent state

### Execution Tracking
- Executed migrations stored in `schema_migrations` table
- Unique timestamp IDs prevent duplicate execution
- Checksum validation ensures file integrity
- Success/failure status tracked

## 🛠 Creating and Deploying Migrations

### Step 1: Create Migration Locally

```bash
# Create new migration file
npm run migrate:create "add user notification preferences"

# This creates:
# migrations/20241210_143022_add_user_notification_preferences.sql
```

### Step 2: Write Migration SQL

```sql
-- Migration: Add user notification preferences
-- ID: 20241210_143022
-- Description: Add table for user notification settings

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  weekly_summary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id 
ON user_notification_preferences(user_id);

-- Add unique constraint - one preference record per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_notification_preferences
ON user_notification_preferences(user_id);

-- Set up updated_at trigger
DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at 
ON user_notification_preferences;

CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Test Locally

```bash
# Test migration locally first
npm run migrate:status    # Check current state
npm run migrate          # Run migration
npm run migrate:status    # Verify success

# Test application still works
npm run dev
```

### Step 4: Deploy

```bash
# Commit and push - migration runs automatically
git add migrations/
git commit -m "feat: add user notification preferences"
git push origin main

# Monitor deployment in Netlify dashboard
# Check build logs for migration output
```

## 📊 Monitoring Deployments

### Netlify Build Logs

During deployment, you'll see migration output:

```
🔄 Initializing migration system...
✅ Database connection verified
📋 Creating migrations table...
✅ Migrations table ready
🚀 Starting migration run...
📋 Found 1 pending migrations:
   • 20241210_143022_add_user_notification_preferences
📦 Executing migration: 20241210_143022_add_user_notification_preferences
✅ Migration completed: 20241210_143022_add_user_notification_preferences

🎉 Migration run completed!
   ✅ Executed: 1/1 migrations
   📊 Total migrations: 1
```

### Production Status Check

After deployment, verify migration status:

```bash
# Connect to production database
psql $DATABASE_URL

# Check migration history
SELECT id, name, executed_at, success 
FROM schema_migrations 
ORDER BY executed_at DESC;

# Verify new table exists
\d user_notification_preferences
```

## 🚨 Troubleshooting Failed Migrations

### Common Failure Scenarios

1. **Syntax Errors**
   ```
   ❌ Migration failed: 20241210_143022_add_user_notification_preferences
      Error: syntax error at or near "TABLEE"
   ```

2. **Constraint Violations**
   ```
   ❌ Migration failed: 20241210_143022_add_user_notification_preferences
      Error: duplicate key value violates unique constraint
   ```

3. **Missing Dependencies**
   ```
   ❌ Migration failed: 20241210_143022_add_user_notification_preferences
      Error: relation "users" does not exist
   ```

### Failure Response Process

When a migration fails during deployment:

1. **Deployment Stops**: Build aborts to prevent broken app deployment
2. **Database Safe**: Migration rollback keeps database consistent  
3. **Previous Version**: App continues running previous deployment
4. **Investigation**: Check Netlify build logs for specific error

### Recovery Steps

1. **Identify the Issue**
   ```bash
   # Check Netlify build logs for specific error
   # Common issues: syntax errors, constraint violations
   ```

2. **Fix the Migration**
   ```bash
   # NEVER modify executed migrations
   # Always create a new migration to fix issues
   npm run migrate:create "fix user notification preferences"
   ```

3. **Test Thoroughly**
   ```bash
   # Test fix locally
   npm run migrate
   npm run dev
   
   # Verify database state is correct
   npm run migrate:status
   ```

4. **Deploy Fix**
   ```bash
   git add migrations/
   git commit -m "fix: correct user notification preferences migration"
   git push origin main
   ```

### Emergency Procedures

For critical production issues:

1. **Manual Database Fix** (if needed)
   ```sql
   -- Connect to production database
   psql $DATABASE_URL
   
   -- Remove failed migration record to retry
   DELETE FROM schema_migrations WHERE id = '20241210_143022';
   
   -- Apply manual fixes if needed
   -- (Only if you understand the exact issue)
   ```

2. **Skip Problematic Migration** (extreme cases)
   ```sql
   -- Mark migration as executed without running it
   INSERT INTO schema_migrations (id, name, executed_at, success)
   VALUES ('20241210_143022', 'add_user_notification_preferences', NOW(), false);
   ```

3. **Contact Team**
   - Share exact error from build logs
   - Provide migration file content
   - Explain expected vs actual behavior

## 📝 Best Practices for Deployment

### Before Deploying

- ✅ **Test Locally**: Always run migration locally first
- ✅ **Review SQL**: Check for syntax errors and logic issues  
- ✅ **Check Dependencies**: Ensure referenced tables/columns exist
- ✅ **Consider Data**: Think about existing data impact
- ✅ **Backup Plan**: Know how to fix if something goes wrong

### Migration Writing

- ✅ **Use IF NOT EXISTS**: Make operations idempotent when possible
- ✅ **Handle NULLs**: Consider existing data when adding constraints
- ✅ **Add Indexes**: Include performance indexes in same migration
- ✅ **Use Transactions**: Wrap complex changes in BEGIN/COMMIT
- ✅ **Document Intent**: Clear comments explaining the changes

### During Deployment

- ✅ **Monitor Builds**: Watch Netlify build logs during deployment
- ✅ **Verify Success**: Check migration completed before celebrating
- ✅ **Test Application**: Verify app functionality after deployment
- ✅ **Check Database**: Confirm schema changes applied correctly

### After Deployment

- ✅ **Verify Migration**: Confirm migration recorded in schema_migrations
- ✅ **Test Features**: Ensure new functionality works as expected
- ✅ **Monitor Errors**: Watch for application errors related to schema changes
- ✅ **Performance Check**: Verify new indexes are being used

## 🔄 Rollback Strategies

### Application Rollback

```bash
# Revert to previous commit (if schema is backward compatible)
git revert HEAD
git push origin main

# This triggers new deployment with previous code
# But migration changes remain in database
```

### Schema Rollback

```bash
# Create reverse migration
npm run migrate:create "rollback user notification preferences"

# Write SQL to undo changes
# DROP TABLE user_notification_preferences;
# etc.
```

### Emergency Rollback

For critical issues requiring immediate rollback:

1. **Revert Application Code**: Deploy previous version
2. **Create Rollback Migration**: Undo schema changes if needed
3. **Monitor System**: Ensure stability after rollback
4. **Plan Forward Fix**: Create proper fix for next deployment

## 📈 Migration Performance

### Large Table Considerations

For migrations affecting large tables:

```sql
-- Use concurrent operations when possible (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_large_table_field ON large_table(field);

-- For large data migrations, consider batching
WITH batch AS (
  SELECT id FROM large_table 
  WHERE condition 
  LIMIT 10000
)
UPDATE large_table 
SET new_field = 'value'
FROM batch 
WHERE large_table.id = batch.id;
```

### Migration Timing

- **Low Traffic**: Deploy during low-traffic periods when possible
- **Quick Operations**: Keep migrations fast to minimize build time
- **Long Operations**: Consider splitting complex migrations into smaller ones
- **Lock Awareness**: Be aware of table locks during schema changes

---

This deployment migration system ensures safe, reliable database schema changes while maintaining application availability and data integrity.