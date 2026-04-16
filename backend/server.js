require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/activity', require('./routes/activity'));

// Connect Database
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/safety_monitoring';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });

// Setup background inactivity checker
const User = require('./models/User');
const Alert = require('./models/Alert');

setInterval(async () => {
  try {
    const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    const users = await User.find({ verified: true });
    
    for (let user of users) {
      if (user.lastCheck && (Date.now() - new Date(user.lastCheck).getTime() > INACTIVITY_THRESHOLD)) {
        // Check if an alert was already created recently for this user to avoid spam
        const recentAlert = await Alert.findOne({
          userId: user._id,
          type: 'Inactivity',
          createdAt: { $gt: new Date(Date.now() - INACTIVITY_THRESHOLD) }
        });

        if (!recentAlert) {
          await Alert.create({
            userId: user._id,
            type: 'Inactivity',
            message: `User has been inactive for more than 5 minutes. Last active: ${new Date(user.lastCheck).toLocaleTimeString()}`
          });
          console.log(`[ALERT] Inactivity triggered for user: ${user.email}`);
        }
      }
    }
  } catch (err) {
    console.error('Inactivity check error:', err);
  }
}, 60 * 1000); // Check every minute
