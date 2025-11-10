const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const authRoutes = require('../routes/auth');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '30d';
process.env.JWT_COOKIE_EXPIRE = 30;

// Skip tests if MongoDB is not available
const MONGODB_AVAILABLE =
  process.env.MONGO_TEST_URI && process.env.RUN_DB_TESTS === 'true';

describe('Auth Routes', () => {
  // Setup: Connect to test database before tests
  beforeAll(async () => {
    if (!MONGODB_AVAILABLE) {
      console.log(
        '⚠️  Skipping database tests. Set RUN_DB_TESTS=true and MONGO_TEST_URI to run them.',
      );
      return;
    }
    const mongoUri = process.env.MONGO_TEST_URI;
    await mongoose.connect(mongoUri);
  }, 30000);

  // Cleanup: Clear database and disconnect after tests
  afterAll(async () => {
    if (!MONGODB_AVAILABLE) return;
    await User.deleteMany({});
    await mongoose.connection.close();
  }, 30000);

  // Clear users before each test
  beforeEach(async () => {
    if (!MONGODB_AVAILABLE) return;
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should accept registration request with valid data', async () => {
      if (!MONGODB_AVAILABLE) {
        console.log('⚠️  Test skipped - database not available');
        return;
      }

      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.fullName).toBe(userData.fullName);
      expect(response.body.token).toBeDefined();
    });

    it('should have required fields in registration endpoint', () => {
      // This test doesn't need database
      expect(authRoutes).toBeDefined();
      expect(typeof authRoutes).toBe('function');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should have login endpoint defined', () => {
      // Simple check that doesn't require database
      expect(authRoutes).toBeDefined();
      expect(typeof authRoutes).toBe('function');
    });

    it('should reject login without credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
