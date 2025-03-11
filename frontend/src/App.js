import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Map from './components/Map';
import LocationForm from './components/LocationForm';
import './App.css';

function App() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSelection, setActiveSelection] = useState(null);

  // API base URL
  const API_URL = 'http://localhost:5000/api';

  // Save location to database
  const saveLocation = useCallback(async (location) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/locations`, location);
      return response.data;
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Error saving location. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Handle origin change
  const handleOriginChange = useCallback(async (newOrigin) => {
    const savedOrigin = await saveLocation({
      ...newOrigin,
      type: 'origin'
    });
    if (savedOrigin) {
      setOrigin(savedOrigin);
    }
  }, [saveLocation]);

  // Handle destination change
  const handleDestinationChange = useCallback(async (newDestination) => {
    const savedDestination = await saveLocation({
      ...newDestination,
      type: 'destination'
    });
    if (savedDestination) {
      setDestination(savedDestination);
    }
  }, [saveLocation]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );

            resolve({
              name: response.data.display_name,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
          } catch (error) {
            resolve({
              name: `Location (${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)})`,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
          }
        },
        (error) => {
          reject(new Error('Error getting current location: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Handle using current location
  const handleUseCurrentLocation = useCallback(async (type) => {
    try {
      setLoading(true);
      setError(null);
      const location = await getCurrentLocation();
      if (type === 'origin') {
        await handleOriginChange(location);
      } else {
        await handleDestinationChange(location);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getCurrentLocation, handleOriginChange, handleDestinationChange]);

  // Handle map click
  const handleMapClick = useCallback(async (e) => {
    if (activeSelection) {
      const { lat, lng } = e.latlng;
      const location = {
        name: `Selected ${activeSelection} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        coordinates: { lat, lng }
      };

      if (activeSelection === 'origin') {
        await handleOriginChange(location);
      } else if (activeSelection === 'destination') {
        await handleDestinationChange(location);
      }

      setActiveSelection(null);
    }
  }, [activeSelection, handleOriginChange, handleDestinationChange]);

  // Handle switch between origin and destination
  const handleSwitch = useCallback(() => {
    if (origin && destination) {
      setOrigin(destination);
      setDestination(origin);
    }
  }, [origin, destination]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-Time Location Map</h1>
      </header>
      <main className="App-main">
        <div className="container">
          <LocationForm 
            origin={origin}
            destination={destination}
            onOriginChange={handleOriginChange}
            onDestinationChange={handleDestinationChange}
            onSwitch={handleSwitch}
            onUseCurrentLocation={handleUseCurrentLocation}
            loading={loading}
          />
          
          <div className="map-controls">
            <div className="selection-mode">
              <p>Click mode:</p>
              <div className="button-group">
                <button 
                  onClick={() => setActiveSelection('origin')} 
                  className={`mode-btn ${activeSelection === 'origin' ? 'active' : ''}`}
                  disabled={loading}
                >
                  Set Origin
                </button>
                <button 
                  onClick={() => setActiveSelection('destination')} 
                  className={`mode-btn ${activeSelection === 'destination' ? 'active' : ''}`}
                  disabled={loading}
                >
                  Set Destination
                </button>
                <button 
                  onClick={() => setActiveSelection(null)} 
                  className={`mode-btn ${activeSelection === null ? 'active' : ''}`}
                  disabled={loading}
                >
                  Pan Mode
                </button>
              </div>
              {activeSelection && (
                <p className="selection-hint">
                  Click on the map to set the {activeSelection} location
                </p>
              )}
            </div>
          </div>
          
          {error && (
            <div className="error-container">
              <div className="error-message">{error}</div>
            </div>
          )}
          
          <div className="map-container">
            {loading ? (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            ) : (
              <Map 
                origin={origin}
                destination={destination}
                onMapClick={handleMapClick}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 