# Netlify Deployment Guide

This guide covers deploying the Money Monitor application to Netlify with automated database migrations and production-ready configuration.

## 🚀 Quick Start

### Prerequisites
- Netlify account
- PostgreSQL database (managed service recommended)
- GitHub repository connected to Netlify

### 1-Minute Deployment
```bash
# 1. Push your code (pre-push hook handles npm registry conversion)
git push origin main

# 2. Connect repo to Netlify and set environment variables:
# ENCRYPTION_KEY, DATABASE_URL, NODE_ENV=production

# 3. Deploy - migrations run automatically during build!
# Build logs will show migration status and any pending changes
```

---

## 📋 Detailed Setup

### Step 1: Database Setup

#### Recommended: Managed PostgreSQL
Choose one of these managed PostgreSQL services:

**Vercel Postgres** (Recommended for Netlify)
```bash
# Create database in Vercel dashboard
# Copy DATABASE_URL from Vercel
```

**Railway PostgreSQL**
```bash
# Create database in Railway dashboard
# Copy DATABASE_URL from Railway
```

**Neon PostgreSQL** (Serverless)
```bash
# Create database at neon.tech
# Copy connection string
```

**Supabase PostgreSQL**
```bash
# Create project at supabase.com
# Copy DATABASE_URL from project settings
```

#### Self-Hosted Option
```bash
# If using your own PostgreSQL server:
DATABASE_URL=postgresql://username:password@host:port/database_name
```

### Step 2: Environment Variables

Set these in your Netlify dashboard under **Site Settings > Environment Variables**:

#### Required Variables
```bash
# Generate secure 64-character encryption key
ENCRYPTION_KEY=<run: openssl rand -hex 32>

# Database connection
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Production environment
NODE_ENV=production
```

#### Optional Variables
```bash
# Enable SSL for production databases (recommended)
DB_SSL=true

# Custom rate limiting (default: enabled in production)
RATE_LIMIT_ENABLED=true

# Session security (auto-generated if not set)
SESSION_SECRET=<random-string>
```

### Step 3: Netlify Site Configuration

#### Connect Repository
1. Go to Netlify dashboard
2. Click "New site from Git"
3. Connect your GitHub repository
4. Select your Money Monitor repository

#### Build Settings
Netlify will automatically detect your `netlify.toml` configuration:

```toml
[build]
  publish = "build"
  command = "npm run build:netlify"

[build.environment]
  NODE_VERSION = "18"
```

The `build:netlify` command automatically:
1. Runs database migrations
2. Builds the application
3. Verifies deployment health

### Step 4: Deploy

#### First Deployment
```bash
# Trigger deployment by pushing to main branch
git push origin main

# Or trigger manual deploy in Netlify dashboard
```

#### Build Process
During build, you'll see:
```
🚀 Starting automated production migration...
🔌 Connecting to database...
✅ Database connection established
📋 Applying migrations...
✅ Migration 'Initial PostgreSQL Schema': SUCCESS
✅ Migration 'Portfolio Support Migration': SUCCESS
🏥 Running post-migration health check...
✅ All migrations completed successfully!
🎉 Building application...
```

---

## 🔧 Automated Migration System

### How It Works

The automated migration system:
- **Runs during every deployment** via `npm run build:netlify`
- **Is fully backward compatible** - never breaks existing data
- **Uses transactions** - all changes are atomic
- **Tracks state** - knows what migrations have been applied
- **Self-healing** - can recover from partial failures
- **Comprehensive logging** - full visibility in Netlify build logs

### Migration Safety Features

#### Idempotent Operations
```sql
-- Migrations use safe patterns like:
CREATE TABLE IF NOT EXISTS portfolios (...);
ALTER TABLE investments ADD COLUMN IF NOT EXISTS portfolio_id INTEGER;
```

#### Transaction Rollback
```javascript
// Each migration runs in a transaction
await client.query('BEGIN');
await client.query(migrationSQL);
await client.query('COMMIT');  // Only commits if successful
```

#### State Verification
```javascript
// Verifies database state before and after migrations
const verified = await verifyMigrationState(pool, migration);
if (!verified) {
  throw new Error('Migration verification failed');
}
```

#### Migration Tracking
```sql
-- Tracks which migrations have been applied
CREATE TABLE schema_migrations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  checksum VARCHAR(64) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true
);
```

