const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // ⭐ 1. ADD THIS LINE: Import the cors package
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');
const journalRoutes = require('./routes/journalRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

// ⭐ 2. UPDATED CORS CONFIGURATION BLOCK (dynamic origin)
const allowedOrigins = [
    'https://journal-chatbot-dailydairy-app.netlify.app',
    'http://localhost:5173',
  ];
  
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// ⭐ END CORS CONFIGURATION

// Middleware
app.use(express.json()); // For parsing application/json bodies

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Backend API is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});