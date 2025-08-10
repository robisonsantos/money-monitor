# Troubleshooting Guide - Money Monitor

This guide helps resolve common development issues with the Money Monitor application.

## Svelte Language Server Performance Issues

### Issue: "Svelte language server detected a large amount of JS/Svelte files"

This warning appears when the Svelte language server tries to analyze too many files, causing slow performance.

#### Quick Fixes

1. **Restart Language Servers** (VS Code):
   ```
   Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"
   Ctrl/Cmd + Shift + P → "Svelte: Restart Language Server"
   ```

2. **Use VS Code Task** (if using provided tasks):
   ```
   Ctrl/Cmd + Shift + P → "Tasks: Run Task" → "Clean and Restart Language Servers"
   ```

3. **Clean Build Artifacts**:
   ```bash
   rm -rf .svelte-kit build dist coverage node_modules/.vite
   npm install
   ```

#### Root Causes & Solutions

**Problem**: TypeScript/Svelte analyzing unnecessary files
**Solution**: Our project includes optimized configurations that should prevent this:

- ✅ `tsconfig.json` - Excludes `node_modules`, `postgres_data`, build directories
- ✅ `.vscode/settings.json` - File exclusions and watcher optimizations
- ✅ `vite.config.ts` - File watching restrictions
- ✅ `.gitignore` - Prevents tracking unnecessary files

**If issue persists**:

1. **Check your data directory location**:
   ```bash
   # Make sure postgres_data is in project root or properly excluded
   echo $DATA_DIR
   ls -la postgres_data/  # Should be excluded from VS Code
   ```

2. **Verify VS Code settings are applied**:
   - Open VS Code Settings (JSON)
   - Confirm exclusions are present: `"**/postgres_data": true`

3. **Check for large directories**:
   ```bash
   # Find directories with many JS/TS files
   find . -name "*.js" -o -name "*.ts" -o -name "*.svelte" | head -20
   # Should not show files from node_modules or postgres_data
   ```

4. **Reset VS Code workspace**:
   ```
   Close VS Code → Delete .vscode/settings.local.json → Reopen project
   ```

#### Manual Configuration

If automatic configuration isn't working, manually add to your VS Code settings:

```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/.svelte-kit": true,
    "**/postgres_data": true,
    "**/build": true,
    "**/dist": true,
    "**/coverage": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.svelte-kit/**": true,
    "**/postgres_data/**": true
  },
  "typescript.tsc.autoDetect": "off"
}
```

---

## Database Connection Issues

### Issue: "Cannot connect to PostgreSQL"

#### Check Database Status
```bash
npm run db:status
```

#### Common Solutions

1. **Database not running**:
   ```bash
   npm run db:start
   ```

2. **Port 5432 in use**:
   ```bash
   # Check what's using the port
   lsof -i :5432
   
   # Stop local PostgreSQL if running
   brew services stop postgresql  # macOS
   sudo systemctl stop postgresql  # Linux
   ```

3. **Docker not running**:
   ```bash
   # Start Docker Desktop
   docker info  # Should not show errors
   ```

4. **Environment configuration**:
   ```bash
   # Check your .env file
   cat .env | grep DATABASE_URL
   
   # Reconfigure if needed
   npm run configure
   ```

#### Reset Database
```bash
npm run db:reset  # WARNING: Deletes all data
npm run db:start
```

---

## Build and Development Issues

### Issue: "Module not found" or Import Errors

1. **Clear cache and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json .svelte-kit
   npm install
   ```

2. **Check TypeScript paths**:
   ```bash
   npm run check  # Verify TypeScript configuration
   ```

3. **Restart development server**:
   ```bash
   # Stop dev server (Ctrl+C)
   npm run dev
   ```

### Issue: "Permission denied" (Data Directory)

```bash
# Fix data directory permissions
sudo chown -R $(whoami) $DATA_DIR
# Or use project directory
export DATA_DIR="./postgres_data"
npm run db:start
```

### Issue: Environment Variables Not Loading

1. **Check .env file exists**:
   ```bash
   ls -la .env
   # If missing, run: npm run configure
   ```

2. **Verify environment variables**:
   ```bash
   # Check required variables are set
   grep -E "(DATABASE_URL|ENCRYPTION_KEY|DATA_DIR)" .env
   ```

3. **Regenerate configuration**:
   ```bash
   rm .env
   npm run configure
   ```

---

## Testing Issues

### Issue: Tests Failing

1. **Database not required for tests** (they use mocks):
   ```bash
   npm test  # Should work without database
   ```

2. **Clear test cache**:
   ```bash
   npm test -- --clearCache
   ```

3. **Update snapshots** (if applicable):
   ```bash
   npm test -- --updateSnapshot
   ```

### Issue: "vitest command not found"

```bash
# Reinstall dependencies
npm install
# Or run directly
npx vitest
```

---

## Performance Optimization

### Slow Development Server

1. **Exclude large directories from watching**:
   - Already configured in `vite.config.ts`
   - Check `DATA_DIR` is not in project root if possible

2. **Disable TypeScript checking in development**:
   ```json
   // In .vscode/settings.json
   {
     "typescript.tsc.autoDetect": "off",
     "typescript.disableAutomaticTypeAcquisition": true
   }
   ```

3. **Use project-relative data directory**:
   ```bash
   # Faster than external directories for some systems
   export DATA_DIR="./postgres_data"
   npm run db:start
   ```

### Memory Usage

1. **Large postgres_data directory**:
   ```bash
   # Check size
   du -sh $DATA_DIR
   
   # Clean old data if needed
   npm run db:reset
   ```

2. **Node.js memory limits**:
   ```bash
   # Increase memory for large projects
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run dev
   ```

---

## VS Code Specific Issues

### Extensions Not Working

1. **Required extensions**:
   - Svelte for VS Code
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense

2. **Install recommended extensions**:
   ```
   Ctrl/Cmd + Shift + P → "Extensions: Show Recommended Extensions"
   ```

3. **Disable conflicting extensions**:
   - Disable Vetur if installed (conflicts with Svelte extension)
   - Disable old Vue extensions

### Formatting Issues

1. **Set default formatters** (already configured):
   - Svelte files: Svelte extension
   - TypeScript/JavaScript: Prettier

2. **Format on save not working**:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.organizeImports": "explicit"
     }
   }
   ```

---

## Getting Help

### Debug Information Collection

When reporting issues, include:

```bash
# System information
node --version
npm --version
docker --version

# Project status
npm run db:status
npm run check

# Environment
echo $DATA_DIR
cat .env | grep -v "ENCRYPTION_KEY\|PASSWORD"  # Don't share secrets!

# VS Code extensions
code --list-extensions | grep -E "(svelte|typescript|tailwind)"
```

### Common Commands Reference

```bash
# Development
npm run configure     # Interactive setup
npm run dev          # Start development server
npm run check        # Type checking

# Database
npm run db:start     # Start PostgreSQL
npm run db:stop      # Stop PostgreSQL
npm run db:status    # Check status
npm run db:logs      # View logs
npm run db:reset     # Reset (deletes data)

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode

# Cleanup
rm -rf .svelte-kit build dist coverage
npm install
```

### Reset Everything

Nuclear option if nothing else works:

```bash
# Stop all services
npm run db:stop

# Clean everything
rm -rf node_modules package-lock.json .svelte-kit build dist coverage
rm .env

# Reconfigure
npm install
npm run configure
npm run db:start
npm run dev
```

This will give you a completely fresh environment.