const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection with better error handling
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gmap';

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connection established successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Monitor DB connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
const locationsRouter = require('./routes/locations');
app.use('/api/locations', locationsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 