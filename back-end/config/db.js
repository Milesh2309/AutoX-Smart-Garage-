const { MongoClient, ServerApiVersion } = require('mongodb');

let db;
let client;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it in back-end/.env');
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();
  db = client.db("AutoX");
  console.log("MongoDB Connected");
};

const getDB = () => db;

module.exports = { connectDB, getDB };