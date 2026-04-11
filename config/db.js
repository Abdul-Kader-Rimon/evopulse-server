const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;

  if (!mongoUri) {
    throw new Error("MONGO_URI missing in environment variables");
  }

  if (isConnected) return;

  try {
    const connectOptions = dbName ? { dbName } : {};
    const conn = await mongoose.connect(mongoUri, connectOptions);

    isConnected = true;
    console.log("[db] MongoDB connected:", conn.connection.name);
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error.message);
    throw error; // ❗ exit না, throw করো
  }
};

module.exports = connectDB;