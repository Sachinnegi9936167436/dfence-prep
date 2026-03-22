const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please define the MONGODB_URI environment variable in .env');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node src/scripts/make-admin.js <email>');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db();
    const users = database.collection('users');

    const result = await users.updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`Successfully promoted ${email} to admin!`);
    }
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
