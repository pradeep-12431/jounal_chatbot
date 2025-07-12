// 📁 frontend/src/components/DailyDiary.jsx
import React, { useState, useEffect } from "react";
import axios from "../api";
import '../styles/DailyDairy.css'; // ⭐ Make sure this import path is correct and the file exists!

// Accept an onClose prop to allow closing the diary view
const DailyDiary = ({ userId, onClose }) => {
  // Format date for API calls (YYYY-MM-DD)
  const formatDateForApi = (date) => {
    const d = new Date(date);
    // Normalize to UTC start of day to match backend's unique constraint logic
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().split('T')[0];
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [historyEntries, setHistoryEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [exportSelectedDate, setExportSelectedDate] = useState(formatDateForApi(new Date()));

  // Fetch current day's entry and history on date change or component mount
  useEffect(() => {
    const fetchCurrentEntry = async () => {
      if (!userId) return;
      setLoading(true);
      setMessage("");
      try {
        const formattedDate = formatDateForApi(currentDate);
        const res = await axios.get(`/daily-entries/${userId}/date/${formattedDate}`);
        setEntryTitle(res.data.title || "");
        setEntryContent(res.data.content || "");
        setMessage("Entry loaded successfully.");
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setEntryTitle(""); // Clear title for new entry
          setEntryContent(""); // Clear content for new entry
          setMessage("No entry for this date. Start writing!");
        } else {
          console.error("Error fetching current daily entry:", err);
          setMessage("Error fetching entry.");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`/daily-entries/history/${userId}`);
        // ⭐ NEW: Sort history entries by date descending (most recent first)
        setHistoryEntries(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error("Error fetching daily entry history:", err);
        setMessage("Error fetching history.");
      }
    };

    fetchCurrentEntry();
    fetchHistory();
  }, [userId, currentDate]); // Re-fetch when userId or currentDate changes

  const handleSaveEntry = async () => {
    if (!userId || !entryContent.trim()) {
      setMessage("Content cannot be empty.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const formattedDate = formatDateForApi(currentDate);
      const res = await axios.post("/daily-entries", {
        userId,
        date: formattedDate,
        title: entryTitle.trim() || "My Day",
        content: entryContent.trim(),
      });
      setMessage(res.data.message);
      // Re-fetch history to show the updated entry, sorted
      const historyRes = await axios.get(`/daily-entries/history/${userId}`);
      setHistoryEntries(historyRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("Error saving daily entry:", err);
      setMessage(err.response?.data?.message || "Error saving entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    setLoading(true);
    setMessage("");
    try {
      await axios.delete(`/daily-entries/${entryId}`);
      setMessage("Entry deleted successfully.");
      // Re-fetch history and clear current entry if it was the one deleted
      const historyRes = await axios.get(`/daily-entries/history/${userId}`);
      setHistoryEntries(historyRes.data.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort again
      // Check if the deleted entry was the one currently being viewed
      if (historyEntries.find(e => e._id === entryId && formatDateForApi(e.date) === formatDateForApi(currentDate))) {
        setEntryTitle("");
        setEntryContent("");
      }
    } catch (err) {
      console.error("Error deleting daily entry:", err);
      setMessage(err.response?.data?.message || "Error deleting entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Handle click on a history entry to load it into the editor
  const handleHistoryClick = (entryDate) => {
    setCurrentDate(new Date(entryDate)); // This will trigger useEffect to fetch and display the entry
    setMessage("Loading past entry...");
  };

  // Handle Export All Daily Diary Data
  const handleExportDailyDiary = async () => {
    if (!userId) {
      alert("Please log in to export data.");
      return;
    }
    try {
      window.open(`http://localhost:5050/api/export/daily-entries/${userId}`, '_blank');
    } catch (error) {
      console.error("Error exporting daily diary data:", error);
      alert("Failed to export daily diary data.");
    }
  };

  // ⭐ MODIFIED: Handle Export Specific Date Daily Diary Data
  const handleExportSpecificDate = async (dateToExport) => {
    if (!userId) {
      alert("Please log in to export data.");
      return;
    }
    const formattedDate = formatDateForApi(dateToExport);
    try {
      window.open(`http://localhost:5050/api/export/daily-entry/${userId}/date/${formattedDate}`, '_blank');
    } catch (error) {
      console.error("Error exporting specific daily diary data:", error);
      alert("Failed to export specific daily diary data.");
    }
  };

  // ⭐ NEW: Handle Export Selected Date
  const handleExportSelectedDate = () => {
    if (!exportSelectedDate) {
      alert("Please select a date to export.");
      return;
    }
    handleExportSpecificDate(new Date(exportSelectedDate));
  };


  return (
    <div className="diary-container-wrapper"> {/* NEW: Full screen wrapper */}
      <div className="diary-book-card"> {/* NEW: Main book-like container */}
        <header className="diary-header"> {/* NEW: Header styling */}
            <button
                onClick={onClose}
                className="diary-back-button" // NEW: Back button styling
            >
                &larr; Back to Journal
            </button>
            <h1 className="diary-title">Your Daily Diary</h1> {/* NEW: Title styling */}
            {/* Removed the empty div spacer here, flex-grow on title handles it now */}
        </header>

        <div className="diary-content-area"> {/* NEW: Container for two-pane layout */}
            {/* Left Pane: Current Day Entry / Editor */}
            <section className="diary-editor-pane"> {/* NEW: Editor pane styling */}
                <h2 className="editor-current-date-display"> {/* NEW: Date display styling */}
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <div className="editor-date-nav"> {/* NEW: Date navigation styling */}
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="" // Removed bg-purple-200 etc. as new CSS takes over
                    >
                        &larr; Previous Day
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="today-button" // Apply specific class for today button
                    >
                        Today
                    </button>
                    <button
                        onClick={() => handleDateChange(1)}
                        className="" // Removed bg-purple-200 etc.
                    >
                        Next Day &rarr;
                    </button>
                </div>

                <div className="space-y-4 flex-grow flex flex-col"> {/* Added flex-grow to form section */}
                    <div className="entry-form-group"> {/* NEW: Form group styling */}
                        <label htmlFor="entryTitle">Title (Optional):</label>
                        <input
                            type="text"
                            id="entryTitle"
                            value={entryTitle}
                            onChange={(e) => setEntryTitle(e.target.value)}
                            placeholder="A title for your day..."
                            className="" // Removed w-full etc.
                        />
                    </div>
                    <div className="entry-form-group flex-grow"> {/* Added flex-grow to content area */}
                        <label htmlFor="entryContent">What happened today?</label>
                        <textarea
                            id="entryContent"
                            value={entryContent}
                            onChange={(e) => e.target.value.length <= 5000 && setEntryContent(e.target.value)}
                            placeholder="Write about your day here..."
                            rows="10"
                            required
                            className="flex-grow" // Allow textarea to fill available space
                        />
                        <p className="char-count">{entryContent.length}/5000 characters</p>
                    </div>
                    <button
                        onClick={handleSaveEntry}
                        className="save-button" // NEW: Save button styling
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Save Entry"
                        )}
                    </button>
                    {message && (
                        <p className={`message-display ${message.includes("Error") || message.includes("not found") ? "error" : "success"}`}>
                            {message}
                        </p>
                    )}
                </div>
            </section>

            {/* Right Pane: History of Entries and Export */}
            <section className="diary-history-pane"> {/* NEW: History pane styling */}
                <h2 className="history-section-title">Your Diary History</h2>
                {/* Export Buttons Container */}
                <div className="export-buttons-group"> {/* NEW: Export group styling */}
                    <button onClick={handleExportDailyDiary}>
                        Export All Data
                    </button>
                    <button onClick={() => handleExportSpecificDate(currentDate)}>
                        Export Current Day
                    </button>
                    <div className="export-date-selector"> {/* NEW: Date selector styling */}
                        <input
                            type="date"
                            value={exportSelectedDate}
                            onChange={(e) => setExportSelectedDate(e.target.value)}
                        />
                        <button onClick={handleExportSelectedDate}>
                            Export Selected
                        </button>
                    </div>
                </div>
                {historyEntries.length === 0 ? (
                    <p className="no-entries-message">No past diary entries yet.</p>
                ) : (
                    <div className="history-list"> {/* NEW: History list styling */}
                        {historyEntries.map((entry) => (
                            <div key={entry._id} className="history-entry-item"> {/* NEW: History item styling */}
                                <div className="history-entry-header">
                                    <h3 className="history-entry-title-date">
                                        {entry.title || "My Day"} - {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </h3>
                                    <div className="history-entry-actions">
                                        {/* View Button - using a button with text now, can be icon*/}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleHistoryClick(entry.date); }}
                                            className="view-button"
                                            title="View Entry"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry._id); }}
                                            title="Delete Entry"
                                            className="delete-button" // ⭐ ADDED THIS CLASS
                                        >
                                            {/* ⭐ UPDATED SVG PATH FOR DELETE ICON */}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                                <path fillRule="evenodd" d="M16.5 4.478l.812-.764A1.25 1.25 0 0119 4.978V6.25a.75.75 0 01-1.5 0v-1.022l-.812.764a.75.75 0 01-1.042-1.042zM4.5 4.478l-.812-.764A1.25 1.25 0 002 4.978V6.25a.75.75 0 001.5 0v-1.022l.812.764a.75.75 0 001.042-1.042zM12 2a.75.75 0 01.75.75V3.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0112 2zM3 8.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v11.5A2.75 2.75 0 0119.25 23H4.75A2.75 2.75 0 012 20.25V8.75zm.75.75V20.25a1.25 1.25 0 001.25 1.25h14.5a1.25 1.25 0 001.25-1.25V9.5h-17.5zM7.75 12a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5a.75.75 0 01.75-.75zm4.75 0a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5a.75.75 0 01.75-.75zm4.75 0a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {/* Content preview with ellipsis */}
                                <p className="history-entry-content-preview">
                                    {entry.content.substring(0, 100)}{entry.content.length > 100 ? '...' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
      </div>
    </div>
  );
};

export default DailyDiary;