// 📁 backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');
const journalRoutes = require('./routes/journalRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
// ⭐ ADD THESE IMPORTS ⭐
const dailyEntryRoutes = require('./routes/dailyEntryRoutes'); // Assuming you have this file
const statsRoutes = require('./routes/statsRoutes');     // Assuming you have this file
const exportRoutes = require('./routes/exportRoutes'); // Assuming you have this file

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

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

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/journals', journalRoutes);

// ⭐ UPDATE OR ADD THESE LINES ⭐
app.use('/api/chat', chatbotRoutes); // Changed from /api/chatbot to /api/chat to match frontend request
app.use('/api/daily-entries', dailyEntryRoutes); // New line for daily entries
app.use('/api/stats', statsRoutes);             // New line for stats
app.use('/api/export', exportRoutes);           // New line for export

app.get('/', (req, res) => {
    res.send('Backend API is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});