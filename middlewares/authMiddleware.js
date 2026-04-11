const mongoose = require("mongoose");
const collections = require("../constants/collections");
const { verifyAuthToken } = require("../utils/token");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractBearerToken = (headerValue) => {
  const raw = String(headerValue || "");

  if (!raw.startsWith("Bearer ")) {
    return null;
  }

  return raw.slice("Bearer ".length).trim();
};

const requireAuth = async (req, res, next) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected yet."
      });
    }

    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required."
      });
    }

    const decoded = verifyAuthToken(token);
    const usersCollection = mongoose.connection.db.collection(collections.USERS);

    const email = normalizeEmail(decoded?.email);
    const user = await usersCollection.findOne({
      email: { $regex: `^${escapeRegExp(email)}$`, $options: "i" }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    const role = String(req.user?.role || "").toLowerCase();
    const allowedRoles = roles.map((item) => String(item).toLowerCase());

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource."
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
