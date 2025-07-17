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