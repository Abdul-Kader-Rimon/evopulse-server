const express = require("express");
const { registerUser, loginUser, getCurrentUser } = require("../controllers/userController");
const { requireAuth } = require("../middlewares/authMiddleware"); // নিশ্চিত করুন এই মিডলওয়্যারটি আছে
const { authLimiter } = require("../middlewares/appMiddleware");

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// প্রোফাইল ডাটা গেট করার রাউট
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;