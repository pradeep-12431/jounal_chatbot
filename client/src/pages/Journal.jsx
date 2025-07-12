// 📁 frontend/src/pages/Journal.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "../api"; // This is your configured axios instance
import MoodChart from "../components/MoodChart";
import RazorpayButton from "../components/RazorpayButton";
import Chatbot from "../components/Chatbot";
import DailyDiary from "../components/DailyDiary";
import { Link } from "react-router-dom";

import '../styles/Journal.css';

const Journal = () => {
  const [formData, setFormData] = useState({ mood: "", entry: "" });
  const [entries, setEntries] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState("loading");
  const [subscriptionExpiry, setSubscriptionExpiry] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [showDailyDiary, setShowDailyDiary] = useState(false);
  const [filterMood, setFilterMood] = useState("all");
  const [showReminder, setShowReminder] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState('30days');

  const [showWebsiteAchievements, setShowWebsiteAchievements] = useState(false);
  const [websiteAchievements, setWebsiteAchievements] = useState(null);
  const [websiteAchievementsLoading, setWebsiteAchievementsLoading] = useState(false);
  const [websiteAchievementsError, setWebsiteAchievementsError] = useState(null);

  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [userDashboardStats, setUserDashboardStats] = useState(null);
  const [userDashboardLoading, setUserDashboardLoading] = useState(false);
  const [userDashboardError, setUserDashboardError] = useState(null);

  const userId = localStorage.getItem("userId");
  const user = JSON.parse(localStorage.getItem("user"));

  const checkDailyReminder = () => {
    const lastReminderDate = localStorage.getItem("lastReminderDate");
    const today = new Date().toDateString();

    if (lastReminderDate !== today) {
      setShowReminder(true);
      localStorage.setItem("lastReminderDate", today);
    }
  };

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await axios.get(`/subscribe/status/${userId}`);
      setSubscriptionStatus(res.data.status || "inactive");
      if (res.data.expiry) {
        setSubscriptionExpiry(new Date(res.data.expiry).toLocaleDateString());
      } else {
        setSubscriptionExpiry("");
      }
    } catch (err) {
      console.error("Failed to fetch subscription status for Journal:", err);
      setSubscriptionStatus("inactive");
      setSubscriptionExpiry("");
    }
  }, [userId]);

  const fetchEntries = useCallback(async () => {
    try {
      let res;
      if (filterMood === "all") {
        res = await axios.get(`/journals/${userId}`);
      } else {
        res = await axios.get(`/journals/${userId}/mood/${filterMood}`);
      }
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    }
  }, [userId, filterMood]);

  const fetchWebsiteAchievements = useCallback(async () => {
    setWebsiteAchievementsLoading(true);
    setWebsiteAchievementsError(null);
    try {
      const response = await axios.get('/stats/website-achievements');
      setWebsiteAchievements(response.data);
    } catch (err) {
      console.error("Error fetching website achievements:", err);
      setWebsiteAchievementsError("Failed to load website achievements.");
    } finally {
      setWebsiteAchievementsLoading(false);
    }
  }, []);

  const fetchUserDashboardStats = useCallback(async () => {
    setUserDashboardLoading(true);
    setUserDashboardError(null);
    try {
      const response = await axios.get(`/stats/user-dashboard/${userId}`);
      setUserDashboardStats(response.data);
    } catch (err) {
      console.error("Error fetching user dashboard stats:", err);
      setUserDashboardError("Failed to load your dashboard statistics.");
    } finally {
      setUserDashboardLoading(false);
    }
  }, [userId]);


  useEffect(() => {
    if (userId) {
      fetchEntries();
      fetchSubscription();
      checkDailyReminder();
    }
  }, [userId, filterMood, fetchEntries, fetchSubscription]);

  useEffect(() => {
    if (showWebsiteAchievements) {
      fetchWebsiteAchievements();
    }
  }, [showWebsiteAchievements, fetchWebsiteAchievements]);

  useEffect(() => {
    if (showUserDashboard && userId) {
      fetchUserDashboardStats();
    }
  }, [showUserDashboard, userId, fetchUserDashboardStats]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/journals", {
        ...formData,
        userId,
      });
      const newEntry = res.data.data || res.data;

      if (newEntry.text) {
        try {
          // ⭐ FIX: Use the configured axios instance for AI feedback ⭐
          const feedbackRes = await axios.post("/journals/generate-feedback", { entryText: newEntry.text });
          newEntry.feedback = feedbackRes.data.feedback;
        } catch (feedbackErr) {
          console.error("Failed to generate AI feedback:", feedbackErr);
          newEntry.feedback = "AI feedback could not be generated.";
        }
      }

      setEntries([newEntry, ...entries]);
      setFormData({ mood: "", entry: "" });

    } catch (err) {
      console.error("Failed to save entry", err);
    }
  };

  const handleFreeTrial = async () => {
    if (!userId) {
      alert("Please log in to activate a free trial.");
      return;
    }
    try {
      const res = await axios.post("/subscribe/activate-trial", { userId });
      if (res.data.success) {
        alert(res.data.message);
        fetchSubscription();
      } else {
        alert(res.data.message || "Failed to activate trial.");
      }
    } catch (err) {
      console.error("Error activating free trial:", err);
      alert(err.response?.data?.message || "An error occurred while activating trial.");
    }
  };

  const handleMoodFilterChange = (e) => {
    setFilterMood(e.target.value);
  };

  const handleExportJournal = async () => {
    if (!userId) {
      alert("Please log in to export data.");
      return;
    }
    try {
      // ⭐ FIX: Use the configured axios instance's baseURL for export ⭐
      // This will use REACT_APP_API_BASE_URL from your Netlify env
      window.open(`${axios.defaults.baseURL}/export/journals/${userId}`, '_blank');
    } catch (error) {
      console.error("Error exporting journal data:", error);
      alert("Failed to export journal data.");
    }
  };

  const isChatbotEnabled = subscriptionStatus === "active" || subscriptionStatus === "trial";

  if (showChatbot) {
    return <Chatbot onClose={() => setShowChatbot(false)} />;
  }

  if (showDailyDiary) {
    return <DailyDiary userId={userId} onClose={() => setShowDailyDiary(false)} />;
  }

  return (
    <div className="journal-container">
      {/* Daily Reminder Pop-up */}
      {showReminder && (
        <div className="reminder-overlay">
          <div className="reminder-card">
            <h3 className="reminder-title">Daily Check-in!</h3>
            <p className="reminder-message">
              A moment of reflection can transform your day. Let's log your thoughts and emotions.
            </p>
            <button
              onClick={() => setShowReminder(false)}
              className="reminder-button"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="container-wrapper">
        {/* Profile Link */}
        <div className="profile-link-container">
          <Link to="/profile" className="profile-link">
            My Profile
          </Link>
        </div>

        {/* Landing Style Hero Section */}
        <header className="hero-header">
          <h1 className="hero-title">
            Inner Harmony, Daily Growth
          </h1>
          <p className="hero-subtitle">
            Your personal sanctuary for emotional well-being. Journal, reflect, and discover insights.
          </p>
        </header>

        {/* Toggle Buttons for Dashboards */}
        <div className="toggle-buttons-container">
          <button
            onClick={() => setShowWebsiteAchievements(!showWebsiteAchievements)}
            className="toggle-button achievements"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <span>{showWebsiteAchievements ? 'Hide Global Achievements' : 'Show Global Achievements'}</span>
          </button>
          <button
            onClick={() => setShowUserDashboard(!showUserDashboard)}
            className="toggle-button dashboard"
          >
            {/* ⭐ FIX: Corrected SVG path for the user dashboard icon ⭐ */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{showUserDashboard ? 'Hide My Dashboard' : 'Show My Dashboard'}</span>
          </button>
        </div>

        {/* Website Achievements Section */}
        <section
          className={`section-card ${showWebsiteAchievements ? 'visible-section' : 'hidden-section'}`}
          style={{ '--animation-delay': '0s' }}
        >
          <h2 className="section-title achievements">Website Achievements 🏆</h2>
          {websiteAchievementsLoading ? (
            <p className="text-center text-gray-600 text-xl flex items-center justify-center space-x-2">
              <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading global achievements...</span>
            </p>
          ) : websiteAchievementsError ? (
            <p className="text-center text-red-500 text-xl">{websiteAchievementsError}</p>
          ) : websiteAchievements ? (
            <div className="stat-grid">
              <div className="stat-card blue">
                <h3 className="stat-card-title">Total Users</h3>
                <p className="stat-card-value">{websiteAchievements.totalUsers}</p>
                <p className="stat-card-subtitle">New today: {websiteAchievements.newUsersToday}</p>
              </div>
              <div className="stat-card green">
                <h3 className="stat-card-title">Total Journal Entries</h3>
                <p className="stat-card-value">{websiteAchievements.totalJournalEntries}</p>
              </div>
              <div className="stat-card purple">
                <h3 className="stat-card-title">Total Daily Entries</h3>
                <p className="stat-card-value">{websiteAchievements.totalDailyEntries}</p>
              </div>
              <div className="stat-card yellow">
                <h3 className="stat-card-title">Active Subs</h3>
                <p className="stat-card-value">{websiteAchievements.activeSubscriptions}</p>
              </div>
              <div className="stat-card red">
                <h3 className="stat-card-title">Trial Subs</h3>
                <p className="stat-card-value">{websiteAchievements.trialSubscriptions}</p>
              </div>
            </div>
          ) : null}
        </section>

        {/* User Dashboard Section */}
        <section
          className={`section-card ${showUserDashboard ? 'visible-section' : 'hidden-section'}`}
          style={{ '--animation-delay': '0.1s' }}
        >
          <h2 className="section-title dashboard">My Dashboard ✨</h2>
          {userDashboardLoading ? (
            <p className="text-center text-gray-600 text-xl flex items-center justify-center space-x-2">
              <svg className="animate-spin h-6 w-6 text-purple-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading your statistics...</span>
            </p>
          ) : userDashboardError ? (
            <p className="text-center text-red-500 text-xl">{userDashboardError}</p>
          ) : userDashboardStats ? (
            <div className="stat-grid">
              <div className="stat-card blue">
                <h3 className="stat-card-title">Your Journal Entries</h3>
                <p className="stat-card-value">{userDashboardStats.userJournalEntries}</p>
                <p className="stat-card-subtitle">Past 7 days: {userDashboardStats.recentJournalEntries}</p>
              </div>
              <div className="stat-card green">
                <h3 className="stat-card-title">Your Daily Entries</h3>
                <p className="stat-card-value">{userDashboardStats.userDailyEntries}</p>
              </div>
              <div className="stat-card purple mood-breakdown">
                <h3 className="stat-card-title">Your Mood Breakdown</h3>
                {userDashboardStats.moodCounts && userDashboardStats.moodCounts.length > 0 ? (
                  <ul>
                    {userDashboardStats.moodCounts.map((moodStat, index) => (
                      <li key={index}>
                        <span>{moodStat._id}</span>: {moodStat.count} entries
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">No mood data yet. Start journaling to see your trends!</p>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* Subscription Status */}
        <div className="subscription-status-card">
          <p>
            Subscription Status: <span>{subscriptionStatus}</span>
          </p>
          {subscriptionExpiry && (
            <p className="expiry-text">Expires on: <span>{subscriptionExpiry}</span></p>
          )}
        </div>

        {/* Journal Form */}
        <section className="journal-form-section">
          <h2 className="section-title journal-form">New Journal Entry ✍️</h2>
          <form onSubmit={handleSubmit} className="journal-form">
            <div>
              <label htmlFor="mood">How are you feeling today?</label>
              <select
                name="mood"
                id="mood"
                value={formData.mood}
                onChange={handleChange}
                required
              >
                <option value="">Select Mood</option>
                <option value="happy">😊 Happy - Feeling joyful and content</option>
                <option value="sad">😢 Sad - Feeling down or sorrowful</option>
                <option value="angry">😠 Angry - Feeling frustrated or irritated</option>
                <option value="neutral">😐 Neutral - Feeling calm or indifferent</option>
                <option value="anxious">😟 Anxious - Feeling worried or uneasy</option>
                <option value="excited">🤩 Excited - Feeling enthusiastic and eager</option>
              </select>
            </div>
            <div>
              <label htmlFor="entry">What's on your mind?</label>
              <textarea
                name="entry"
                id="entry"
                value={formData.entry}
                onChange={handleChange}
                placeholder="Write about your day, your thoughts, your feelings... no judgment here."
                required
              />
            </div>
            <button type="submit" className="journal-submit-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Save Your Entry</span>
            </button>
          </form>
        </section>

        {/* Mood Chart */}
        <section className="mood-chart-section">
          <h2 className="section-title mood-trends">Your Mood Trends 📈</h2>
          <div className="chart-filter-container">
            <label htmlFor="chartTimeRange" className="chart-filter-label">View Chart For:</label>
            <select
              id="chartTimeRange"
              value={chartTimeRange}
              onChange={(e) => setChartTimeRange(e.target.value)}
              className="chart-filter-select"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <MoodChart entries={entries} timeRange={chartTimeRange} />
        </section>

        {/* Past Entries */}
        <section className="past-entries-section">
          <h2 className="section-title journal-history">Your Journal History 📖</h2>
          {/* Mood Filter Dropdown */}
          <div className="mood-filter-container">
            <label htmlFor="moodFilter" className="mood-filter-label">Filter by Mood:</label>
            <select
              id="moodFilter"
              value={filterMood}
              onChange={handleMoodFilterChange}
              className="mood-filter-select"
            >
              <option value="all">All Moods</option>
              <option value="happy">😊 Happy</option>
              <option value="sad">😢 Sad</option>
              <option value="angry">😠 Angry</option>
              <option value="neutral">😐 Neutral</option>
              <option value="anxious">😟 Anxious</option>
              <option value="excited">🤩 Excited</option>
            </select>
          </div>

          <div className="entries-list">
            {entries.length === 0 ? (
              <p className="text-gray-500 text-center text-xl">No entries found for the selected mood. Start journaling to see your history!</p>
            ) : (
              entries.map((entry) => (
                <div key={entry._id} className="journal-entry-card">
                  <p className="entry-date">📅 {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="entry-mood">
                    Mood: <span>{entry.mood}</span>
                    {entry.mood === 'happy' && ' 😊'}
                    {entry.mood === 'sad' && ' 😢'}
                    {entry.mood === 'angry' && ' 😠'}
                    {entry.mood === 'neutral' && ' 😐'}
                    {entry.mood === 'anxious' && ' 😟'}
                    {entry.mood === 'excited' && ' 🤩'}
                  </p>
                  <p className="entry-text">{entry.text}</p>
                  {/* Display AI Feedback */}
                  {entry.feedback && (
                    <div className="ai-feedback">
                      <span className="feedback-label">AI Feedback:</span> {entry.feedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Call to Action - Subscription, Chatbot & Daily Diary */}
        <section className="cta-section">
          <h2 className="cta-title">Unlock Your Full Potential!</h2>
          <p className="cta-subtitle">
            🎁 New here? <span>Try a free 4-day trial</span> to explore all premium features, including advanced AI insights and exclusive tools!
          </p>

          {/* Free Trial Button - Only show if not active or on trial */}
          {subscriptionStatus === "inactive" && (
            <button
              className="cta-button free-trial"
              onClick={handleFreeTrial}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Activate Free Trial (4 Days)</span>
            </button>
          )}

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {/* Chatbot Button - Only show if active or on trial */}
            {isChatbotEnabled && (
              <button
                onClick={() => setShowChatbot(true)}
                className="cta-button chatbot"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Start Chatbot</span>
              </button>
            )}

            {/* Daily Diary Button */}
            <button
              onClick={() => setShowDailyDiary(true)}
              className="cta-button daily-diary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
              </svg>
              <span>My Daily Diary</span>
            </button>

            {/* Export Journal Data Button */}
            <button
              onClick={handleExportJournal}
              className="cta-button export-journal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Journal Data</span>
            </button>
          </div>

          <p className="cta-info-text">
            Elevate your self-care routine. Get unlimited AI support, deep mood analysis, and more with our flexible plans.
          </p>

          {/* Directly embed Razorpay buttons */}
          <h3 className="subscription-plans-title">🪙 Choose Your Plan</h3>
          <div className="subscription-buttons-container">
            {user && user._id ? (
              <>
                <RazorpayButton userId={user._id} plan="1month" />
                <RazorpayButton userId={user._id} plan="6months" />
                <RazorpayButton userId={user._id} plan="12months" />
              </>
            ) : (
              <p>Please log in to view subscription options.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Journal;