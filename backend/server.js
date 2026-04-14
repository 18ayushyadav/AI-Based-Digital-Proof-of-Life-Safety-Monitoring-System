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
