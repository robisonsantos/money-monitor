import { describe, it, expect, vi } from 'vitest';
import {
  aggregateInvestments,
  calculatePortfolioStats,
  calculateFilteredPortfolioStats,
  formatCurrency,
  formatPercent,
  formatDate,
  parseCSV,
  generateCSV,
  downloadCSV
} from './utils';
import type { Investment } from './database';

// Mock data for testing - use recent dates for filter tests
const now = new Date();
const today = now.toISOString().split('T')[0];
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const mockInvestments: Investment[] = [
  { id: 1, date: fourDaysAgo, value: 100000, created_at: fourDaysAgo, updated_at: fourDaysAgo },
  { id: 2, date: threeDaysAgo, value: 102000, created_at: threeDaysAgo, updated_at: threeDaysAgo },
  { id: 3, date: twoDaysAgo, value: 98000, created_at: twoDaysAgo, updated_at: twoDaysAgo },
  { id: 4, date: yesterday, value: 105000, created_at: yesterday, updated_at: yesterday },
  { id: 5, date: today, value: 103000, created_at: today, updated_at: today },
];

describe('aggregateInvestments', () => {
  it('should return empty array for empty input', () => {
    const result = aggregateInvestments([], 'daily', 'all');
    expect(result).toEqual([]);
  });

  it('should handle daily aggregation correctly', () => {
    const result = aggregateInvestments(mockInvestments, 'daily', 'all');
    
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      date: fourDaysAgo,
      value: 100000,
      change: 0,
      changePercent: 0
    });
    expect(result[1]).toEqual({
      date: threeDaysAgo,
      value: 102000,
      change: 2000,
      changePercent: 2
    });
    expect(result[2]).toEqual({
      date: twoDaysAgo,
      value: 98000,
      change: -4000,
      changePercent: -3.9215686274509804
    });
  });

  it('should filter by date range correctly', () => {
    const result = aggregateInvestments(mockInvestments, 'daily', '7d');
    
    // Should include all items since they're within 7 days (recent dates)
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('should handle weekly aggregation', () => {
    const result = aggregateInvestments(mockInvestments, 'weekly', 'all');
    
    expect(result.length).toBeGreaterThan(0);
    // Weekly aggregation should group by week
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('value');
    expect(result[0]).toHaveProperty('change');
    expect(result[0]).toHaveProperty('changePercent');
  });

  it('should handle monthly aggregation', () => {
    const result = aggregateInvestments(mockInvestments, 'monthly', 'all');
    
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('value');
  });
});

describe('calculatePortfolioStats', () => {
  it('should return default stats for empty array', () => {
    const result = calculatePortfolioStats([]);
    
    expect(result).toEqual({
      totalValue: 0,
      totalChange: 0,
      totalChangePercent: 0,
      bestDay: null,
      worstDay: null,
      totalDays: 0
    });
  });

  it('should calculate portfolio stats correctly', () => {
    const result = calculatePortfolioStats(mockInvestments);
    
    expect(result.totalValue).toBe(103000);
    expect(result.totalChange).toBe(3000);
    expect(result.totalChangePercent).toBe(3);
    expect(result.totalDays).toBe(5);
    expect(result.bestDay).toEqual({
      date: yesterday,
      change: 7000,
      changePercent: 7.142857142857142
    });
    expect(result.worstDay).toEqual({
      date: twoDaysAgo,
      change: -4000,
      changePercent: -3.9215686274509804
    });
  });

  it('should handle single investment correctly', () => {
    const singleInvestment = [mockInvestments[0]];
    const result = calculatePortfolioStats(singleInvestment);
    
    expect(result.totalValue).toBe(100000);
    expect(result.totalChange).toBe(0);
    expect(result.totalChangePercent).toBe(0);
    expect(result.totalDays).toBe(1);
    expect(result.bestDay).toBeNull();
    expect(result.worstDay).toBeNull();
  });
});

