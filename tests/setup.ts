/**
 * Test setup file
 * Runs before all tests
 */

// Setup global test utilities if needed
import 'reflect-metadata'; // Required for tsyringe dependency injection

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
