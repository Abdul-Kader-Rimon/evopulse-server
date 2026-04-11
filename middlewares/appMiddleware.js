const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const getEnvInt = (key, fallback) => {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getEnvInt("API_RATE_LIMIT_MAX", 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getEnvInt("AUTH_RATE_LIMIT_MAX", 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please wait and try again."
  }
});

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const elapsed = Date.now() - startedAt;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${elapsed}ms`;
    console.log(`[http] ${line}`);
  });

  next();
};

const securityMiddleware = helmet({
  contentSecurityPolicy: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  requestLogger,
  securityMiddleware
};
