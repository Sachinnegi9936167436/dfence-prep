const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please define the MONGODB_URI environment variable in .env');
  process.exit(1);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node src/scripts/reset-password.js <email> <new_password>');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db();
    const users = database.collection('users');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await users.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`Successfully reset password for ${email}! You can now login with your new password.`);
    }
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
