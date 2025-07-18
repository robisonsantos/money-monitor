import { format, startOfWeek, startOfMonth, parseISO, isWithinInterval } from 'date-fns';
import type { Investment } from './database';
import { sanitizeCSVValue } from './sanitize';

export interface AggregatedData {
  date: string;
  value: number;
  change?: number;
  changePercent?: number;
}

export type AggregationPeriod = 'daily' | 'weekly' | 'monthly';

export type TimeFilter = {
  daily: '7d' | '30d' | '60d' | 'all';
  weekly: '4w' | '12w' | '24w' | 'all';
  monthly: '3m' | '6m' | '12m' | 'all';
};

export type FilterPeriod = TimeFilter[keyof TimeFilter];

export const FILTER_OPTIONS = {
  daily: [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '60d', label: 'Last 60 days' },
    { value: 'all', label: 'All time' }
  ],
  weekly: [
    { value: '4w', label: 'Last 4 weeks' },
    { value: '12w', label: 'Last 12 weeks' },
    { value: '24w', label: 'Last 24 weeks' },
    { value: 'all', label: 'All time' }
  ],
  monthly: [
    { value: '3m', label: 'Last 3 months' },
    { value: '6m', label: 'Last 6 months' },
    { value: '12m', label: 'Last 12 months' },
    { value: 'all', label: 'All time' }
  ]
} as const;

function filterByPeriod(
  data: AggregatedData[],
  period: AggregationPeriod,
  filter: FilterPeriod
): AggregatedData[] {
  if (filter === 'all' || data.length === 0) return data;

  const now = new Date();
  const cutoffMap: Record<string, Date> = {
    // Daily filters
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '60d': new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    // Weekly filters (assuming weeks start on Monday)
    '4w': new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000),
    '12w': new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000),
    '24w': new Date(now.getTime() - 24 * 7 * 24 * 60 * 60 * 1000),
    // Monthly filters (approximate)
    '3m': new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000),
    '6m': new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
    '12m': new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000),
  };

  const cutoff = cutoffMap[filter];
  if (!cutoff) return data;

  return data.filter(item => parseISO(item.date) >= cutoff);
}

export function aggregateInvestments(
  investments: Investment[],
  period: AggregationPeriod,
  filter: FilterPeriod = 'all'
): AggregatedData[] {
  if (investments.length === 0) return [];

  const sortedInvestments = [...investments].sort((a, b) => a.date.localeCompare(b.date));

  let aggregated: AggregatedData[];

  switch (period) {
    case 'daily':
      aggregated = sortedInvestments.map((investment, index) => {
        const prevInvestment = index > 0 ? sortedInvestments[index - 1] : null;
        const change = prevInvestment ? investment.value - prevInvestment.value : 0;
        const changePercent = prevInvestment ? (change / prevInvestment.value) * 100 : 0;

        return {
          date: investment.date,
          value: investment.value,
          change,
          changePercent
        };
      });
      break;

    case 'weekly':
      aggregated = aggregateByPeriod(sortedInvestments, (date) => 
        format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      );
      break;

    case 'monthly':
      aggregated = aggregateByPeriod(sortedInvestments, (date) => 
        format(startOfMonth(parseISO(date)), 'yyyy-MM-dd')
      );
      break;

    default:
      aggregated = [];
  }

  return filterByPeriod(aggregated, period, filter);
}

function aggregateByPeriod(
  investments: Investment[],
  getPeriodKey: (date: string) => string
): AggregatedData[] {
  const periodMap = new Map<string, Investment[]>();

  // Group investments by period
  investments.forEach(investment => {
    const periodKey = getPeriodKey(investment.date);
    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, []);
    }
    periodMap.get(periodKey)!.push(investment);
  });

  // Get the last investment value for each period
  const aggregated: AggregatedData[] = [];
  const sortedPeriods = Array.from(periodMap.keys()).sort();

  sortedPeriods.forEach((periodKey, index) => {
    const periodInvestments = periodMap.get(periodKey)!;
    const lastInvestment = periodInvestments[periodInvestments.length - 1];
    
    const prevPeriod = index > 0 ? aggregated[index - 1] : null;
    const change = prevPeriod ? lastInvestment.value - prevPeriod.value : 0;
    const changePercent = prevPeriod ? (change / prevPeriod.value) * 100 : 0;

    aggregated.push({
      date: periodKey,
      value: lastInvestment.value,
      change,
      changePercent
    });
  });

  return aggregated;
}

