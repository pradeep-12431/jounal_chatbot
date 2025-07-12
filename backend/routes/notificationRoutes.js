// 📁 backend/routes/notificationRoutes.js
const express = require("express");
const admin = require("../firebase-admin"); // ⭐ Ensure this path is correct
const User = require("../models/testUserModel.js");

const router = express.Router();

// ✅ Save FCM token from frontend
router.post("/save-token", async (req, res) => {
  const { userId, fcmToken } = req.body;

  try {
    // Find the user and update their FCM token
    const user = await User.findByIdAndUpdate(userId, { fcmToken: fcmToken }, { new: true });

    if (!user) {
      console.warn(`User with ID ${userId} not found when saving FCM token.`);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    console.log(`✅ FCM Token saved for user ${userId}: ${fcmToken}`);
    res.json({ success: true, message: "FCM Token saved." });
  } catch (error) {
    console.error("❌ Error saving token:", error);
    res.status(500).json({ success: false, message: "Server error saving FCM token." });
  }
});

// ✅ Manually trigger push notification (for testing or admin use)
router.post("/send", async (req, res) => {
  const { fcmToken, title, body } = req.body;

  if (!fcmToken || !title || !body) {
    return res.status(400).json({ success: false, message: "Missing fcmToken, title, or body." });
  }

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    // Optional: data payload for custom handling in app
    // data: {
    //   key1: "value1",
    //   key2: "value2"
    // }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Push notification sent:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⭐ NEW: Endpoint to send a daily reminder notification
router.post("/send-daily-reminder", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      return res.status(404).json({ success: false, message: "User or FCM token not found." });
    }

    const message = {
      token: user.fcmToken,
      notification: {
        title: "Daily Journal Reminder",
        body: "Don't forget to log your thoughts and emotions today!",
      },
      data: {
        type: "daily_reminder",
        journalUrl: "http://localhost:5050/journal" // Or your deployed URL
      }
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Daily reminder notification sent:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Error sending daily reminder notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;