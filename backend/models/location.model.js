const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const locationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        }
    },
    type: {
        type: String,
        required: true,
        enum: ['origin', 'destination']
    },
    accuracy: {
        type: Number,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location; 