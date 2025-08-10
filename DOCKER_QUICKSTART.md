# Docker Quick Reference - Money Monitor

## 🚀 Quick Start (30 seconds)

```bash
# 1. Configure environment (interactive setup)
npm run configure

# 2. Start database
npm run db:start

# 3. Install & start
npm install
npm run dev
```

Visit: http://localhost:5173

## 📋 Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run db:start` | Start PostgreSQL database |
| `npm run db:stop` | Stop database |
| `npm run db:status` | Check database status |
| `npm run db:logs` | View database logs |
| `npm run db:connect` | Open database shell |
| `npm run db:reset` | ⚠️ Delete all data |

## 🔧 Database Info

| Setting | Value |
|---------|-------|
| **Host** | localhost |
| **Port** | 5432 |
| **Database** | money_monitor |
| **User** | postgres |
| **Password** | dev_password_123 |

## 📊 Optional: pgAdmin Web Interface

```bash
# Start with web management
npm run db:start-admin

# Access pgAdmin
open http://localhost:8080
```

**pgAdmin Login:**
- Email: admin@moneymonitor.local
- Password: admin123

## 🗂️ Data Location

Database files are stored in your configured DATA_DIR:
- **Default**: `./postgres_data` (project directory)
- **Customizable**: Set via `DATA_DIR` environment variable
- **Examples**: 
  - macOS: `~/Data/postgres_dkr`
  - Linux: `~/docker-data/postgres_dkr`
  - Custom: `/your/custom/path`

Check your current setting:
```bash
echo $DATA_DIR
# or check your .env file
grep DATA_DIR .env
```

## 🆘 Troubleshooting

### Database won't start?
```bash
# Check Docker is running
docker info

# View error logs
npm run db:logs

# Reset everything
npm run db:reset
npm run db:start
```

### Port 5432 already in use?
```bash
# Find what's using port 5432
lsof -i :5432

# Stop local PostgreSQL if running
brew services stop postgresql
```

### Permission issues?
```bash
# Fix data directory permissions (replace with your DATA_DIR)
sudo chown -R $(whoami) $DATA_DIR
```

## 🔄 Complete Reset

```bash
# Stop everything
npm run db:stop

# Remove all data (this will delete your DATA_DIR)
npm run db:reset

# Or manually (replace with your actual path)
# rm -rf $DATA_DIR

# Start fresh
npm run db:start
```

## 📝 Development Workflow

```bash
# Daily startup
npm run db:start        # Start database
npm run dev            # Start app

# Daily shutdown
# Ctrl+C                # Stop app
npm run db:stop        # Stop database
```

## 🔐 Security Notes

- ⚠️ These are **development credentials only**
- Never use `dev_password_123` in production
- Generate secure keys: `openssl rand -hex 32`
- The `.env` file is gitignored for security

## 🔧 Configuration

### First Time Setup
```bash
# Interactive configuration (recommended)
npm run configure

# Or copy and edit manually
cp .env.example .env
# Edit DATA_DIR in .env file
```

### Custom Data Directory
```bash
# Set custom path before starting
export DATA_DIR=/your/custom/path
npm run db:start

# Or set in .env file
echo "DATA_DIR=/your/custom/path" >> .env
```

## 🐛 Common Issues

### VS Code: "Svelte language server detected large amount of files"

**Quick fix:**
```
Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"
Ctrl/Cmd + Shift + P → "Svelte: Restart Language Server"
```

**Or clean restart:**
```bash
npm run dev:clean  # Cleans build files and restarts
```

**Root cause:** TypeScript analyzing too many files
**Solution:** Project includes optimized configs to prevent this

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

## 📚 Full Documentation

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Complete setup guide
- [README.md](./README.md) - Application overview
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and fixes