const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/testUserModel.js.js"); // ⭐ NEW: Added .js extension

require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan durations in milliseconds
const PLAN_CONFIG = {
  "1month": { amount: 19900, durationMs: 30 * 24 * 60 * 60 * 1000 },
  "6months": { amount: 99900, durationMs: 6 * 30 * 24 * 60 * 60 * 1000 },
  "12months": { amount: 179900, durationMs: 12 * 30 * 24 * 60 * 60 * 1000 },
  "trial": { durationMs: 4 * 24 * 60 * 60 * 1000 } // 4 days trial
};

// ✅ Create Razorpay Order
router.post("/create-order", async (req, res) => {
  const { userId, plan } = req.body;
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG["1month"];
  const receipt = `subscr_${userId}_${Date.now()}`.slice(0, 40);

  try {
    const order = await razorpay.orders.create({
      amount: config.amount,
      currency: "INR",
      receipt,
    });
    res.json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ Verify Razorpay Payment & Save Expiry
router.post("/verify", async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, userId, plan = "1month" } = req.body;
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG["1month"];
  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpaySignature) {
    const now = new Date();
    const expiryAt = new Date(now.getTime() + config.durationMs);

    await User.findByIdAndUpdate(userId, {
      subscription: {
        status: "active", // Paid subscriptions are 'active'
        startedAt: now,
        expiryAt,
        plan,
      },
    });

    res.json({ status: "verified" });
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
});

// ✅ Check Subscription Status with Expiry Handling
router.get("/status/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const sub = user?.subscription;

    if (sub?.status === "active" || sub?.status === "trial") { // Check for 'trial' status too
      if (sub.expiryAt && new Date(sub.expiryAt) < new Date()) {
        // expired — update status
        await User.findByIdAndUpdate(user._id, {
          "subscription.status": "inactive",
        });
        return res.json({ status: "inactive", expired: true });
      }
    }
    // Return current status if not expired or if inactive/no subscription
    res.json({ status: sub?.status || "inactive", expiry: sub?.expiryAt });
  } catch (err) {
    console.error("❌ Failed to fetch subscription status:", err);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// ⭐ NEW ENDPOINT: Activate Free Trial
router.post("/activate-trial", async (req, res) => {
  const { userId } = req.body;
  const config = PLAN_CONFIG["trial"]; // Get trial duration

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent activating trial if already active or on trial
    if (user.subscription?.status === "active" || user.subscription?.status === "trial") {
      return res.status(400).json({ message: "Subscription or trial already active." });
    }

    const now = new Date();
    const expiryAt = new Date(now.getTime() + config.durationMs);

    await User.findByIdAndUpdate(userId, {
      subscription: {
        status: "trial", // Set status to 'trial'
        startedAt: now,
        expiryAt,
        plan: "free_trial", // Indicate it's a free trial
      },
    });

    res.json({ success: true, message: "Free trial activated!", expiryAt });
  } catch (err) {
    console.error("❌ Error activating free trial:", err);
    res.status(500).json({ message: "Failed to activate free trial.", error: err.message });
  }
});

module.exports = router;