// 📁 backend/routes/dailyEntryRoutes.js
const express = require("express");
const router = express.Router();
const DailyEntry = require("../models/DailyEntry");
// ⭐ Assuming you have an authentication middleware, uncomment/add this:
// const protect = require('../middleware/authMiddleware'); // Adjust path as needed

// 📌 Create or Update Daily Entry
// This endpoint will handle both creating a new entry and updating an existing one for a given day.
// ⭐ Add protect middleware if user authentication is required for this route
router.post("/", /* protect, */ async (req, res) => {
  try {
    // ⭐ Destructure userId from req.user if using auth middleware, otherwise from req.body
    const userId = req.body.userId; // If userId is passed in body directly
    // const userId = req.user.id; // If userId is from auth middleware (more secure)

    const { date, title, content } = req.body;

    if (!userId || !date || !content) {
      return res.status(400).json({ message: "Missing required fields: userId, date, content" });
    }

    // Normalize date to start of day in UTC for unique constraint matching
    // Frontend sends YYYY-MM-DD string, convert it to Date object
    const clientDate = new Date(date);
    const normalizedDate = new Date(Date.UTC(
        clientDate.getFullYear(),
        clientDate.getMonth(),
        clientDate.getDate()
    ));

    // Try to find an existing entry for this user and normalized date
    const updatedFields = {
        title: title || 'My Day', // Ensure title defaults if not provided or empty
        content,
        // updatedAt is handled automatically by `timestamps: true` in schema
    };

    let dailyEntry = await DailyEntry.findOneAndUpdate(
      { userId: userId, date: normalizedDate }, // Query: Find by userId AND the normalized date
      { $set: updatedFields },                 // Update: Use $set for clarity and to only update specified fields
      {
        new: true,         // Return the updated document (or new one if upsert)
        upsert: true,      // Create a new document if one doesn't exist
        runValidators: true // Run schema validators on create/update (e.g., maxlength)
      }
    );

    // Determine if it was an insert (new document) or an update
    // `dailyEntry.createdAt.getTime() === dailyEntry.updatedAt.getTime()` might indicate new
    // but a more robust way might involve inspecting the upsertedId if new: false was used
    // For simplicity, a 200 OK is generally fine for save/update operations.
    // If you strictly need to differentiate, you can check `dailyEntry.isNew` property
    // before saving if you used a `save()` method, but with `findOneAndUpdate` + `upsert` it's harder directly.
    // A 200 status is typically acceptable for both.
    res.status(200).json({
        message: dailyEntry.createdAt.getTime() === dailyEntry.updatedAt.getTime() ? "Daily entry created successfully!" : "Daily entry updated successfully!",
        data: dailyEntry
    });

  } catch (err) {
    console.error("❌ Error saving daily entry:", err);
    // Handle unique constraint violation specifically (though findOneAndUpdate with upsert should largely prevent it)
    if (err.code === 11000) {
      return res.status(409).json({ message: "An entry for this date already exists for this user.", error: err.message });
    }
    // Handle validation errors (e.g., if content exceeds maxlength)
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message, error: err });
    }
    res.status(500).json({ message: "Error saving daily entry", error: err.message });
  }
});

// 📌 Get Daily Entry by Date for a User
router.get("/:userId/date/:dateString", async (req, res) => {
  try {
    const { userId, dateString } = req.params;
    const searchDate = new Date(dateString);
    // Normalize to start of day UTC, consistent with saving logic
    searchDate.setUTCHours(0, 0, 0, 0);

    const dailyEntry = await DailyEntry.findOne({ userId: userId, date: searchDate });

    if (!dailyEntry) {
      return res.status(404).json({ message: "Daily entry not found for this date." });
    }

    res.json(dailyEntry);
  } catch (err) {
    console.error("❌ Error fetching daily entry by date:", err);
    res.status(500).json({ message: "Error fetching daily entry", error: err.message });
  }
});

// 📌 Get All Daily Entries for a User (History)
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await DailyEntry.find({ userId: userId }).sort({ date: -1 }); // Sort by date descending
    res.json(entries);
  } catch (err) {
    console.error("❌ Error fetching daily entry history:", err);
    res.status(500).json({ message: "Error fetching daily entry history", error: err.message });
  }
});

// 📌 Delete Daily Entry by ID
router.delete("/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
    // ⭐ Ensure only the owner can delete, if you have user context
    // const deletedEntry = await DailyEntry.findOneAndDelete({ _id: entryId, userId: req.user.id }); // If using protect middleware
    const deletedEntry = await DailyEntry.findByIdAndDelete(entryId);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Daily entry not found." });
    }

    res.json({ message: "Daily entry deleted successfully", data: deletedEntry });
  } catch (err) {
    console.error("❌ Error deleting daily entry:", err);
    res.status(500).json({ message: "Error deleting daily entry", error: err.message });
  }
});

module.exports = router;