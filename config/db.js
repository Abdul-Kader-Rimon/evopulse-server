const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;

  if (!mongoUri) {
    console.error("[db] Error: MONGO_URI missing in .env file.");
    process.exit(1);
  }

  try {
    const connectOptions = dbName ? { dbName } : {};
    await mongoose.connect(mongoUri, connectOptions);
    console.log("[db] MongoDB connected successfully to:", mongoose.connection.name);
  } catch (error) {
    console.error("[db] MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
