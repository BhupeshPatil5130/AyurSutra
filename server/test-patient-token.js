import jwt from 'jsonwebtoken';

const userId = '507f1f77bcf86cd799439013'; // Patient user ID
const secret = 'fallback_secret'; // Using fallback secret
const expiresIn = '1d';

const token = jwt.sign({ userId }, secret, { expiresIn });

console.log('Patient JWT Token for testing:');
console.log(token);
console.log('\nUse this token in your API requests:');
console.log(`Authorization: Bearer ${token}`);

// Test decoding
try {
  const decoded = jwt.verify(token, secret);
  console.log('\nToken decoded successfully:');
  console.log(decoded);
} catch (error) {
  console.log('\nError decoding token:', error.message);
}
