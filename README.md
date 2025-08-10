# Money Monitor

A modern investment tracking application built with SvelteKit, SQLite, and Tailwind CSS. Track your portfolio performance over time with beautiful charts and comprehensive analytics.

## Features

- 📊 **Interactive Charts** - Daily, weekly, and monthly portfolio performance visualization
- 📈 **Advanced Filtering** - Time-based filters for detailed trend analysis
- 💰 **Portfolio Analytics** - Track current value, changes, best/worst days
- 📱 **Responsive Design** - Beautiful, fast, and mobile-friendly interface
- 🗄️ **SQLite Database** - Reliable local data storage with encrypted financial data
- 🔒 **Bank-Grade Security** - AES-256-GCM encryption for all financial portfolio values
- 👥 **Multi-User Support** - Secure user authentication and session management
- ⚡ **Modern Stack** - Built with Svelte 5 (runes mode), SvelteKit, and Tailwind CSS

## Security

This application implements **bank-grade security** for protecting your financial data:

### Encryption

- **Algorithm**: AES-256-GCM encryption with authentication
- **Scope**: All financial portfolio values are encrypted before storage
- **Key Management**: Uses environment-based encryption keys
- **Format**: Each encrypted value uses a unique initialization vector (IV) and authentication tag
- **Transparency**: Encryption/decryption happens automatically - no changes to user experience

### Data Protection

- Financial values are never stored in plain text in the database
- Each value uses a unique IV to prevent pattern analysis
- Authentication tags ensure data integrity and prevent tampering
- Encryption keys are managed through environment variables (never stored in code)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

#### Option A: Docker Setup (Recommended for Development)

1. Clone the repository:
```bash
git clone <repository-url>
cd money-monitor
```

2. **Quick setup with Docker**:
```bash
# Interactive configuration (sets up DATA_DIR and .env)
npm run configure

# Install dependencies
npm install

# Start PostgreSQL in Docker
npm run db:start

# Start development server
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

#### Option B: Manual PostgreSQL Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd money-monitor
```

2. Install dependencies:
```bash
npm install
```

3. **Set up PostgreSQL database**:
```bash
# Make sure PostgreSQL is running locally on port 5432
# Create the database
createdb money_monitor

# Or connect to your PostgreSQL instance and run:
# CREATE DATABASE money_monitor;
```

4. **Set up environment variables** (Required for security):
```bash
# Create a .env file in the project root
cat > .env << 'EOF'
# Encryption key for financial data (required)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/money_monitor
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=money_monitor
DB_SSL=false
EOF
```

   **⚠️ Important Security Notes:**
   - Both `ENCRYPTION_KEY` and database credentials are **required** for the application to function
   - **Never commit your `.env` file** to version control
   - **Back up your encryption key safely** - losing it means losing access to your encrypted data
   - Use a cryptographically secure 32-byte (64 hex characters) key
   - For production, use your hosting platform's environment variable system

   **Alternative key generation methods:**
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Using Python
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

5. **Set up database schema**:
```bash
npm run db:setup
```

6. **Migrate existing data** (if upgrading from SQLite):
```bash
# This will transfer all users and investments from SQLite to PostgreSQL
npm run db:migrate
```

7. Set up seed data (optional):
```bash
# Copy the example seed file to create your own
cp seed/seed_data.example.json seed/seed_data.json
# Edit seed/seed_data.json with your own data
```

8. Start the development server:
```bash
npm run dev
```

9. **Seed the database with sample data** (optional, requires dev server):
```bash
# In a new terminal window, while dev server is running:
npm run seed
```

