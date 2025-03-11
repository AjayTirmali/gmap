const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gmap';

// Updated MongoDB connection without deprecated options
mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connection established successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const connection = mongoose.connection;

connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
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