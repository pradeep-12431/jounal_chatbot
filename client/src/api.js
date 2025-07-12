// 📁 frontend/src/api/index.js
import axios from "axios";

const instance = axios.create({
  // ⭐ IMPORTANT: Use the environment variable for the deployed backend URL
  // This will be set on Netlify. It will be your Render backend URL.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api', // Fallback for local dev
  withCredentials: true, // Important for sending cookies/sessions (like JWT tokens)
});

export default instance;

// You can keep these here or move them to specific service files if preferred
export const loginUser = (data) => instance.post("/auth/login", data);
export const registerUser = (data) => instance.post("/auth/register", data);
// ... any other direct API calls