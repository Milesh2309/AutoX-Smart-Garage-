const { MongoClient, ServerApiVersion } = require('mongodb');

let db;
let client;

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  console.log('MongoDB connect starting:');
  console.log('  MONGODB_URI present:', Boolean(uri));
  console.log('  MONGODB_TLS:', process.env.MONGODB_TLS);
  console.log('  MONGODB_TLS_ALLOW_INVALID_CERTS:', process.env.MONGODB_TLS_ALLOW_INVALID_CERTS);

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it in back-end/.env or Render environment variables');
  }

  const isSrvConnection = String(uri).toLowerCase().startsWith('mongodb+srv://');
  const useTls = toBool(process.env.MONGODB_TLS, isSrvConnection);
  const allowInvalidTlsCerts = toBool(process.env.MONGODB_TLS_ALLOW_INVALID_CERTS, false);

  const clientOptions = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10000,
  };

  if (useTls) {
    clientOptions.tls = true;
    clientOptions.tlsAllowInvalidCertificates = allowInvalidTlsCerts;
  }

  client = new MongoClient(uri, clientOptions);

  await client.connect();
  db = client.db("AutoX");
  console.log("MongoDB Connected");
};

const getDB = () => db;

module.exports = { connectDB, getDB };