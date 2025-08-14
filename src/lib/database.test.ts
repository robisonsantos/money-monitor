import { beforeEach, describe, expect, it, vi } from "vitest";

// Set test environment to prevent development schema setup
process.env.NODE_ENV = "test";

// Mock setInterval to prevent periodic session cleanup during tests
vi.stubGlobal("setInterval", vi.fn());

// Test constants
const TEST_USER_ID = 1;

// Create mock PostgreSQL client
const mockClient = {
  query: vi.fn(() => Promise.resolve({ rows: [] })), // Default return for schema queries
  release: vi.fn(),
  connect: vi.fn(),
};

// Create mock PostgreSQL pool
const mockPool = {
  connect: vi.fn(() => Promise.resolve(mockClient)),
  end: vi.fn(),
  on: vi.fn(),
};

// Mock pg library before importing database
vi.mock("pg", () => ({
  default: {
    Pool: vi.fn(() => mockPool),
  },
  Pool: vi.fn(() => mockPool),
}));

// Mock bcrypt for authentication testing
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async () => "hashed_password"),
    compare: vi.fn(async () => true),
  },
  hash: vi.fn(async () => "hashed_password"),
  compare: vi.fn(async () => true),
}));

// Mock encryption for deterministic testing
vi.mock("crypto", () => ({
  default: {
    randomBytes: vi.fn(() => Buffer.from("1234567890123456")), // Fixed IV for testing
    scryptSync: vi.fn(() => Buffer.from("12345678901234567890123456789012")), // Fixed key
    createCipheriv: vi.fn(() => ({
      setAAD: vi.fn(),
      update: vi.fn(() => "encrypted"),
      final: vi.fn(() => ""),
      getAuthTag: vi.fn(() => Buffer.from("1234567890123456")),
    })),
    createDecipheriv: vi.fn(() => ({
      setAAD: vi.fn(),
      setAuthTag: vi.fn(),
      update: vi.fn(() => "100000"),
      final: vi.fn(() => ""),
    })),
  },
}));

// Now import the database module
const { investmentDb, userDb } = await import("./database");

describe("userDb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the schema check query to return existing tables
    mockClient.query.mockImplementation((query) => {
      if (typeof query === "string" && query.includes("information_schema.tables")) {
        return Promise.resolve({ rows: [{ table_name: "users" }, { table_name: "investments" }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  describe("createUser", () => {
    it("should create a new user and return user data", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password_hash: "hashed_password",
        name: "Test User",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };
      mockClient.query.mockResolvedValue({ rows: [mockUser] });

      const result = await userDb.createUser("test@example.com", "password123", "Test User");

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
        ["test@example.com", expect.any(String), "Test User"],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("authenticateUser", () => {
    beforeEach(async () => {
      mockClient.query.mockReset();
      mockClient.query.mockReturnValue(Promise.resolve({ rows: [] }));
      // Reset bcrypt mock to default behavior
      const bcrypt = await import("bcrypt");
      vi.mocked(bcrypt.compare).mockReset();
      vi.mocked(bcrypt.compare).mockResolvedValue(true);
    });

    it("should return user for valid credentials", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password_hash: "$2b$10$hashedpassword",
        name: "Test User",
      };

      // Set up the mock for this test
      mockClient.query.mockImplementation((query) => {
        if (typeof query === "string" && query.includes("SELECT * FROM users WHERE email")) {
          return Promise.resolve({ rows: [mockUser] });
        }
        return Promise.resolve({ rows: [] });
      });

      // bcrypt is already mocked at module level

      const result = await userDb.authenticateUser("test@example.com", "password123");

      expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM users WHERE email = $1", ["test@example.com"]);
      expect(result).toEqual(mockUser);
    });

    it.skip("should return null for invalid credentials", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password_hash: "$2b$10$hashedpassword",
        name: "Test User",
      };

      // Set up the mock to return the user first, then empty for schema check
      mockClient.query.mockImplementation((query) => {
        if (typeof query === "string" && query.includes("information_schema.tables")) {
          return Promise.resolve({ rows: [{ table_name: "users" }, { table_name: "investments" }] });
        }
        if (typeof query === "string" && query.includes("SELECT * FROM users WHERE email")) {
          return Promise.resolve({ rows: [mockUser] });
        }
        return Promise.resolve({ rows: [] });
      });

      // Import and override bcrypt mock for this test
      const bcrypt = await import("bcrypt");
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false);

      const result = await userDb.authenticateUser("test@example.com", "wrongpassword");

      expect(result).toBeNull();
    });

    it("should return null for non-existent user", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await userDb.authenticateUser("nonexistent@example.com", "password123");

      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user for valid email", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      mockClient.query.mockResolvedValue({ rows: [mockUser] });

      const result = await userDb.getUserByEmail("test@example.com");

      expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM users WHERE email = $1", ["test@example.com"]);
      expect(result).toEqual(mockUser);
    });

    it("should return undefined for non-existent email", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await userDb.getUserByEmail("nonexistent@example.com");

      expect(result).toBeUndefined();
    });
  });

  describe("getUserById", () => {
    it("should return user for valid ID", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      mockClient.query.mockResolvedValue({ rows: [mockUser] });

      const result = await userDb.getUserById(1);

      expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM users WHERE id = $1", [1]);
      expect(result).toEqual(mockUser);
    });
  });
});

