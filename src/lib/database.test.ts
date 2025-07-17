import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test constants
const TEST_USER_ID = 1;

// Create mocks before importing the database module
const mockPreparedStatements = {
  insertInvestment: { run: vi.fn() },
  getInvestmentByDate: { get: vi.fn() },
  getAllInvestments: { all: vi.fn() },
  getInvestmentsInRange: { all: vi.fn() },
  deleteInvestment: { run: vi.fn() },
  getLatestInvestment: { get: vi.fn() },
  getInvestmentsPaginated: { all: vi.fn() },
  getInvestmentWithPrevious: { get: vi.fn() },
  deleteAllInvestments: { run: vi.fn() }
};

const mockDb = {
  prepare: vi.fn((query: string) => {
    if (query.includes('INSERT OR REPLACE INTO investments')) {
      // Both insertInvestment and bulkInsertInvestment use the same query
      return mockPreparedStatements.insertInvestment;
    }
    if (query.includes('SELECT * FROM investments WHERE user_id = ? AND date = ?')) {
      return mockPreparedStatements.getInvestmentByDate;
    }
    if (query.includes('SELECT * FROM investments WHERE user_id = ? ORDER BY date ASC')) {
      return mockPreparedStatements.getAllInvestments;
    }
    if (query.includes('WHERE user_id = ? AND date >= ? AND date <= ?')) {
      return mockPreparedStatements.getInvestmentsInRange;
    }
    if (query.includes('DELETE FROM investments WHERE user_id = ? AND date = ?')) {
      return mockPreparedStatements.deleteInvestment;
    }
    if (query.includes('WHERE user_id = ? ORDER BY date DESC LIMIT 1')) {
      return mockPreparedStatements.getLatestInvestment;
    }
    if (query.includes('WHERE user_id = ?') && query.includes('LIMIT ? OFFSET ?')) {
      return mockPreparedStatements.getInvestmentsPaginated;
    }
    if (query.includes('LEFT JOIN') && query.includes('WHERE curr.user_id = ?')) {
      return mockPreparedStatements.getInvestmentWithPrevious;
    }
    if (query.includes('DELETE FROM investments WHERE user_id = ?')) {
      return mockPreparedStatements.deleteAllInvestments;
    }
    return mockPreparedStatements.insertInvestment;
  }),
  exec: vi.fn(),
  pragma: vi.fn(),
  close: vi.fn(),
  transaction: vi.fn((fn: () => any) => () => fn())
};

// Mock better-sqlite3 before importing database
vi.mock('better-sqlite3', () => ({
  default: vi.fn(() => mockDb)
}));

// Now import the database module
const { investmentDb } = await import('./database');

