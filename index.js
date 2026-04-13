require("dotenv").config();
const express = require("express");
const dns = require("node:dns/promises");
const cors = require("cors");
const connectDB = require("./config/db");
const {
  apiLimiter,
  requestLogger,
  securityMiddleware
} = require("./middlewares/appMiddleware");
const { notFoundHandler, errorHandler } = require("./middlewares/errorMiddleware");
const userRoutes = require("./routes/userRoutes");

const app = express();

// DNS setting (optional, but keeping it as you had it)
dns.setServers(["1.1.1.1"]);

app.disable("x-powered-by");

// Middlewares
app.use(requestLogger);
app.use(securityMiddleware);

// CORS fix: Localhost port check korben (3000 vs 5173)
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((item) => item.trim()) : true,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running."
  });
});

// User routes - ekhane apiLimiter add kora hoyeche
app.use("/api/users", apiLimiter, userRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database Connection & Server Start logic
const startServer = async () => {
  try {
    // Database connect kora login-er jonno must
    await connectDB();
    console.log("✅ Database Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Connection fail hole server bondho hoye jabe
  }
};

startServer();