# Backend Testing Guide

## Overview

This directory contains automated tests for the Waffle Chat backend API.

## Test Framework

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for testing Express routes

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode (for development)

```bash
npm run test:watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

## Test Structure

```
backend/
├── __tests__/
│   ├── setup.js           # Test setup and mocks
│   ├── server.test.js     # Server health checks
│   └── auth.test.js       # Authentication route tests
├── jest.config.js         # Jest configuration
└── .env.test             # Test environment variables
```

## Writing Tests

### Example test structure:

```javascript
describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup before all tests in this describe block
  });

  afterAll(async () => {
    // Cleanup after all tests
  });

  beforeEach(async () => {
    // Setup before each test
  });

  it('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## Environment Variables

Tests use `.env.test` file with mock values. Never use production credentials in tests.

## CI/CD Integration

Tests run automatically on:

- Push to any branch
- Pull requests
- GitHub Actions workflow: `.github/workflows/ci-back.yml`

## Coverage Reports

After running `npm run test:coverage`, view the coverage report:

- Console output
- HTML report: `coverage/lcov-report/index.html`

## Best Practices

1. **Isolate tests**: Each test should be independent
2. **Clean up**: Always clean database after tests
3. **Mock external services**: Don't make real API calls (Cloudinary, etc.)
4. **Use descriptive names**: Test names should explain what they test
5. **Test edge cases**: Not just happy paths
