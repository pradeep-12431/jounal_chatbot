// 📁 frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api'; // Your axios instance
import { useNavigate } from 'react-router-dom'; // For navigation

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setMessage("User not logged in.");
        setLoading(false);
        return;
      }
      try {
        // Fetch user data from backend (or use stored data if fresh enough)
        // It's good practice to fetch from backend for most up-to-date info
        const res = await axios.get(`/auth/${userId}`);
        setUsername(res.data.username);
        setEmail(res.data.email);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setMessage("Failed to load profile data.");
        // If user not found or unauthorized, redirect to login
        if (err.response && (err.response.status === 404 || err.response.status === 401)) {
          localStorage.clear();
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.put(`/auth/${userId}`, { username, email });
      setMessage(res.data.message);
      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify({ ...storedUser, username, email }));
      setLoading(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage(err.response?.data?.message || "Failed to update profile.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800 p-6 flex flex-col items-center">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-bold text-blue-800">Your Profile</h1>
        <p className="text-lg mt-2 text-gray-600">Manage your account details.</p>
      </header>

      <section className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl mb-10">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Update Profile"
            )}
          </button>
          {message && (
            <p className={`text-center text-sm mt-2 ${message.includes("Failed") || message.includes("not found") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </form>
      </section>

      <button
        onClick={() => navigate('/journal')}
        className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors mt-6"
      >
        Back to Journal
      </button>
    </div>
  );
};

export default Profile;