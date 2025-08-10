# Docker Database Setup for Money Monitor

This guide helps you set up a PostgreSQL database using Docker for local development of the Money Monitor application.

## Quick Start

1. **Setup the database**:
   ```bash
   npm run db:start
   ```

2. **Copy environment variables**:
   ```bash
   cp .env.development .env
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

Your Money Monitor app will be running at `http://localhost:5173` with a PostgreSQL database at `localhost:5432`.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ and npm

## Database Management Commands

### NPM Scripts (Recommended)

```bash
# Start PostgreSQL database
npm run db:start

# Start PostgreSQL + pgAdmin web interface
npm run db:start-admin

# Stop database services
npm run db:stop

# Check database status
npm run db:status

# View database logs
npm run db:logs

# Connect to database shell
npm run db:connect

# Reset database (deletes all data)
npm run db:reset
```

### Direct Script Usage

```bash
# All the same commands are available directly
./scripts/db-docker.sh start
./scripts/db-docker.sh start-admin
./scripts/db-docker.sh stop
./scripts/db-docker.sh status
./scripts/db-docker.sh logs
./scripts/db-docker.sh connect
./scripts/db-docker.sh reset
```

## Database Connection Details

| Setting | Value |
|---------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `money_monitor` |
| **Username** | `postgres` |
| **Password** | `dev_password_123` |
| **Data Volume** | `/Users/robison/Data/postgres_dkr` |

## Environment Configuration

The setup includes two environment files:

### `.env.development` (Template)
- Contains all development settings
- Safe to commit to version control
- Copy this to `.env` for local use

### `.env` (Your local config)
- Never commit this file
- Generated from `.env.development`
- Contains your actual development credentials

```bash
# Setup your local environment
cp .env.development .env
```

## Database Management Interface

### pgAdmin (Optional Web Interface)

Start with web interface:
```bash
npm run db:start-admin
```

Access pgAdmin:
- **URL**: http://localhost:8080
- **Email**: admin@moneymonitor.local
- **Password**: admin123

**Add server in pgAdmin**:
1. Right-click "Servers" → "Register" → "Server"
2. **General tab**: Name = "Money Monitor"
3. **Connection tab**:
   - Host: `postgres` (or `host.docker.internal` on macOS)
   - Port: `5432`
   - Database: `money_monitor`
   - Username: `postgres`
   - Password: `dev_password_123`

### Command Line Access

Connect directly to PostgreSQL:
```bash
npm run db:connect
```

This opens a `psql` shell where you can run SQL commands:
```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View investments (values are encrypted)
SELECT id, user_id, date, created_at FROM investments LIMIT 10;

-- Exit
\q
```

## Data Persistence

Your database data is stored in:
```
/Users/robison/Data/postgres_dkr
```

This directory is mounted to the Docker container, so your data persists between container restarts.

## Database Schema

The database is automatically initialized with:

### Tables
- **users**: User accounts with encrypted passwords
- **sessions**: Authentication sessions
- **investments**: Portfolio data (values encrypted with AES-256-GCM)

### Features
- Automatic timestamps (`created_at`, `updated_at`)
- Database triggers for timestamp updates
- Indexes for performance
- Foreign key constraints
- Unique constraints for data integrity

## Troubleshooting

### Database Won't Start

1. **Check Docker is running**:
   ```bash
   docker info
   ```

2. **Check port 5432 availability**:
   ```bash
   lsof -i :5432
   ```

3. **View container logs**:
   ```bash
   npm run db:logs
   ```

### Connection Issues

1. **Verify container is running**:
   ```bash
   npm run db:status
   ```

2. **Test connection**:
   ```bash
   npm run db:connect
   ```

3. **Check environment variables**:
   ```bash
   cat .env | grep DATABASE_URL
   ```

### Data Directory Issues

1. **Check permissions**:
   ```bash
   ls -la /Users/robison/Data/postgres_dkr
   ```

2. **Recreate directory**:
   ```bash
   sudo rm -rf /Users/robison/Data/postgres_dkr
   mkdir -p /Users/robison/Data/postgres_dkr
   ```

### Reset Everything

If you encounter persistent issues:
```bash
npm run db:reset
npm run db:start
```

This will:
- Stop all containers
- Remove all database data
- Remove Docker volumes
- Start fresh database

## Security Notes

### Development vs Production

- **Development**: Uses simple passwords and unencrypted connections
- **Production**: Requires strong passwords, SSL, and secure key management

### Encryption Key

The development encryption key is:
```
dev_key_32_bytes_for_local_development_only_never_use_in_production_123456
```

**⚠️ Never use this key in production!**

For production, generate a secure key:
```bash
openssl rand -hex 32
```

## Integration with Application

### Starting Development

```bash
# 1. Start database
npm run db:start

# 2. Setup environment
cp .env.development .env

# 3. Install dependencies (if not done)
npm install

# 4. Start application
npm run dev
```

### Running Tests

The test suite uses mocked database operations, so you don't need the Docker database running for tests:

```bash
npm test
```

### Seeding Data

If you have seed data:
```bash
# Make sure database is running
npm run db:start

# Run seed script
npm run seed
```

## Docker Compose Details

The setup uses `docker-compose.yml` with:

### Services
- **postgres**: PostgreSQL 15 Alpine
- **pgadmin**: pgAdmin 4 (optional, with profile)

### Volumes
- **Host mount**: `/Users/robison/Data/postgres_dkr` → `/var/lib/postgresql/data`
- **Init script**: `./scripts/init-db.sql` → `/docker-entrypoint-initdb.d/`

### Networks
- **money-monitor-network**: Bridge network for service communication

### Health Checks
- PostgreSQL health check with `pg_isready`
- 30-second timeout with retries