10. Open [http://localhost:5173](http://localhost:5173) in your browser

## Docker Development Setup

For the easiest development experience, use Docker for your PostgreSQL database:

### Quick Start
```bash
npm run configure    # Interactive setup
npm run db:start     # Start PostgreSQL
npm run seed         # Seed with sample data (optional)
npm run dev          # Start application
```

### Docker Commands
```bash
npm run db:start         # Start PostgreSQL database
npm run db:start-admin   # Start with pgAdmin web interface
npm run db:stop          # Stop database
npm run db:status        # Check database status
npm run db:logs          # View database logs
npm run db:connect       # Open database shell
npm run db:reset         # Reset database (deletes all data)
```

### Configuration
- **Data Directory**: Configurable via `DATA_DIR` environment variable
- **Default Location**: `./postgres_data` (project directory)
- **Custom Setup**: Run `npm run configure` for interactive configuration
- **Manual Setup**: Copy `.env.example` to `.env` and customize

### Database Access
- **Host**: localhost:5432
- **Database**: money_monitor
- **Username**: postgres
- **Password**: dev_password_123
- **pgAdmin**: http://localhost:8080 (when using `npm run db:start-admin`)

### Seeding Data
The `npm run seed` command seeds the database directly and can be run independently:

```bash
# Make sure PostgreSQL is running
npm run db:start

# Seed the database (optional)
npm run seed
```

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker documentation.

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENCRYPTION_KEY` | ✅ Yes | 32-byte encryption key for financial data security | `a1b2c3d4e5f6...` (64 hex chars) |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/money_monitor` |
| `DB_HOST` | ⚠️ Fallback | Database host (used if DATABASE_URL not set) | `localhost` |
| `DB_PORT` | ⚠️ Fallback | Database port | `5432` |
| `DB_USER` | ⚠️ Fallback | Database username | `postgres` |
| `DB_PASSWORD` | ⚠️ Fallback | Database password | `your_password` |
| `DB_NAME` | ⚠️ Fallback | Database name | `money_monitor` |
| `DB_SSL` | ❌ No | Enable SSL connection | `true` or `false` |
| `DATA_DIR` | ❌ No | Docker PostgreSQL data directory | `./postgres_data` |

## Data Structure

### Seed Data Format

The seed data file (`seed/seed_data.json`) should follow this structure:

```json
{
  "YYYY": {
    "jan": 100000.0,
    "feb": 105000.0,
    ...
  }
}
```

- **Years**: Use 4-digit year format (e.g., "2023")
- **Months**: Use 3-letter abbreviations (jan, feb, mar, etc.)
- **Values**: Portfolio values as numbers (automatically encrypted when stored)

### Database

The application uses PostgreSQL for data storage with the following security features:

- **Encrypted Storage**: All financial values are encrypted using AES-256-GCM before storage
- **User Isolation**: Each user's data is completely isolated and scoped to their account
- **Session Security**: Secure session management with proper authentication
- **ACID Compliance**: PostgreSQL provides robust transaction support and data integrity
- **Scalability**: Production-ready database that can handle multiple concurrent users
- **Automatic Schema**: Database tables and indexes are automatically created on first run

Investment entries are stored with daily granularity, and all financial data is transparently encrypted/decrypted during operations.

#### Database Migration

If you're upgrading from a previous SQLite-based version:

1. Ensure your PostgreSQL database is set up and running
2. Run the migration script: `npm run db:migrate`
3. The script will automatically transfer all users and encrypted investment data
4. Database sequences will be updated to handle new inserts correctly

The migration preserves all encryption and user associations.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking
- `npm run db:setup` - Set up PostgreSQL database schema and default user
- `npm run db:migrate` - Migrate data from SQLite to PostgreSQL

## Testing

The application includes a comprehensive test suite with 41 unit tests covering core functionality, business logic, and data operations. The test suite provides regression prevention and ensures code quality.

### Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with interactive UI
npm run test:ui

# Run all tests (same as npm test)
npm run test:all
```

### Test Coverage

The test suite includes:

- **26 Utility Function Tests** (`src/lib/utils.test.ts`)
  - Data aggregation and filtering logic
  - Portfolio statistics calculations
  - Currency, percentage, and date formatting
  - CSV parsing and generation
  - File download functionality

- **15 Database Tests** (`src/lib/database.test.ts`)
  - CRUD operations for investment data
  - Bulk insert operations for CSV imports
  - Advanced queries and pagination
  - Database management functions

### Test Framework

- **Testing Framework**: Vitest
- **Test Environment**: JSDOM (for browser API simulation)
- **Mocking**: Comprehensive mocks for SQLite database and browser APIs
- **Coverage**: Detailed code coverage reporting available

### Running Tests

Tests are designed to run independently and include proper mocking for:
- SQLite database operations
- File system operations
- Browser APIs (File, URL, document)

Example test output:
```bash
✓ src/lib/utils.test.ts (26)
✓ src/lib/database.test.ts (15)

Test Files  2 passed (2)
Tests  41 passed (41)
```

### Writing Tests

When adding new features, please include corresponding tests:
- Add utility function tests to `src/lib/utils.test.ts`
- Add database operation tests to `src/lib/database.test.ts`
- Follow existing test patterns for consistency
- Ensure proper mocking for external dependencies

## Technology Stack

- **Framework**: SvelteKit with Svelte 5 (runes mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with pg client library
- **Charts**: Chart.js
- **Icons**: Lucide Svelte
- **Date Handling**: date-fns
- **Security**: AES-256-GCM encryption, bcrypt password hashing

## Project Structure

```
src/
├── lib/
│   ├── Chart.svelte          # Interactive chart component
│   ├── StatsCard.svelte      # Statistics display component
│   ├── database.ts           # SQLite database operations
│   └── utils.ts              # Utility functions and aggregation logic
├── routes/
│   ├── +layout.svelte        # Application layout
│   ├── +page.svelte          # Main dashboard
│   ├── +page.server.ts       # Server-side data loading
│   ├── add/+page.svelte      # Add new investment entry
│   └── api/investments/      # Investment API endpoints
└── app.css                   # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License. 