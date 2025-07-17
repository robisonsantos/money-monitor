import { readFileSync } from 'fs';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';

// Configuration
const API_BASE = 'http://localhost:5173';
const SEED_FILE = './seed/seed_data.json';

console.log('🌱 Seeding database with investment data...');

async function seedDatabase() {
  // Check if seed file exists
  let seedData;
  try {
    seedData = JSON.parse(readFileSync(SEED_FILE, 'utf-8'));
  } catch (error) {
    console.error(`❌ Error reading seed file: ${SEED_FILE}`);
    console.log('💡 Tip: Copy seed/seed_data.example.json to seed/seed_data.json and customize it');
    process.exit(1);
  }

  let totalEntries = 0;
  const today = new Date();

  // Convert monthly data to daily entries
  for (const [year, months] of Object.entries(seedData)) {
    for (const [month, value] of Object.entries(months)) {
      // Map month names to numbers
      const monthMap = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      
      const monthIndex = monthMap[month];
      if (monthIndex === undefined) continue;
      
      // Get all days in this month
      const monthStart = startOfMonth(new Date(parseInt(year), monthIndex));
      const monthEnd = endOfMonth(new Date(parseInt(year), monthIndex));
      
      // Skip future months
      if (isAfter(monthStart, today)) {
        console.log(`⏭️  Skipping future month: ${year}-${month}`);
        continue;
      }
      
      // Get all days in the month, but don't go beyond today
      const endDate = isBefore(monthEnd, today) ? monthEnd : today;
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: endDate });
      
      console.log(`📅 Processing ${year}-${month}: ${daysInMonth.length} days with value $${value.toLocaleString()}`);
      
      // Add an entry for each day in the month
      for (const day of daysInMonth) {
        const date = format(day, 'yyyy-MM-dd');
        
        try {
          const response = await fetch(`${API_BASE}/api/investments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              date,
              value
            })
          });

          if (!response.ok) {
            const error = await response.json();
            console.error(`❌ Error adding ${date}:`, error.error);
            continue;
          }

          totalEntries++;
          
          // Log every 50th entry to avoid spam
          if (totalEntries % 50 === 0) {
            console.log(`✅ Added ${totalEntries} entries... (latest: ${date})`);
          }
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 2));
          
        } catch (error) {
          console.error(`❌ Error adding ${date}:`, error.message);
        }
      }
    }
  }

  console.log(`\n🎉 Seeding complete! Added ${totalEntries} daily investment entries.`);

  // Show some stats
  try {
    const response = await fetch(`${API_BASE}/api/investments`);
    const investments = await response.json();
    console.log(`📊 Total entries in database: ${investments.length}`);

    if (investments.length > 0) {
      const first = investments[0];
      const latest = investments[investments.length - 1];
      console.log(`📈 First entry: ${first.date} - $${first.value.toLocaleString()}`);
      console.log(`📈 Latest entry: ${latest.date} - $${latest.value.toLocaleString()}`);
      console.log(`📅 Date range: ${first.date} to ${latest.date}`);
    }
  } catch (error) {
    console.error('❌ Error fetching final stats:', error.message);
  }
}

// Run the seeding
seedDatabase().catch(console.error); 