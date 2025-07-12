// 📁 backend/routes/journalRoutes.js
const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args)); // ⭐ Added for Gemini API call
require("dotenv").config(); // ⭐ Added to ensure dotenv is configured for API key

// 📌 Create journal entry
router.post("/", async (req, res) => {
  try {
    const { userId, mood, entry } = req.body;
    console.log("➡️ Incoming POST /api/journals", { userId, mood, entry });

    if (!userId || !mood || !entry) {
      console.warn("⛔ Missing fields", { userId, mood, entry });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEntry = new Journal({
      userId,
      mood,
      text: entry,
      sentiment: "neutral", // Default sentiment, can be updated by AI later
      feedback: "", // Initialize feedback as empty
    });

    await newEntry.save();
    console.log("✅ Journal saved:", newEntry);
    res.status(201).json({ message: "Journal entry created", data: newEntry });
  } catch (err) {
    console.error("❌ Error saving journal:", err);
    res.status(500).json({ message: "Error creating journal entry", error: err.message });
  }
});

// 📌 Get all journal entries for user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await Journal.find({ userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching entries", error: err });
  }
});

// 📌 Filter entries by mood (Already exists, confirming it's here)
router.get("/:userId/mood/:mood", async (req, res) => {
  try {
    const { userId, mood } = req.params;
    const entries = await Journal.find({ userId, mood }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Error filtering entries", error: err });
  }
});

// ⭐ NEW ENDPOINT: Generate AI Sentiment Feedback for a Journal Entry
router.post("/generate-feedback", async (req, res) => {
  const { entryText } = req.body;
  console.log("📝 Incoming request for AI feedback:", entryText);

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Gemini API key is missing. Cannot generate feedback.");
    return res.status(500).json({ feedback: "❌ Gemini API key is missing on the server." });
  }

  try {
    const prompt = `Analyze the sentiment of the following journal entry and provide concise, empathetic feedback (2-3 sentences). Focus on acknowledging the emotion and offering a gentle, supportive perspective. Do not ask questions. \n\nEntry: "${entryText}"`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("❌ Gemini response error for feedback:", geminiRes.status, errorText);
      return res
        .status(500)
        .json({ feedback: "❌ Gemini API error: " + geminiRes.statusText });
    }

    const data = await geminiRes.json();
    const feedback =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not generate AI feedback.";

    res.json({ feedback });
  } catch (err) {
    console.error("❌ Error generating AI feedback:", err);
    res.status(500).json({ feedback: "❌ Internal server error during AI feedback generation." });
  }
});

module.exports = router;