export function calculatePortfolioStats(investments: Investment[]) {
  if (investments.length === 0) {
    return {
      totalValue: 0,
      totalChange: 0,
      totalChangePercent: 0,
      bestDay: null,
      worstDay: null,
      totalDays: 0
    };
  }

  const sortedInvestments = [...investments].sort((a, b) => a.date.localeCompare(b.date));
  const firstInvestment = sortedInvestments[0];
  const lastInvestment = sortedInvestments[sortedInvestments.length - 1];

  const totalValue = lastInvestment.value;
  const totalChange = totalValue - firstInvestment.value;
  const totalChangePercent = (totalChange / firstInvestment.value) * 100;

  // Find best and worst days
  let bestDay: { date: string; change: number; changePercent: number } | null = null;
  let worstDay: { date: string; change: number; changePercent: number } | null = null;

  for (let i = 1; i < sortedInvestments.length; i++) {
    const current = sortedInvestments[i];
    const previous = sortedInvestments[i - 1];
    const change = current.value - previous.value;
    const changePercent = (change / previous.value) * 100;

    if (!bestDay || changePercent > bestDay.changePercent) {
      bestDay = { date: current.date, change, changePercent };
    }

    if (!worstDay || changePercent < worstDay.changePercent) {
      worstDay = { date: current.date, change, changePercent };
    }
  }

  return {
    totalValue,
    totalChange,
    totalChangePercent,
    bestDay,
    worstDay,
    totalDays: investments.length
  };
}

export function calculateFilteredPortfolioStats(aggregatedData: AggregatedData[]) {
  if (aggregatedData.length === 0) {
    return {
      totalValue: 0,
      totalChange: 0,
      totalChangePercent: 0,
      bestDay: null,
      worstDay: null,
      totalDays: 0
    };
  }

  const firstEntry = aggregatedData[0];
  const lastEntry = aggregatedData[aggregatedData.length - 1];

  const totalValue = lastEntry.value;
  const totalChange = totalValue - firstEntry.value;
  const totalChangePercent = firstEntry.value !== 0 ? (totalChange / firstEntry.value) * 100 : 0;

  // Find best and worst days from the aggregated data
  let bestDay: { date: string; change: number; changePercent: number } | null = null;
  let worstDay: { date: string; change: number; changePercent: number } | null = null;

  for (const entry of aggregatedData) {
    if (entry.change !== undefined && entry.changePercent !== undefined) {
      if (!bestDay || entry.changePercent > bestDay.changePercent) {
        bestDay = { 
          date: entry.date, 
          change: entry.change, 
          changePercent: entry.changePercent 
        };
      }

      if (!worstDay || entry.changePercent < worstDay.changePercent) {
        worstDay = { 
          date: entry.date, 
          change: entry.change, 
          changePercent: entry.changePercent 
        };
      }
    }
  }

  return {
    totalValue,
    totalChange,
    totalChangePercent,
    bestDay,
    worstDay,
    totalDays: aggregatedData.length
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM dd, yyyy');
}

export interface CSVRow {
  date: string;
  value: number;
}

export interface CSVValidationResult {
  isValid: boolean;
  data: CSVRow[];
  errors: string[];
}

export function parseCSV(csvContent: string): CSVValidationResult {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const data: CSVRow[] = [];

  if (lines.length === 0) {
    return { isValid: false, data: [], errors: ['CSV file is empty'] };
  }

  // Check for header (optional - we'll handle both with and without header)
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('date') && firstLine.includes('value')) {
    startIndex = 1; // Skip header
  }

  if (lines.length === startIndex) {
    return { isValid: false, data: [], errors: ['CSV file has no data rows'] };
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
    
    if (columns.length !== 2) {
      errors.push(`Row ${i + 1}: Expected 2 columns (date, value), got ${columns.length}`);
      continue;
    }

    const [dateStr, valueStr] = columns;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      errors.push(`Row ${i + 1}: Invalid date format "${dateStr}". Expected YYYY-MM-DD`);
      continue;
    }

    // Validate date is a real date
    try {
      const parsedDate = parseISO(dateStr);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Row ${i + 1}: Invalid date "${dateStr}"`);
        continue;
      }
    } catch {
      errors.push(`Row ${i + 1}: Invalid date "${dateStr}"`);
      continue;
    }

    // Validate value
    const value = parseFloat(valueStr);
    if (isNaN(value) || value < 0) {
      errors.push(`Row ${i + 1}: Invalid value "${valueStr}". Must be a positive number`);
      continue;
    }

    data.push({ date: dateStr, value });
  }

  return {
    isValid: errors.length === 0,
    data,
    errors
  };
  }

export function generateCSV(investments: { date: string; value: number }[]): string {
  const header = 'Date,Value\n';
  const rows = investments.map(inv => 
    `${sanitizeCSVValue(inv.date)},${sanitizeCSVValue(inv.value.toString())}`
  ).join('\n');
  return header + rows;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}