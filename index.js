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
const categoryRoutes = require("./routes/categoryRoutes");
const couponRoutes = require("./routes/couponRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const sellerRoutes = require("./routes/sellerRoutes");

const app = express();
dns.setServers(["1.1.1.1"]);
app.disable("x-powered-by");
app.use(requestLogger);
app.use(securityMiddleware);
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map((item) => item.trim()) : true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running."
  });
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/sellers", sellerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    // app.listen(PORT, () => {
    //   console.log(`Server is running at http://localhost:${PORT}`);
    // });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
module.exports = app;