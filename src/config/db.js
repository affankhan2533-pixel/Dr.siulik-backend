const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[Database] MONGODB_URI is not configured. Server running in standalone API mode without persistent DB.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    console.warn('[Database] Continuing in standalone API mode...');
  }
};

module.exports = connectDB;
