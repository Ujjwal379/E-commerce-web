const mongoose = require('mongoose');

// Cache the connection state across serverless function invocations
let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse the existing database connection
  if (isConnected) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from environment variables.');
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // DO NOT use process.exit(1) in a serverless environment!
    throw error;
  }
};

module.exports = connectDB;