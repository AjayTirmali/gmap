import React, { useEffect, useState, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  useMapEvents, 
  Polyline,
  Circle,
  Tooltip
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import './Map.css';

// Fix for default marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for origin and destination
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Add a new icon for current location
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Function to calculate road distance using OSRM
async function calculateRoadDistance(origin, destination) {
  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full`
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.distance / 1000,
        duration: route.duration / 60,
        geometry: route.geometry
      };
    }
    return null;
  } catch (error) {
    console.error('Error calculating road distance:', error);
    return null;
  }
}

// Function to decode polyline
function decodePolyline(str, precision = 5) {
  var index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision);

  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

// Component to update map view when coordinates change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e);
      }
    },
  });
  return null;
}

const Map = ({ origin, destination, currentLocation, onMapClick }) => {
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default to center of India
  const [zoom, setZoom] = useState(5); // Default zoom level for India
  const [routeInfo, setRouteInfo] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  // Memoize functions to prevent unnecessary re-renders
  const getCenterPoint = useCallback(() => {
    if (origin?.coordinates && destination?.coordinates) {
      const lat = (origin.coordinates.lat + destination.coordinates.lat) / 2;
      const lng = (origin.coordinates.lng + destination.coordinates.lng) / 2;
      return [lat, lng];
    }
    return center;
  }, [origin?.coordinates, destination?.coordinates, center]);

  const getZoomLevel = useCallback((distance) => {
    if (distance) {
      if (distance > 1000) return 5;
      if (distance > 500) return 6;
      if (distance > 200) return 7;
      if (distance > 100) return 8;
      if (distance > 50) return 9;
      if (distance > 20) return 10;
      if (distance > 10) return 11;
      return 12;
    }
    return zoom;
  }, [zoom]);

  // Effect for calculating route and distance
  useEffect(() => {
    async function calculateRoute() {
      if (origin?.coordinates && destination?.coordinates) {
        const routeData = await calculateRoadDistance(
          origin.coordinates,
          destination.coordinates
        );
        
        if (routeData) {
          setRouteInfo({
            distance: routeData.distance,
            duration: routeData.duration
          });
          
          const decodedPath = decodePolyline(routeData.geometry);
          setRoutePath(decodedPath);

          // Update map view based on route
          const newCenter = getCenterPoint();
          const newZoom = getZoomLevel(routeData.distance);
          setCenter(newCenter);
          setZoom(newZoom);
        }
      } else {
        setRouteInfo(null);
        setRoutePath([]);
        // Reset to default center and zoom when no route
        setCenter([20.5937, 78.9629]);
        setZoom(5);
      }
    }

    calculateRoute();
  }, [origin?.coordinates, destination?.coordinates, getCenterPoint, getZoomLevel]);

  return (
    <div className="map-wrapper">
      <div className="map-container">
        {routeInfo && (
          <div className="route-info-panel">
            <div className="route-info-header">
              Route Information
            </div>
            <div className="route-info-content">
              <div className="info-item">
                <div className="info-icon distance-icon">D</div>
                <div className="info-text">
                  <strong>Distance:</strong> {routeInfo.distance.toFixed(1)} km
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon time-icon">T</div>
                <div className="info-text">
                  <strong>Estimated Drive Time:</strong> {Math.round(routeInfo.duration)} minutes
                </div>
              </div>
              <div className="route-actions">
                <a 
                  href={`https://www.google.com/maps/dir/${origin.coordinates.lat},${origin.coordinates.lng}/${destination.coordinates.lat},${destination.coordinates.lng}/data=!3m1!4b1!4m2!4m1!3e0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button driving"
                >
                  🚗 Get Driving Directions
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/${origin.coordinates.lat},${origin.coordinates.lng}/${destination.coordinates.lat},${destination.coordinates.lng}/data=!3m1!4b1!4m2!4m1!3e6`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button transit"
                >
                  🚌 Get Transit Directions
                </a>
              </div>
            </div>
          </div>
        )}
        
        <MapContainer 
          center={center} 
          zoom={zoom} 
          className="map"
          scrollWheelZoom={true}
          doubleClickZoom={true}
          attributionControl={false}
        >
          <ChangeView center={center} zoom={zoom} />
          <MapClickHandler onMapClick={onMapClick} />
          
          {/* Base map layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route path */}
          {routePath.length > 0 && (
            <Polyline
              positions={routePath}
              color="#2196F3"
              weight={4}
              opacity={0.8}
            >
              <Tooltip sticky>
                Distance: {routeInfo?.distance.toFixed(1)} km<br />
                Time: {Math.round(routeInfo?.duration)} min
              </Tooltip>
            </Polyline>
          )}
          
          {/* Origin marker with circle */}
          {origin && origin.coordinates && (
            <>
              <Marker 
                position={[origin.coordinates.lat, origin.coordinates.lng]}
                icon={origin === currentLocation ? currentLocationIcon : originIcon}
              >
                <Popup>
                  <div>
                    <h3>Origin</h3>
                    <p><strong>Name:</strong> {origin.name}</p>
                    {origin.displayName && (
                      <p><strong>Address:</strong> {origin.displayName}</p>
                    )}
                    {origin.address && (
                      <p>
                        <strong>Details:</strong><br />
                        {origin.address.city && `City: ${origin.address.city}`}<br />
                        {origin.address.district && `District: ${origin.address.district}`}<br />
                        {origin.address.state && `State: ${origin.address.state}`}
                      </p>
                    )}
                  </div>
                </Popup>
                <Tooltip direction="bottom" offset={[0, 20]} permanent>
                  Origin: {origin.name}
                </Tooltip>
              </Marker>
              <Circle
                center={[origin.coordinates.lat, origin.coordinates.lng]}
                radius={500}
                pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.2 }}
              />
            </>
          )}

          {/* Destination marker with circle */}
          {destination && destination.coordinates && (
            <>
              <Marker 
                position={[destination.coordinates.lat, destination.coordinates.lng]}
                icon={destination === currentLocation ? currentLocationIcon : destinationIcon}
              >
                <Popup>
                  <div>
                    <h3>Destination</h3>
                    <p><strong>Name:</strong> {destination.name}</p>
                    {destination.displayName && (
                      <p><strong>Address:</strong> {destination.displayName}</p>
                    )}
                    {destination.address && (
                      <p>
                        <strong>Details:</strong><br />
                        {destination.address.city && `City: ${destination.address.city}`}<br />
                        {destination.address.district && `District: ${destination.address.district}`}<br />
                        {destination.address.state && `State: ${destination.address.state}`}
                      </p>
                    )}
                  </div>
                </Popup>
                <Tooltip direction="bottom" offset={[0, 20]} permanent>
                  Destination: {destination.name}
                </Tooltip>
              </Marker>
              <Circle
                center={[destination.coordinates.lat, destination.coordinates.lng]}
                radius={500}
                pathOptions={{ color: '#f44336', fillColor: '#f44336', fillOpacity: 0.2 }}
              />
            </>
          )}
        </MapContainer>
      </div>
      
      <footer className="map-footer">
        <div className="footer-content">
          <div className="footer-title">
            Interactive Location Mapping System
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Map; 