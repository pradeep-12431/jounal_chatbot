// 📁 backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const history = require('connect-history-api-fallback');

// Import your route files
const subscribeRoutes = require("./routes/subscribeRoutes");
const journalRoutes = require("./routes/journalRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dailyEntryRoutes = require("./routes/dailyEntryRoutes");
const exportRoutes = require("./routes/exportRoutes");
const statsRoutes = require("./routes/statsRoutes");

dotenv.config(); // Load environment variables from .env if running locally
const app = express();

// ⭐ IMPORTANT CORS CONFIGURATION FOR DEPLOYMENT ⭐
// Get the frontend URL from environment variables for production, fallback to localhost for development
const frontendUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL // This will be your Netlify URL (e.g., https://your-app.netlify.app)
    : 'http://localhost:3000'; // Your local React dev server

const corsOptions = {
  origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:5050'], // Allow your deployed frontend and local dev
  credentials: true, // Allow cookies/headers to be sent
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// ⭐ END CORS CONFIGURATION ⭐

app.use(express.json());

// --- API Routes ---
app.use("/api/journals", journalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notify", notificationRoutes);
app.use("/api/chat", chatbotRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/daily-entries", dailyEntryRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/stats", statsRoutes);

app.get("/ping", (req, res) => {
  res.send("pong");
});

// --- Serve React Static Files and Handle Frontend Routes ---
const reactBuildPath = path.join(__dirname, '..', 'frontend', 'build');
console.log(`[Server Setup] Attempting to serve static files from: ${reactBuildPath}`);

if (process.env.NODE_ENV === 'production') {
  app.use(history({
    // verbose: true
  }));
  app.use(express.static(reactBuildPath));
  console.log(`[Server Setup] express.static middleware for ${reactBuildPath} active.`);
} else {
  console.log("[Server Setup] Not in production mode. Static file serving and catch-all route are disabled.");
  console.log("To enable, set NODE_ENV=production when starting the server.");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5050, () => // ⭐ Use process.env.PORT or fallback to 5050
      console.log(`✅ Server running on port ${process.env.PORT || 5050}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));