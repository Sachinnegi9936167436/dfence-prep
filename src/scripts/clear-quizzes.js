const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI;
async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const quizzes = db.collection('quizzes');
    const result = await quizzes.deleteMany({});
    
    // Also reset the articles so they can be re-processed
    const articles = db.collection('articles');
    await articles.updateMany({}, { $set: { aiProcessed: false } });
    
    console.log(`Successfully deleted ${result.deletedCount} old quizzes and reset article status.`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