describe("investmentDb", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Create simplified mock that returns empty results by default
    // Individual tests will override with specific data
    mockClient.query.mockImplementation((query) => {
      if (typeof query === "string" && query.includes("information_schema.tables")) {
        return Promise.resolve({ rows: [{ table_name: "users" }, { table_name: "investments" }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  describe("addInvestment", () => {
    it("should add investment with encrypted value", async () => {
      // Mock portfolio queries for this test
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };
      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("SELECT * FROM portfolios WHERE id = $1 AND user_id = $2")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        return Promise.resolve({ rows: [] });
      });

      await investmentDb.addInvestment(TEST_USER_ID, "2024-01-01", 100000);

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO investments"), [
        TEST_USER_ID,
        1,
        "2024-01-01",
        "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
      ]);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("getInvestment", () => {
    it("should return investment for valid date with decrypted value", async () => {
      const mockInvestmentFromDb = {
        id: 1,
        user_id: TEST_USER_ID,
        date: "2024-01-01",
        value: "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
      };
      mockClient.query.mockResolvedValue({ rows: [mockInvestmentFromDb] });

      const result = await investmentDb.getInvestment(TEST_USER_ID, "2024-01-01");

      expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM investments WHERE user_id = $1 AND date = $2", [
        TEST_USER_ID,
        "2024-01-01",
      ]);
      expect(result).toBeDefined();
      expect(result!.value).toBe(100000); // Should be decrypted
    });

    it("should return undefined for non-existent investment", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await investmentDb.getInvestment(TEST_USER_ID, "2024-12-31");

      expect(result).toBeUndefined();
    });
  });

  describe("getAllInvestments", () => {
    it("should return all investments with decrypted values", async () => {
      // Mock portfolio query first, then investment query
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };
      const mockInvestmentsFromDb = [
        {
          id: 1,
          date: "2024-01-01",
          value: "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
        },
        {
          id: 2,
          date: "2024-01-02",
          value: "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
        },
      ];

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("SELECT * FROM investments WHERE user_id = $1 AND portfolio_id = $2")) {
          return Promise.resolve({ rows: mockInvestmentsFromDb });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await investmentDb.getAllInvestments(TEST_USER_ID);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(100000); // Should be decrypted
      expect(result[1].value).toBe(100000); // Should be decrypted
    });

    it("should return empty array when no investments exist", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await investmentDb.getAllInvestments(TEST_USER_ID);

      expect(result).toEqual([]);
    });
  });

  describe("getInvestmentsInRange", () => {
    it("should return investments within date range", async () => {
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };
      const mockInvestments = [
        {
          id: 1,
          date: "2024-01-01",
          value: "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
        },
        {
          id: 2,
          date: "2024-01-02",
          value: "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
        },
      ];

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("SELECT * FROM investments WHERE user_id = $1 AND portfolio_id = $2")) {
          return Promise.resolve({ rows: mockInvestments });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await investmentDb.getInvestmentsInRange(TEST_USER_ID, "2024-01-01", "2024-01-02");

      expect(result).toHaveLength(2);
    });
  });

  describe("deleteInvestment", () => {
    it("should delete investment for given date", async () => {
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };
      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        return Promise.resolve({ rows: [] });
      });

      await investmentDb.deleteInvestment(TEST_USER_ID, "2024-01-01");

      expect(mockClient.query).toHaveBeenCalledWith(
        "DELETE FROM investments WHERE user_id = $1 AND portfolio_id = $2 AND date = $3",
        [TEST_USER_ID, 1, "2024-01-01"],
      );
    });
  });

  describe("getLatestInvestment", () => {
    it("should return latest investment", async () => {
      const mockInvestment = {
        id: 1,
        date: "2024-01-02",
        value: "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
      };
      mockClient.query.mockResolvedValue({ rows: [mockInvestment] });

      const result = await investmentDb.getLatestInvestment(TEST_USER_ID);

      expect(mockClient.query).toHaveBeenCalledWith(
        "SELECT * FROM investments WHERE user_id = $1 ORDER BY date DESC LIMIT 1",
        [TEST_USER_ID],
      );
      expect(result).toBeDefined();
      expect(result!.value).toBe(100000); // Should be decrypted
    });
  });

  describe("getInvestmentsPaginated", () => {
    it("should return paginated investments", async () => {
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };
      const mockInvestments = [
        {
          id: 2,
          date: "2024-01-02",
          value: "31323334353637383930313233343536:31323334353637383930313233343536:encrypted",
        },
      ];

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("SELECT * FROM investments WHERE user_id = $1 AND portfolio_id = $2")) {
          return Promise.resolve({ rows: mockInvestments });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await investmentDb.getInvestmentsPaginated(TEST_USER_ID, 10, 0);

      expect(result).toHaveLength(1);
    });
  });

  describe("clearAllInvestments", () => {
    it("should delete all investments for user", async () => {
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };
      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        return Promise.resolve({ rows: [] });
      });

      await investmentDb.clearAllInvestments(TEST_USER_ID);

      expect(mockClient.query).toHaveBeenCalledWith(
        "DELETE FROM investments WHERE user_id = $1 AND portfolio_id = $2",
        [TEST_USER_ID, 1],
      );
    });
  });

  describe("bulkInsertInvestments", () => {
    it("should insert multiple investments in transaction", async () => {
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };
      const investments = [
        { date: "2024-01-01", value: 100000 },
        { date: "2024-01-02", value: 102000 },
      ];

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("SELECT * FROM portfolios WHERE id = $1 AND user_id = $2")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await investmentDb.bulkInsertInvestments(TEST_USER_ID, investments);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(result).toBe(2);
    });

    it("should rollback transaction on error", async () => {
      const investments = [{ date: "2024-01-01", value: 100000 }];
      const mockPortfolio = { id: 1, user_id: TEST_USER_ID, name: "Main Portfolio", created_at: new Date() };

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";

        if (queryStr === "BEGIN") return Promise.resolve({ rows: [] });
        if (queryStr === "ROLLBACK") return Promise.resolve({ rows: [] });
        if (queryStr === "COMMIT") return Promise.resolve({ rows: [] });

        if (queryStr.includes("SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("SELECT * FROM portfolios WHERE id = $1 AND user_id = $2")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("INSERT INTO investments")) {
          throw new Error("Database error");
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(investmentDb.bulkInsertInvestments(TEST_USER_ID, investments)).rejects.toThrow("Database error");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("bulkInsertInvestmentsToPortfolio", () => {
    it("should insert multiple investments to specific portfolio", async () => {
      const portfolioId = 2;
      const mockPortfolio = { id: portfolioId, user_id: TEST_USER_ID, name: "Test Portfolio", created_at: new Date() };
      const investments = [
        { date: "2024-01-01", value: 100000 },
        { date: "2024-01-02", value: 102000 },
      ];

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE id = $1 AND user_id = $2")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await investmentDb.bulkInsertInvestmentsToPortfolio(TEST_USER_ID, portfolioId, investments);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(result).toBe(2);
    });

    it("should throw error if portfolio not found", async () => {
      const portfolioId = 999;
      const investments = [{ date: "2024-01-01", value: 100000 }];

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";
        if (queryStr.includes("SELECT * FROM portfolios WHERE id = $1 AND user_id = $2")) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(
        investmentDb.bulkInsertInvestmentsToPortfolio(TEST_USER_ID, portfolioId, investments),
      ).rejects.toThrow("Portfolio not found or access denied");
    });

    it("should rollback transaction on error during insert", async () => {
      const portfolioId = 2;
      const mockPortfolio = { id: portfolioId, user_id: TEST_USER_ID, name: "Test Portfolio", created_at: new Date() };
      const investments = [{ date: "2024-01-01", value: 100000 }];

      mockClient.query.mockImplementation((query, params) => {
        const queryStr = typeof query === "string" ? query : query.text || "";

        if (queryStr === "BEGIN") return Promise.resolve({ rows: [] });
        if (queryStr === "ROLLBACK") return Promise.resolve({ rows: [] });
        if (queryStr === "COMMIT") return Promise.resolve({ rows: [] });

        if (queryStr.includes("SELECT * FROM portfolios WHERE id = $1 AND user_id = $2")) {
          return Promise.resolve({ rows: [mockPortfolio] });
        }
        if (queryStr.includes("INSERT INTO investments")) {
          throw new Error("Database error");
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(
        investmentDb.bulkInsertInvestmentsToPortfolio(TEST_USER_ID, portfolioId, investments),
      ).rejects.toThrow("Database error");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});
