# Money Monitor

A modern investment tracking application built with SvelteKit, SQLite, and Tailwind CSS. Track your portfolio performance over time with beautiful charts and comprehensive analytics.

## Features

- 📊 **Interactive Charts** - Daily, weekly, and monthly portfolio performance visualization
- 📈 **Advanced Filtering** - Time-based filters for detailed trend analysis
- 💰 **Portfolio Analytics** - Track current value, changes, best/worst days
- 📱 **Responsive Design** - Beautiful, fast, and mobile-friendly interface
- 🗄️ **SQLite Database** - Reliable local data storage
- ⚡ **Modern Stack** - Built with Svelte 5 (runes mode), SvelteKit, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd money-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Set up seed data (optional):
```bash
# Copy the example seed file to create your own
cp seed/seed_data.example.json seed/seed_data.json
# Edit seed/seed_data.json with your own data
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

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
- **Values**: Portfolio values as numbers

### Database

The application uses SQLite for data storage. The database file (`data.db`) is automatically created on first run. Investment entries are stored with daily granularity.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking

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
- **Database**: SQLite with better-sqlite3
- **Charts**: Chart.js
- **Icons**: Lucide Svelte
- **Date Handling**: date-fns

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

This project is licensed under the MIT License - see the LICENSE file for details. 