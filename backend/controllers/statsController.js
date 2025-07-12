// 📁 backend/controllers/statsController.js
const mongoose = require("mongoose"); // ⭐ FIX: Import mongoose
const User = require("../models/testUserModel.js");
const Journal = require("../models/Journal");
const DailyEntry = require("../models/DailyEntry");

// Helper function to get the start of today (UTC) for consistent date queries
const getStartOfTodayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

// 📌 Get Global Website Achievements/Statistics
exports.getWebsiteAchievements = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJournalEntries = await Journal.countDocuments();
    const totalDailyEntries = await DailyEntry.countDocuments();

    // Count active/trial subscriptions (assuming subscription status is managed in User model)
    const activeSubscriptions = await User.countDocuments({
      "subscription.status": "active",
      "subscription.expiryAt": { $gt: new Date() } // Expiry date is in the future
    });

    const trialSubscriptions = await User.countDocuments({
      "subscription.status": "trial",
      "subscription.expiryAt": { $gt: new Date() } // Expiry date is in the future
    });

    // Count new users today
    const startOfToday = getStartOfTodayUTC();
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    res.status(200).json({
      totalUsers,
      totalJournalEntries,
      totalDailyEntries,
      activeSubscriptions,
      trialSubscriptions,
      newUsersToday,
      // Add more global stats as needed, e.g., average entries per user, most common mood
    });

  } catch (err) {
    console.error("❌ Error fetching website achievements:", err);
    res.status(500).json({ message: "Error fetching website achievements", error: err.message });
  }
};

// 📌 Get User-Specific Dashboard Statistics
exports.getUserDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userJournalEntries = await Journal.countDocuments({ userId });
    const userDailyEntries = await DailyEntry.countDocuments({ userId });

    // Last 7 days journal entries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentJournalEntries = await Journal.countDocuments({
      userId,
      date: { $gte: sevenDaysAgo }
    });

    // Count of each mood type for the user
    const moodCounts = await Journal.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Match by userId
      { $group: { _id: "$mood", count: { $sum: 1 } } }, // Group by mood and count
      { $sort: { count: -1 } } // Sort by count descending
    ]);

    res.status(200).json({
      username: user.username,
      userJournalEntries,
      userDailyEntries,
      recentJournalEntries,
      moodCounts,
      // Add more user-specific stats as needed
    });

  } catch (err) {
    console.error("❌ Error fetching user dashboard stats:", err);
    res.status(500).json({ message: "Error fetching user dashboard stats", error: err.message });
  }
};
