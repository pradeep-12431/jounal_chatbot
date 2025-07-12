// 📁 backend/controllers/adminController.js
const User = require("../models/User");
const Journal = require("../models/Journal");
const DailyEntry = require("../models/DailyEntry");

// Helper function to get the start of today (UTC)
const getStartOfTodayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

// 📌 Get overall application statistics
exports.getStats = async (req, res) => {
  try {
    // For a basic dashboard, we'll just fetch counts directly.
    // In a more complex app, you might have dedicated AdminStat models
    // or more sophisticated aggregation.

    const totalUsers = await User.countDocuments();
    const totalJournalEntries = await Journal.countDocuments();
    const totalDailyEntries = await DailyEntry.countDocuments();

    // Count active/trial subscriptions
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

    // Count new journal entries today
    const newJournalEntriesToday = await Journal.countDocuments({
      date: { $gte: startOfToday }
    });

    // Count new daily entries today
    const newDailyEntriesToday = await DailyEntry.countDocuments({
      date: { $gte: startOfToday }
    });


    res.status(200).json({
      totalUsers,
      totalJournalEntries,
      totalDailyEntries,
      activeSubscriptions,
      trialSubscriptions,
      newUsersToday,
      newJournalEntriesToday,
      newDailyEntriesToday
    });

  } catch (err) {
    console.error("❌ Error fetching admin stats:", err);
    res.status(500).json({ message: "Error fetching admin stats", error: err.message });
  }
};

// You can add more admin-specific functions here as needed,
// e.g., exports.getAllUsers, exports.deleteUser, etc.
