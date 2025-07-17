import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock better-sqlite3 for database tests
vi.mock('better-sqlite3', () => {
  const mockDb = {
    prepare: vi.fn(() => ({
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn()
    })),
    exec: vi.fn(),
    pragma: vi.fn(),
    close: vi.fn(),
    transaction: vi.fn((fn) => fn)
  };
  
  return {
    default: vi.fn(() => mockDb)
  };
});

// Mock SvelteKit environment
vi.mock('$app/environment', () => ({
  dev: true
}));

// Mock file downloads for CSV tests
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:test-url'),
    revokeObjectURL: vi.fn()
  }
});

// Mock document for CSV download tests
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    setAttribute: vi.fn(),
    click: vi.fn(),
    style: {}
  }))
});

Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
}); 