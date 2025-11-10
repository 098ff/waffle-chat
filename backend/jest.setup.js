const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Mock Cloudinary for tests to avoid actual uploads
jest.mock('./config/cloudinary', () => ({
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: 'https://test-cloudinary.com/test-image.jpg',
      public_id: 'test-public-id',
    }),
  },
  config: jest.fn(),
}));

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
