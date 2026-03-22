const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db();
    const users = database.collection('users');
    const allUsers = await users.find({}).toArray();
    console.log('--- User List ---');
    allUsers.forEach(u => {
      console.log(`Email: "${u.email}", Role: ${u.role}, HasPass: ${!!u.password}`);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
