const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fcmToken: { type: String },
  subscription: {
    status: {
      type: String,
      enum: ["inactive", "active"],
      default: "inactive",
    },
    plan: { type: String }, // e.g. "1month", "6months"
    startedAt: { type: Date },
    expiryAt: { type: Date },
  },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;

// This is a test comment to force a new deploy