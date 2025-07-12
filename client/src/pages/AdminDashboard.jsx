// 📁 frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api'; // Assuming your axios instance is configured
import { useNavigate } from 'react-router-dom'; // To navigate back

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // In a real application, you would add robust admin authentication here.
  // For now, it's accessible if logged in.
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setError("Admin access requires a logged-in user.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load admin statistics. Please check server logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/journal')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
        >
          Go Back to Journal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 p-6 pb-20">
      <header className="py-8 text-center flex flex-col sm:flex-row justify-between items-center px-4">
        <button
          onClick={() => navigate('/journal')}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors mb-4 sm:mb-0"
        >
          &larr; Back to Journal
        </button>
        <h1 className="text-4xl font-bold text-gray-800 flex-grow">Admin Dashboard</h1>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </header>

      <section className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          <p className="text-sm text-blue-500">New today: {stats.newUsersToday}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-green-800">Total Journal Entries</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalJournalEntries}</p>
          <p className="text-sm text-green-500">New today: {stats.newJournalEntriesToday}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-purple-800">Total Daily Entries</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalDailyEntries}</p>
          <p className="text-sm text-purple-500">New today: {stats.newDailyEntriesToday}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-yellow-800">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.activeSubscriptions}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-red-800">Trial Subscriptions</h3>
          <p className="text-3xl font-bold text-red-600">{stats.trialSubscriptions}</p>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;