const crypto = require('crypto');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/generate-admin-hash.js <password>');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('\nAdd this to your .env.local file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}`);
console.log('\nPassword hash generated successfully!');