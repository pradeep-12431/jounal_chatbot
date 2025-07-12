// 📁 backend/controllers/authController.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ⭐ FIX: Define functions as const and then export them at the end
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    res.status(200).json({ msg: "Login successful", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ⭐ FIX: Export the functions
module.exports = {
  register,
  login,
};