describe('investmentDb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addInvestment', () => {
    it('should call the correct prepared statement with user ID, date and encrypted value', () => {
      investmentDb.addInvestment(TEST_USER_ID, '2024-01-01', 100000);
      
      // Check that the function was called with user ID, date, and an encrypted value (string)
      expect(mockPreparedStatements.insertInvestment.run).toHaveBeenCalledWith(
        TEST_USER_ID, 
        '2024-01-01', 
        expect.stringMatching(/^[a-f0-9]{32}:[a-f0-9]{32}:[a-f0-9]+$/) // Encrypted format: iv:authTag:encrypted
      );
    });
  });

  describe('getInvestment', () => {
    it('should return investment for valid date', () => {
      // Mock returns encrypted value from database, should be decrypted by the function
      const mockInvestmentFromDb = { id: 1, user_id: TEST_USER_ID, date: '2024-01-01', value: '100000' }; // Fallback to number parsing
      const expectedResult = { id: 1, user_id: TEST_USER_ID, date: '2024-01-01', value: 100000 };
      mockPreparedStatements.getInvestmentByDate.get.mockReturnValue(mockInvestmentFromDb);
      
      const result = investmentDb.getInvestment(TEST_USER_ID, '2024-01-01');
      
      expect(mockPreparedStatements.getInvestmentByDate.get).toHaveBeenCalledWith(TEST_USER_ID, '2024-01-01');
      expect(result).toEqual(expectedResult);
    });

    it('should return undefined for non-existent investment', () => {
      mockPreparedStatements.getInvestmentByDate.get.mockReturnValue(undefined);
      
      const result = investmentDb.getInvestment(TEST_USER_ID, '2024-12-31');
      
      expect(result).toBeUndefined();
    });
  });

  describe('getAllInvestments', () => {
    it('should return all investments', () => {
      const mockInvestmentsFromDb = [
        { id: 1, date: '2024-01-01', value: '100000' },
        { id: 2, date: '2024-01-02', value: '102000' }
      ];
      const expectedResult = [
        { id: 1, date: '2024-01-01', value: 100000 },
        { id: 2, date: '2024-01-02', value: 102000 }
      ];
      mockPreparedStatements.getAllInvestments.all.mockReturnValue(mockInvestmentsFromDb);
      
      const result = investmentDb.getAllInvestments(TEST_USER_ID);
      
      expect(mockPreparedStatements.getAllInvestments.all).toHaveBeenCalledWith(TEST_USER_ID);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array when no investments exist', () => {
      mockPreparedStatements.getAllInvestments.all.mockReturnValue([]);
      
      const result = investmentDb.getAllInvestments(TEST_USER_ID);
      
      expect(result).toEqual([]);
    });
  });

  describe('getInvestmentsInRange', () => {
    it('should return investments within date range', () => {
      const mockInvestments = [
        { id: 1, date: '2024-01-01', value: 100000 },
        { id: 2, date: '2024-01-02', value: 102000 }
      ];
      mockPreparedStatements.getInvestmentsInRange.all.mockReturnValue(mockInvestments);
      
      const result = investmentDb.getInvestmentsInRange(TEST_USER_ID, '2024-01-01', '2024-01-02');
      
      expect(mockPreparedStatements.getInvestmentsInRange.all)
        .toHaveBeenCalledWith(TEST_USER_ID, '2024-01-01', '2024-01-02');
      expect(result).toEqual(mockInvestments);
    });
  });

  describe('deleteInvestment', () => {
    it('should delete investment for given date', () => {
      investmentDb.deleteInvestment(TEST_USER_ID, '2024-01-01');
      
      expect(mockPreparedStatements.deleteInvestment.run).toHaveBeenCalledWith(TEST_USER_ID, '2024-01-01');
    });
  });

  describe('getLatestInvestment', () => {
    it('should return latest investment', () => {
      const mockInvestment = { id: 5, date: '2024-01-05', value: 105000 };
      mockPreparedStatements.getLatestInvestment.get.mockReturnValue(mockInvestment);
      
      const result = investmentDb.getLatestInvestment(TEST_USER_ID);
      
      expect(mockPreparedStatements.getLatestInvestment.get).toHaveBeenCalledWith(TEST_USER_ID);
      expect(result).toEqual(mockInvestment);
    });

    it('should return undefined when no investments exist', () => {
      mockPreparedStatements.getLatestInvestment.get.mockReturnValue(undefined);
      
      const result = investmentDb.getLatestInvestment(TEST_USER_ID);
      
      expect(result).toBeUndefined();
    });
  });

  describe('getInvestmentsPaginated', () => {
    it('should return paginated investments', () => {
      const mockInvestments = [
        { id: 3, date: '2024-01-03', value: 103000 },
        { id: 2, date: '2024-01-02', value: 102000 }
      ];
      mockPreparedStatements.getInvestmentsPaginated.all.mockReturnValue(mockInvestments);
      
      const result = investmentDb.getInvestmentsPaginated(TEST_USER_ID, 10, 0);
      
      expect(mockPreparedStatements.getInvestmentsPaginated.all)
        .toHaveBeenCalledWith(TEST_USER_ID, 10, 0);
      expect(result).toEqual(mockInvestments);
    });
  });

  describe('getInvestmentWithPrevious', () => {
    it('should return investment with previous value', () => {
      const mockData = {
        id: 2,
        date: '2024-01-02',
        value: 102000,
        prev_value: 100000
      };
      mockPreparedStatements.getInvestmentWithPrevious.get.mockReturnValue(mockData);
      
      const result = investmentDb.getInvestmentWithPrevious(TEST_USER_ID, '2024-01-02');
      
      expect(mockPreparedStatements.getInvestmentWithPrevious.get)
        .toHaveBeenCalledWith(TEST_USER_ID, '2024-01-02');
      expect(result).toEqual(mockData);
    });
  });

  describe('clearAllInvestments', () => {
    it('should clear all investments', () => {
      investmentDb.clearAllInvestments(TEST_USER_ID);
      
      expect(mockPreparedStatements.deleteAllInvestments.run).toHaveBeenCalledWith(TEST_USER_ID);
    });
  });

  describe('bulkInsertInvestments', () => {
    it('should bulk insert investments and return count', () => {
      const investments = [
        { date: '2024-01-01', value: 100000 },
        { date: '2024-01-02', value: 102000 },
        { date: '2024-01-03', value: 98000 }
      ];

      const result = investmentDb.bulkInsertInvestments(TEST_USER_ID, investments);
      
      expect(mockDb.transaction).toHaveBeenCalled();
      expect(result).toBe(3);
      expect(mockPreparedStatements.insertInvestment.run).toHaveBeenCalledTimes(3);
      // Check that values were encrypted before insertion
      expect(mockPreparedStatements.insertInvestment.run).toHaveBeenCalledWith(
        TEST_USER_ID, 
        '2024-01-01', 
        expect.stringMatching(/^[a-f0-9]{32}:[a-f0-9]{32}:[a-f0-9]+$/)
      );
      expect(mockPreparedStatements.insertInvestment.run).toHaveBeenCalledWith(
        TEST_USER_ID, 
        '2024-01-02', 
        expect.stringMatching(/^[a-f0-9]{32}:[a-f0-9]{32}:[a-f0-9]+$/)
      );
      expect(mockPreparedStatements.insertInvestment.run).toHaveBeenCalledWith(
        TEST_USER_ID, 
        '2024-01-03', 
        expect.stringMatching(/^[a-f0-9]{32}:[a-f0-9]{32}:[a-f0-9]+$/)
      );
    });

    it('should handle empty array', () => {
      const result = investmentDb.bulkInsertInvestments(TEST_USER_ID, []);
      
      expect(result).toBe(0);
      expect(mockPreparedStatements.insertInvestment.run).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close database connection', () => {
      investmentDb.close();
      
      expect(mockDb.close).toHaveBeenCalled();
    });
  });
}); 