### Available Migrations

1. **Initial Schema** (`initial_schema`)
   - Creates users, investments, sessions tables
   - Sets up indexes and constraints
   - Creates utility functions

2. **Portfolio Support** (`portfolio_support`)
   - Adds portfolios table
   - Adds portfolio_id to investments
   - Migrates existing data to "Main Portfolio"
   - Maintains backward compatibility
## 🔄 Database Migrations

### Overview
The application uses a Rails-like migration system with timestamped SQL files in the `migrations/` directory. **Migrations run automatically during every Netlify deployment** as part of the build process.

### Migration System Features
- **Automatic Execution**: Migrations run during `npm run build:netlify`
- **Build Integration**: Migration status visible in Netlify build logs
- **Safety**: Build fails if migrations fail, preventing broken deployments
- **Tracking**: Executed migrations tracked in `schema_migrations` table
- **Idempotent**: Safe to run multiple times

### Adding New Migrations

1. **Create migration file locally**:
```bash
npm run migrate:create "add user preferences"
# Creates: migrations/20241210_143022_add_user_preferences.sql
```

2. **Edit the generated migration file**:
```sql
-- Migration: Add user preferences
-- ID: 20241210_143022
-- Description: Add preferences table for user settings

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
```

3. **Deploy**:
```bash
git add migrations/
git commit -m "feat: add user preferences table"
git push origin main  # Migration runs automatically during build
```

### Migration Build Logs
During deployment, you'll see migration output in Netlify build logs:
```
🔄 Initializing migration system...
✅ Database connection verified
🚀 Starting migration run...
📋 Found 1 pending migrations:
   • 20241210_143022_add_user_preferences
✅ Migration completed: 20241210_143022_add_user_preferences
🎉 Migration run completed!
```

---

## 🔍 Monitoring & Troubleshooting

### Build Logs

Monitor migrations in Netlify build logs:
```
# Successful migration
✅ Migration 'Portfolio Support Migration' applied successfully
🎉 All migrations completed successfully!

# Skipped migration (already applied)
✅ Migration 'Initial PostgreSQL Schema' already applied, skipping

# Failed migration
❌ Migration 'New Feature' failed: relation already exists
🔄 Transaction rolled back
```

### Health Checks

The system performs comprehensive health checks:
- Database connectivity
- Table existence
- Data integrity (no orphaned records)
- Migration history validation

### Common Issues & Solutions

#### "Migration already applied" Warning
```
✅ Migration already in correct state, recording as applied
```
**Solution**: This is normal - the system detected the migration was already applied manually.

#### "Database connection failed"
```
❌ Database connection failed: password authentication failed
```
**Solutions**:
1. Verify `DATABASE_URL` is correct in Netlify environment variables
2. Check database credentials and permissions
3. Ensure database accepts connections from Netlify's IP ranges
4. For managed databases, verify SSL settings

#### "Table already exists" Error
```
❌ Migration failed: relation "portfolios" already exists
```
**Solution**: This usually means a migration was partially applied. The system will automatically recover on the next deployment.

#### "No orphaned investments" Check Failed
```
❌ No orphaned investments: FAIL
   └─ Expected: 0, Found: 5
```
**Solution**: Run the portfolio migration manually:
```bash
# Connect to your database and run:
UPDATE investments
SET portfolio_id = (
  SELECT id FROM portfolios
  WHERE user_id = investments.user_id
  AND name = 'Main Portfolio'
)
WHERE portfolio_id IS NULL;
```

### Manual Migration Management

If you need to manually check or manage migrations:

```bash
# 1. Connect to your production database
psql $DATABASE_URL

# 2. Check migration status
SELECT id, name, executed_at, success FROM schema_migrations ORDER BY id;

# 3. Check pending migrations locally
npm run migrate:status

# 4. Verify current schema
\d users
\d investments  
\d portfolios
\d sessions
```

### Migration Troubleshooting

If a migration fails during deployment:

1. **Check Netlify build logs** for specific migration error
2. **Fix the migration SQL** and create a new migration file
3. **Never modify executed migrations** - always create new ones
4. **Test locally** before deploying:
   ```bash
   npm run migrate        # Run locally first
   npm run migrate:status # Verify success
   ```

