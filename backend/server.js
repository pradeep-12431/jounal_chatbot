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

// ⭐ 2. ADD THIS CORS CONFIGURATION BLOCK (Place it BEFORE app.use(express.json());)
const corsOptions = {
    // ⭐ Replace 'https://journals-chatbot-dailydiary-app.netlify.app' with your EXACT Netlify frontend URL
    // And keep 'http://localhost:5173' if that's where you run your local frontend for testing.
    origin: ['https://journals-chatbot-dailydiary-app.netlify.app', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // IMPORTANT: Allows cookies, authorization headers, etc.
    optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 200
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