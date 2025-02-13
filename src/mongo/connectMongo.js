// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.AWS_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('calculation_logs');
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

module.exports = { connectDB, getDb: () => db };