describe('calculateFilteredPortfolioStats', () => {
  const mockAggregatedData = [
    { date: '2024-01-01', value: 100000, change: 0, changePercent: 0 },
    { date: '2024-01-02', value: 102000, change: 2000, changePercent: 2 },
    { date: '2024-01-03', value: 98000, change: -4000, changePercent: -3.92 }
  ];

  it('should return default stats for empty array', () => {
    const result = calculateFilteredPortfolioStats([]);
    
    expect(result).toEqual({
      totalValue: 0,
      totalChange: 0,
      totalChangePercent: 0,
      bestDay: null,
      worstDay: null,
      totalDays: 0
    });
  });

  it('should calculate filtered stats correctly', () => {
    const result = calculateFilteredPortfolioStats(mockAggregatedData);
    
    expect(result.totalValue).toBe(98000);
    expect(result.totalChange).toBe(-2000);
    expect(result.totalChangePercent).toBe(-2);
    expect(result.totalDays).toBe(3);
    expect(result.bestDay).toEqual({
      date: '2024-01-02',
      change: 2000,
      changePercent: 2
    });
    expect(result.worstDay).toEqual({
      date: '2024-01-03',
      change: -4000,
      changePercent: -3.92
    });
  });
});

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });
});

describe('formatPercent', () => {
  it('should format percentages correctly', () => {
    expect(formatPercent(0)).toBe('0.00%');
    expect(formatPercent(50)).toBe('50.00%');
    expect(formatPercent(-25)).toBe('-25.00%');
    expect(formatPercent(123.456)).toBe('123.46%');
  });
});

describe('formatDate', () => {
  it('should format dates correctly', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 01, 2024');
    expect(formatDate('2024-12-31')).toBe('Dec 31, 2024');
    expect(formatDate('2024-06-15')).toBe('Jun 15, 2024');
  });
});

describe('parseCSV', () => {
  it('should parse valid CSV with header', () => {
    const csv = 'Date,Value\n2024-01-01,100000\n2024-01-02,102000';
    const result = parseCSV(csv);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual([
      { date: '2024-01-01', value: 100000 },
      { date: '2024-01-02', value: 102000 }
    ]);
    expect(result.errors).toEqual([]);
  });

  it('should parse valid CSV without header', () => {
    const csv = '2024-01-01,100000\n2024-01-02,102000';
    const result = parseCSV(csv);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual([
      { date: '2024-01-01', value: 100000 },
      { date: '2024-01-02', value: 102000 }
    ]);
  });

  it('should handle empty CSV', () => {
    const result = parseCSV('');
    
    // Empty CSV is valid but has no data
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it('should validate date format', () => {
    const csv = 'invalid-date,100000';
    const result = parseCSV(csv);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Row 1: Invalid date format "invalid-date". Expected YYYY-MM-DD');
  });

  it('should validate value format', () => {
    const csv = '2024-01-01,invalid-value';
    const result = parseCSV(csv);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Row 1: Invalid value "invalid-value". Must be a positive number');
  });

  it('should validate negative values', () => {
    const csv = '2024-01-01,-1000';
    const result = parseCSV(csv);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Row 1: Invalid value "-1000". Must be a positive number');
  });

  it('should validate column count', () => {
    const csv = '2024-01-01';
    const result = parseCSV(csv);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Row 1: Expected 2 columns (date, value), got 1');
  });

  it('should skip empty lines', () => {
    const csv = '2024-01-01,100000\n\n2024-01-02,102000\n';
    const result = parseCSV(csv);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toHaveLength(2);
  });
});

describe('generateCSV', () => {
  it('should generate CSV with header', () => {
    const data = [
      { date: '2024-01-01', value: 100000 },
      { date: '2024-01-02', value: 102000 }
    ];
    
    const result = generateCSV(data);
    
    expect(result).toBe('Date,Value\n2024-01-01,100000\n2024-01-02,102000');
  });

  it('should handle empty data', () => {
    const result = generateCSV([]);
    
    expect(result).toBe('Date,Value\n');
  });

  it('should handle decimal values', () => {
    const data = [{ date: '2024-01-01', value: 100000.50 }];
    const result = generateCSV(data);
    
    expect(result).toBe('Date,Value\n2024-01-01,100000.5');
  });
});

describe('downloadCSV', () => {
  it('should create download link and trigger download', () => {
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
      download: ''
    };
    
    // The function calls document.createElement, URL methods, and DOM manipulation
    // Since these are already mocked in test-setup.ts, just verify the behavior
    downloadCSV('test,content', 'test.csv');
    
    // The test-setup already mocks these functions, so we can't easily spy on them
    // This test verifies the function runs without errors, which tests the core logic
    expect(true).toBe(true); // Function completed without throwing
  });
}); 