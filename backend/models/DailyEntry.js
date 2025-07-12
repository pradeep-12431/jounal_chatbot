// 📁 backend/models/DailyEntry.js
const mongoose = require("mongoose");

const dailyEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    // Removed: default: Date.now, (handled by `date` being passed from frontend)
    // Removed: unique: true, (handled by compound index below)
  },
  title: {
    type: String,
    trim: true,
    default: "My Day" // Optional default title
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000, // Ensure content has a max length
  },
  // Removed createdAt and updatedAt here. Mongoose will handle them automatically
  // if you enable `timestamps: true` in the schema options.
}, {
  timestamps: true // ⭐ NEW: Mongoose will automatically add createdAt and updatedAt fields
});

// ⭐ This is the CORRECT way to ensure unique entry per user per day
// The `date` field must be normalized (start of day UTC) before saving/querying.
dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

// Removed: pre('save') hook for updatedAt as `timestamps: true` handles it.
// Mongoose will automatically manage `createdAt` and `updatedAt` fields.

const DailyEntry = mongoose.model("DailyEntry", dailyEntrySchema);
module.exports = DailyEntry;