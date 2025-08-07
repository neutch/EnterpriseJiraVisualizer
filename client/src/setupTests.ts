import '@testing-library/jest-dom'

// Mock environment variables
process.env.NODE_ENV = 'test'

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock D3 and DOM elements for visualization tests
Object.defineProperty(window, 'SVGElement', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({})),
})

// Mock console methods in test environment
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}