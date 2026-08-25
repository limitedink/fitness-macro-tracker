const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    console.error('Connection String:', process.env.MONGODB_URI);
    console.error('Error Details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    // Don't exit the process, just log the error
  }
};

connectDB();

// Routes
const dailyTargetsRouter = require('./routes/dailyTargets');
const mealsRouter = require('./routes/meals');

app.use('/api/daily-targets', dailyTargetsRouter);
app.use('/api/meals', mealsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 