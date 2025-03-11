const express = require('express');
const router = express.Router();
const Location = require('../models/location.model');

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({
      error: 'Server Error',
      message: 'Error fetching locations from database'
    });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new location
router.post('/', async (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body is empty'
      });
    }

    const { name, coordinates, type } = req.body;

    // Validate required fields
    if (!name || !coordinates || !type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, coordinates, and type are required'
      });
    }

    // Validate coordinates
    if (!coordinates.lat || !coordinates.lng) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Both latitude and longitude are required'
      });
    }

    // Validate coordinate ranges
    if (coordinates.lat < -90 || coordinates.lat > 90) {
      return res.status(400).json({
        error: 'Invalid latitude',
        message: 'Latitude must be between -90 and 90'
      });
    }

    if (coordinates.lng < -180 || coordinates.lng > 180) {
      return res.status(400).json({
        error: 'Invalid longitude',
        message: 'Longitude must be between -180 and 180'
      });
    }

    // Create new location
    const newLocation = new Location({
      name,
      coordinates,
      type,
      accuracy: req.body.accuracy
    });

    // Save location
    const savedLocation = await newLocation.save();
    console.log('Location saved successfully:', savedLocation);
    
    res.json(savedLocation);
  } catch (err) {
    console.error('Error saving location:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server Error',
      message: 'Error saving location to database'
    });
  }
});

// Update a location
router.patch('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    if (req.body.name) location.name = req.body.name;
    if (req.body.coordinates) {
      location.coordinates.lat = req.body.coordinates.lat || location.coordinates.lat;
      location.coordinates.lng = req.body.coordinates.lng || location.coordinates.lng;
    }
    if (req.body.type) location.type = req.body.type;

    const updatedLocation = await location.save();
    res.json(updatedLocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a location
router.delete('/:id', async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json({ message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 