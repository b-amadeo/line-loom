require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_CONN_STRING;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connect() {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    await client.close();
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connect first.');
  }
  return db;
}

module.exports = { connect, getDB };
