// 📁 backend/routes/exportRoutes.js
const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal"); // Import Journal model
const DailyEntry = require("../models/DailyEntry"); // Import DailyEntry model

// Helper function to format data as JSON string
const formatAsJson = (data, fileName) => {
  const jsonString = JSON.stringify(data, null, 2); // Pretty print JSON
  return {
    content: jsonString,
    contentType: 'application/json',
    fileName: `${fileName}.json`
  };
};

// Helper function to format data as CSV string (simplified example)
const formatAsCsv = (data, fileName) => {
  if (data.length === 0) {
    return {
      content: '',
      contentType: 'text/csv',
      fileName: `${fileName}.csv`
    };
  }

  // Assuming all objects in data have the same keys for CSV header
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).map(value => {
    // Basic CSV escaping: wrap in quotes if value contains comma or quote
    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(','));

  const csvString = [headers, ...rows].join('\n');
  return {
    content: csvString,
    contentType: 'text/csv',
    fileName: `${fileName}.csv`
  };
};


// 📌 Export Journal Entries (All)
router.get("/journals/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await Journal.find({ userId }).sort({ date: 1 }); // Sort by date ascending

    const { content, contentType, fileName } = formatAsJson(entries, `journal_entries_${userId}_${new Date().toISOString().split('T')[0]}`);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(content);

  } catch (err) {
    console.error("❌ Error exporting journal entries:", err);
    res.status(500).json({ message: "Error exporting journal entries", error: err.message });
  }
});

// 📌 Export Daily Diary Entries (All)
router.get("/daily-entries/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await DailyEntry.find({ userId }).sort({ date: 1 }); // Sort by date ascending

    const { content, contentType, fileName } = formatAsJson(entries, `daily_diary_entries_${userId}_${new Date().toISOString().split('T')[0]}`);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(content);

  } catch (err) {
    console.error("❌ Error exporting daily diary entries:", err);
    res.status(500).json({ message: "Error exporting daily diary entries", error: err.message });
  }
});

// ⭐ NEW: Export Single Daily Diary Entry by Date
router.get("/daily-entry/:userId/date/:dateString", async (req, res) => {
  try {
    const { userId, dateString } = req.params;
    const searchDate = new Date(dateString);
    searchDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day for accurate matching

    const entry = await DailyEntry.findOne({ userId, date: searchDate });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found for this date." });
    }

    const { content, contentType, fileName } = formatAsJson(entry, `daily_diary_entry_${userId}_${dateString}`);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(content);

  } catch (err) {
    console.error("❌ Error exporting specific daily entry:", err);
    res.status(500).json({ message: "Error exporting specific daily entry", error: err.message });
  }
});

module.exports = router;