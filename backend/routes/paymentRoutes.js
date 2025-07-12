const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// 👉 Create Razorpay order
router.post("/create-order", async (req, res) => {
  const { plan, userId } = req.body;

  const amount = plan === "1 Month" ? 10000 : 25000; // ₹100 or ₹250
  const currency = "INR";

  const options = {
    amount,
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({ order });
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// 👉 Verify payment and activate subscription
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const now = new Date();
  const expiresAt = new Date(
    plan === "1 Month" ? now.setMonth(now.getMonth() + 1) : now.setMonth(now.getMonth() + 3)
  );

  await User.findByIdAndUpdate(userId, {
    isSubscribed: true,
    subscriptionExpiresAt: expiresAt,
  });

  res.status(200).json({ success: true });
});

module.exports = router;