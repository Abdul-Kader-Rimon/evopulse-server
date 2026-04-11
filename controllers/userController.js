const collections = require("../constants/collections");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { generateAuthToken } = require("../utils/token");

// Utility functions
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedGenders = new Set(["male", "female", "other", "prefer_not_to_say"]);
const MAX_LOGIN_HISTORY_ENTRIES = 25;

const sanitizeUser = (user) => {
  const { passwordHash, password, passcode, secret, ...safeUser } = user || {};
  return safeUser;
};

const resolveUsersCollection = () => {
  return mongoose.connection.db ? mongoose.connection.db.collection(collections.USERS) : null;
};

const getUserNames = (body) => {
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  if (firstName || lastName) return { firstName: firstName || "User", lastName: lastName || "" };
  
  const fallbackName = String(body?.name || body?.username || "").trim();
  if (!fallbackName) return { firstName: "User", lastName: "" };
  const [head, ...rest] = fallbackName.split(/\s+/);
  return { firstName: head || "User", lastName: rest.join(" ") };
};

const createAvatarUrl = (firstName, lastName) => {
  const seed = `${String(firstName || "").trim()}-${String(lastName || "").trim()}`.replace(/\s+/g, "-").toLowerCase();
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || "user")}`;
};

const resolveClientIp = (req) => {
  const forwarded = String(req.headers?.["x-forwarded-for"] || "").trim();
  return forwarded ? forwarded.split(",")[0].trim() : String(req.ip || req.socket?.remoteAddress || "").trim() || null;
};

const createAuthPayload = (user) => {
  const safeUser = sanitizeUser(user);
  return { token: generateAuthToken(safeUser), user: safeUser };
};

// --- Main Controllers ---

const registerUser = async (req, res) => {
  try {
    const usersCollection = resolveUsersCollection();
    if (!usersCollection) return res.status(503).json({ success: false, message: "Database not connected." });

    const { firstName, lastName, email, password, phone, gender, dateOfBirth, addresses, avatar } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

    const existingUser = await usersCollection.findOne({ email: normalizeEmail(email) });
    if (existingUser) return res.status(409).json({ success: false, message: "User already exists." });

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    const userDoc = {
      firstName,
      lastName,
      email: normalizeEmail(email),
      phone: phone || null,
      passwordHash,
      avatar: avatar || createAvatarUrl(firstName, lastName),
      role: "user",
      gender: gender || "other",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true,
      loyaltyPoints: 0,
      tier: "Silver", // Default Tier
      totalOrders: 0,
      totalSpent: 0,
      addresses: addresses || [],
      preferences: {
        language: "en",
        currency: "BDT",
        notifications: { email: true, sms: true, push: true, orderUpdates: true, deals: true, newsletter: true }
      },
      wishlist: [],
      recentlyViewed: [],
      createdAt: now,
      updatedAt: now,
      loginHistory: []
    };

    const result = await usersCollection.insertOne(userDoc);
    
    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: createAuthPayload({ ...userDoc, _id: result.insertedId })
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const usersCollection = resolveUsersCollection();
    if (!usersCollection) return res.status(503).json({ success: false, message: "Database not connected." });

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    const user = await usersCollection.findOne({ email: { $regex: `^${escapeRegExp(email)}$`, $options: "i" } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials." });

    const now = new Date();
    const loginEntry = { loggedAt: now, ip: resolveClientIp(req), userAgent: req.headers["user-agent"] };

    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { lastLogin: now, updatedAt: now },
        $push: { loginHistory: { $each: [loginEntry], $slice: -MAX_LOGIN_HISTORY_ENTRIES } }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: createAuthPayload(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const usersCollection = resolveUsersCollection();
    if (!usersCollection) return res.status(503).json({ success: false, message: "Database not connected." });

    // requireAuth মিডলওয়্যার থেকে আমরা req.user._id পাবো
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(req.user._id) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };