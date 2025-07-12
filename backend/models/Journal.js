// 📁 backend/models/Journal.js
const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mood: {
    type: String,
    enum: ["happy", "sad", "angry", "neutral", "anxious", "excited"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sentiment: {
    type: String,
    default: "neutral",
  },
  feedback: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Journal = mongoose.model("Journal", journalSchema);
module.exports = Journal;
