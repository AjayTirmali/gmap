import React, { useState } from 'react';
import axios from 'axios';
import './LocationForm.css';
import LoadingSpinner from './LoadingSpinner';

const LocationForm = ({ origin, destination, onOriginChange, onDestinationChange, onSwitch, onUseCurrentLocation, loading }) => {
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({ origin: [], destination: [] });

  // Function to geocode address using Nominatim with improved accuracy
  const geocodeAddress = async (address, searchType) => {
    try {
      setIsLoading(true);
      setError('');

      // Add country bias for better results (change 'in' to your country code if needed)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`, {
          params: {
            q: address,
            format: 'json',
            addressdetails: 1,
            limit: 5,
            countrycodes: 'in', // India country code
            'accept-language': 'en'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        // Store search results
        setSearchResults(prev => ({
          ...prev,
          [searchType]: response.data.map(location => ({
            name: location.display_name,
            coordinates: {
              lat: parseFloat(location.lat),
              lng: parseFloat(location.lon)
            },
            type: searchType
          }))
        }));

        // Return the first result
        const location = response.data[0];
        return {
          name: location.display_name,
          coordinates: {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon)
          }
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle origin form submission
  const handleOriginSubmit = async (e) => {
    e.preventDefault();
    if (!originInput.trim()) {
      setError('Please enter an origin address');
      return;
    }

    try {
      setError('');
      const location = await geocodeAddress(originInput, 'origin');
      onOriginChange(location);
      setOriginInput('');
      setSearchResults(prev => ({ ...prev, origin: [] }));
    } catch (error) {
      setError('Error finding origin location. Please try again.');
    }
  };

  // Handle destination form submission
  const handleDestinationSubmit = async (e) => {
    e.preventDefault();
    if (!destinationInput.trim()) {
      setError('Please enter a destination address');
      return;
    }

    try {
      setError('');
      const location = await geocodeAddress(destinationInput, 'destination');
      onDestinationChange(location);
      setDestinationInput('');
      setSearchResults(prev => ({ ...prev, destination: [] }));
    } catch (error) {
      setError('Error finding destination location. Please try again.');
    }
  };

  // Handle selecting a search result
  const handleSelectLocation = (location, type) => {
    if (type === 'origin') {
      onOriginChange(location);
      setOriginInput('');
    } else {
      onDestinationChange(location);
      setDestinationInput('');
    }
    setSearchResults(prev => ({ ...prev, [type]: [] }));
  };

  return (
    <div className="location-form-container">
      {isLoading && <LoadingSpinner />}
      <div className="form-group">
        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder="Enter origin address"
              className="location-input"
              disabled={isLoading}
            />
            {searchResults.origin.length > 0 && (
              <div className="search-results">
                {searchResults.origin.map((result, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleSelectLocation(result, 'origin')}
                  >
                    {result.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="button-group">
            <button 
              type="button" 
              onClick={() => onUseCurrentLocation('origin')}
              className="current-location-btn"
              disabled={isLoading}
            >
              📍 Use Current
            </button>
            <button 
              type="button" 
              onClick={handleOriginSubmit}
              className="submit-btn"
              disabled={isLoading}
            >
              Set Origin
            </button>
          </div>
        </div>
        {origin && (
          <div className="location-display">
            📍 Origin: {origin.name}
          </div>
        )}
      </div>

      <div className="form-group">
        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Enter destination address"
              className="location-input"
              disabled={isLoading}
            />
            {searchResults.destination.length > 0 && (
              <div className="search-results">
                {searchResults.destination.map((result, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleSelectLocation(result, 'destination')}
                  >
                    {result.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="button-group">
            <button 
              type="button" 
              onClick={() => onUseCurrentLocation('destination')}
              className="current-location-btn"
              disabled={isLoading}
            >
              📍 Use Current
            </button>
            <button 
              type="button" 
              onClick={handleDestinationSubmit}
              className="submit-btn"
              disabled={isLoading}
            >
              Set Destination
            </button>
          </div>
        </div>
        {destination && (
          <div className="location-display">
            📍 Destination: {destination.name}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {(origin || destination) && (
        <div className="action-buttons">
          <button 
            onClick={onSwitch}
            className="switch-btn"
            disabled={isLoading}
          >
            🔄 Switch Origin & Destination
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationForm; 