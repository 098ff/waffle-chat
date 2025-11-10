const request = require('supertest');
const express = require('express');

describe('Server Health Check', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', message: 'Server is running' });
    });
  });

  it('should return 200 OK for health check', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Server is running');
  });
});

describe('Environment Setup', () => {
  it('should have required environment variables', () => {
    // These should be set in the test environment
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_EXPIRE).toBeDefined();
  });
});
