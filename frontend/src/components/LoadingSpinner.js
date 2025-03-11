import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message }) => (
  <div className="loading-overlay">
    <div className="loading-spinner"></div>
    <div className="loading-message">{message || 'Getting your location...'}</div>
  </div>
);

export default LoadingSpinner; 