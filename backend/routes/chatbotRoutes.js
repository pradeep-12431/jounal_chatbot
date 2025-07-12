const express = require("express");
const router = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();

router.post("/", async (req, res) => {
  const { message } = req.body;
  console.log("📝 Incoming message:", message);

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ reply: "❌ Gemini API key is missing." });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("❌ Gemini response error:", geminiRes.status, errorText);
      return res
        .status(500)
        .json({ reply: "❌ Gemini API error: " + geminiRes.statusText });
    }

    const data = await geminiRes.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "❌ Gemini gave no response.";

    res.json({ reply });
  } catch (err) {
    console.error("❌ Chatbot error:", err);
    res.status(500).json({ reply: "❌ Internal server error." });
  }
});

module.exports = router;