### Rollback Strategy

If you need to rollback:

1. **Application rollback**:
```bash
# Revert to previous commit
git revert HEAD
git push origin main  # Triggers new deployment
```

2. **Database rollback**:
```bash
# Restore from database backup
# Or run reverse migration scripts
```

---

## 🔐 Security Best Practices

### Environment Variables
- **Never commit** `.env` files to git
- **Use Netlify's environment variables** for all secrets
- **Rotate encryption keys** periodically (requires data re-encryption)
- **Use strong passwords** for database connections

### Database Security
- **Enable SSL** for production databases (`DB_SSL=true`)
- **Use managed databases** when possible (automatic security updates)
- **Restrict database access** to necessary IP ranges
- **Regular backups** with encryption at rest

### Application Security
```toml
# netlify.toml includes security headers
[headers.values]
  X-Frame-Options = "DENY"
  X-XSS-Protection = "1; mode=block"
  X-Content-Type-Options = "nosniff"
  Content-Security-Policy = "default-src 'self'..."
```

---

## 📊 Performance Optimization

### Netlify Settings
- **Edge functions**: Disabled by default (can be enabled for better performance)
- **Build splitting**: Enabled for better caching
- **Asset optimization**: Automatic compression and caching

### Database Optimization
- **Connection pooling**: Automatic with pg.Pool
- **Query optimization**: Indexed columns for common queries
- **Session cleanup**: Automated removal of expired sessions

### Monitoring
- **Netlify Analytics**: Monitor site performance
- **Database monitoring**: Use your database provider's monitoring tools
- **Error tracking**: Check Netlify build logs and function logs

---

## 🧪 Testing Deployments

### Preview Deployments
Netlify automatically creates preview deployments for pull requests:
```bash
# Preview deployments run with:
npm run build:preview  # Uses development mode but with migrations
```

### Production Testing Checklist

After deployment, verify:

1. **Authentication**
   - [ ] User registration works
   - [ ] Login/logout functions
   - [ ] Session persistence

2. **Portfolio Management**
   - [ ] Create new portfolio
   - [ ] Switch between portfolios
   - [ ] Portfolio-specific data isolation

3. **Investment Tracking**
   - [ ] Add investment entries
   - [ ] Edit existing entries
   - [ ] Delete entries
   - [ ] Data encryption working

4. **CSV Operations**
   - [ ] Export portfolio data
   - [ ] Import CSV data
   - [ ] Portfolio-aware import/export

5. **Navigation**
   - [ ] Breadcrumbs show correct portfolio
   - [ ] Navigation between pages works
   - [ ] Responsive design on mobile

### Automated Verification

The deployment includes automatic verification:
```bash
# Run verification manually
npm run verify:deployment

# Or check Netlify build logs for verification results
```

---

## 🔄 Continuous Deployment

### Automatic Deployments
- **Main branch**: Automatic production deployment
- **Pull requests**: Automatic preview deployments
- **Migration safety**: All deployments include automated migrations

### Branch Protection
Recommended GitHub branch protection rules:
- Require pull request reviews
- Require status checks (tests pass)
- Require up-to-date branches
- Include administrators

### Deployment Workflow
```mermaid
graph TD
  A[Code Push] --> B[Netlify Build Triggered]
  B --> C[Run Migrations]
  C --> D[Build Application]
  D --> E[Deploy to CDN]
  E --> F[Health Check]
  F --> G[Deployment Complete]

  C --> H[Migration Failed?]
  H --> I[Rollback & Alert]
```

---

## 🆘 Support & Resources

### Documentation
- [Netlify Documentation](https://docs.netlify.com/)
- [SvelteKit Adapter Netlify](https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Getting Help
1. **Check build logs** in Netlify dashboard
2. **Review this guide** for common issues
3. **Check database logs** in your database provider's dashboard
4. **Test locally** with `npm run migrate:production`

### Common Commands
```bash
# Local development
npm run dev

# Test migrations locally
npm run migrate:production

# Verify deployment health
npm run verify:deployment

# Build for production
npm run build:netlify

# Clean build
npm run dev:clean
```

---

**🎉 Congratulations!** Your Money Monitor application is now deployed on Netlify with automated, backward-compatible database migrations. The system will handle all future deployments safely and automatically.
