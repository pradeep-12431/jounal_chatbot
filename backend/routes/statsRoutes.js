// 📁 backend/routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");

// 📌 Get Global Website Achievements/Statistics
router.get("/website-achievements", statsController.getWebsiteAchievements);

// 📌 Get User-Specific Dashboard Statistics
router.get("/user-dashboard/:userId", statsController.getUserDashboardStats);

module.exports = router;
