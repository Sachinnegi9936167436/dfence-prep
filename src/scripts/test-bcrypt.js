const bcrypt = require('bcryptjs');

async function test() {
  const password = "9936167436";
  // This is the hash from a typical bcryptjs.hash("9936167436", 10)
  // I'll grab the actual hash from the DB in a moment if this doesn't help.
  
  // Wait, I'll just write a script that connects to the DB and performs the comparison LOCALLY.
  const { MongoClient } = require('mongodb');
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    const user = await users.findOne({ email: 'negisakshi032@gmail.com' });
    
    if (!user) {
      console.log('User not found in DB');
      return;
    }
    
    console.log('User found. Has password:', !!user.password);
    const match = await bcrypt.compare(password, user.password);
    console.log('Bcrypt comparison result:', match);
    
    // Test if re-hashing creates a valid match
    const newHash = await bcrypt.hash(password, 10);
    const secondMatch = await bcrypt.compare(password, newHash);
    console.log('Self-hash comparison result:', secondMatch);
    
  } finally {
    await client.close();
  }
}

test().catch(console.dir);
