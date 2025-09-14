import jwt from 'jsonwebtoken';

// Create a mock user ID
const mockUserId = 'mock-user-123';

// Generate a JWT token
const token = jwt.sign(
  { userId: mockUserId },
  process.env.JWT_SECRET || 'fallback_secret',
  { expiresIn: '24h' }
);

console.log('Mock JWT Token for testing:');
console.log(token);
console.log('\nUse this token in your API requests:');
console.log(`Authorization: Bearer ${token}`);
