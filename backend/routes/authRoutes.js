// 📁 backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const User = require("../models/testUserModel.js");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// ✅ Add this GET route to fetch user by ID
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ⭐ FIX: Export the router instance
module.exports = router;