// 📁 backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// 📌 Get overall application statistics
// For a basic dashboard, we'll allow access for now.
// In a real application, this route would be protected by admin authentication middleware.
router.get("/stats", adminController.getStats);

module.exports = router;