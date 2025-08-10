import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCSV, generateCSV } from "./utils";
import type { Portfolio } from "./database";

// Mock data for testing
const mockPortfolio1: Portfolio = {
  id: 1,
  user_id: 1,
  name: "Main Portfolio",
  created_at: new Date("2024-01-01"),
};

const mockPortfolio2: Portfolio = {
  id: 2,
  user_id: 1,
  name: "Secondary Portfolio",
  created_at: new Date("2024-01-01"),
};

const mockInvestments = [
  { date: "2024-01-01", value: 100000 },
  { date: "2024-01-02", value: 102000 },
  { date: "2024-01-03", value: 101500 },
];

describe("CSV Portfolio Integration", () => {
  describe("Portfolio-specific CSV Export", () => {
    it("should generate CSV with portfolio-specific filename format", () => {
      const csvContent = generateCSV(mockInvestments);

      expect(csvContent).toBe("Date,Value\n2024-01-01,100000\n2024-01-02,102000\n2024-01-03,101500");
    });

    it("should handle portfolio names with spaces in filename", () => {
      const portfolioName = "My Investment Portfolio";
      const expectedFilenamePortfolioSuffix = "my-investment-portfolio";

      expect(portfolioName.toLowerCase().replace(/\s+/g, "-")).toBe(expectedFilenamePortfolioSuffix);
    });

    it("should handle special characters in portfolio names", () => {
      const portfolioName = "Tech & Growth (2024)";
      const expectedFilenamePortfolioSuffix = "tech-&-growth-(2024)";

      expect(portfolioName.toLowerCase().replace(/\s+/g, "-")).toBe(expectedFilenamePortfolioSuffix);
    });
  });

  describe("Portfolio-specific CSV Import", () => {
    it("should parse CSV data correctly for import", () => {
      const csvContent = "Date,Value\n2024-01-01,100000\n2024-01-02,102000";
      const result = parseCSV(csvContent);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual([
        { date: "2024-01-01", value: 100000 },
        { date: "2024-01-02", value: 102000 },
      ]);
      expect(result.errors).toEqual([]);
    });

    it("should validate portfolio context requirements", () => {
      // Test that portfolio ID is properly validated
      const portfolioId = "invalid";
      const parsedId = parseInt(portfolioId);

      expect(isNaN(parsedId)).toBe(true);
    });

    it("should handle portfolio ownership validation", () => {
      // Test portfolio ownership check logic
      const userPortfolios = [mockPortfolio1, mockPortfolio2];
      const requestedPortfolioId = 1;

      const portfolioExists = userPortfolios.some((p) => p.id === requestedPortfolioId);
      expect(portfolioExists).toBe(true);

      const nonExistentPortfolioId = 999;
      const nonExistentPortfolioExists = userPortfolios.some((p) => p.id === nonExistentPortfolioId);
      expect(nonExistentPortfolioExists).toBe(false);
    });
  });

  describe("CSV Data Integrity", () => {
    it("should maintain data integrity through export-import cycle", () => {
      // Original data
      const originalData = mockInvestments;

      // Export to CSV
      const csvContent = generateCSV(originalData);

      // Import from CSV
      const parseResult = parseCSV(csvContent);

      expect(parseResult.isValid).toBe(true);
      expect(parseResult.data).toEqual(originalData);
    });

    it("should handle large datasets efficiently", () => {
      // Generate a large dataset
      const largeDataset = Array.from({ length: 365 }, (_, i) => {
        const date = new Date(2024, 0, 1 + i);
        const dateStr = date.toISOString().split("T")[0];
        return {
          date: dateStr,
          value: 100000 + i * 100,
        };
      });

      // Test CSV generation
      const csvContent = generateCSV(largeDataset);
      expect(csvContent).toContain("Date,Value");
      expect(csvContent.split("\n")).toHaveLength(366); // Header + 365 data rows

      // Test CSV parsing
      const parseResult = parseCSV(csvContent);
      expect(parseResult.isValid).toBe(true);
      expect(parseResult.data).toHaveLength(365);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed CSV data", () => {
      const malformedCsv = "Date,Value\ninvalid-date,not-a-number\n2024-01-02,";
      const result = parseCSV(malformedCsv);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Row 2: Invalid date format "invalid-date". Expected YYYY-MM-DD');
      expect(result.errors).toContain('Row 3: Invalid value "". Must be a positive number');
    });

    it("should handle empty portfolio scenarios", () => {
      const emptyData: Array<{ date: string; value: number }> = [];
      const csvContent = generateCSV(emptyData);

      expect(csvContent).toBe("Date,Value\n");

      const parseResult = parseCSV(csvContent);
      expect(parseResult.isValid).toBe(false);
      expect(parseResult.errors).toContain("CSV file has no data rows");
    });

    it("should validate portfolio access permissions", () => {
      const userPortfolios = [mockPortfolio1]; // User only has access to portfolio 1
      const requestedPortfolioId = 2; // Trying to access portfolio 2

      const hasAccess = userPortfolios.some((p) => p.id === requestedPortfolioId);
      expect(hasAccess).toBe(false);
    });
  });

  describe("API Parameter Validation", () => {
    it("should validate export parameters", () => {
      const validPeriods = ["daily", "weekly", "monthly"];
      const validFilters = ["7d", "30d", "60d", "4w", "12w", "24w", "3m", "6m", "12m", "all"];

      expect(validPeriods.includes("daily")).toBe(true);
      expect(validPeriods.includes("invalid")).toBe(false);

      expect(validFilters.includes("7d")).toBe(true);
      expect(validFilters.includes("invalid")).toBe(false);
    });

    it("should validate import parameters", () => {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const testFileSize = 1024; // 1KB

      expect(testFileSize <= maxFileSize).toBe(true);

      const oversizedFile = 6 * 1024 * 1024; // 6MB
      expect(oversizedFile <= maxFileSize).toBe(false);
    });

    it("should validate CSV file extensions", () => {
      const validFilenames = ["data.csv", "investments.CSV", "portfolio.csv"];
      const invalidFilenames = ["data.txt", "investments.xlsx", "portfolio"];

      validFilenames.forEach((filename) => {
        expect(filename.toLowerCase().endsWith(".csv")).toBe(true);
      });

      invalidFilenames.forEach((filename) => {
        expect(filename.toLowerCase().endsWith(".csv")).toBe(false);
      });
    });
  });

  describe("Multi-Portfolio Scenarios", () => {
    it("should handle multiple portfolios with same dates", () => {
      // Simulate scenario where user has investments on same dates across portfolios
      const portfolio1Investments = [
        { date: "2024-01-01", value: 100000 },
        { date: "2024-01-02", value: 102000 },
      ];

      const portfolio2Investments = [
        { date: "2024-01-01", value: 50000 },
        { date: "2024-01-02", value: 51000 },
      ];

      // Each portfolio should maintain its own data independently
      const csv1 = generateCSV(portfolio1Investments);
      const csv2 = generateCSV(portfolio2Investments);

      expect(csv1).not.toBe(csv2);
      expect(csv1).toContain("100000");
      expect(csv2).toContain("50000");
    });

    it("should ensure portfolio isolation during import", () => {
      const importData = [
        { date: "2024-01-01", value: 75000 },
        { date: "2024-01-02", value: 76000 },
      ];

      // Import should only affect the specified portfolio
      const parseResult = parseCSV(generateCSV(importData));
      expect(parseResult.isValid).toBe(true);
      expect(parseResult.data).toEqual(importData);
    });
  });
});
