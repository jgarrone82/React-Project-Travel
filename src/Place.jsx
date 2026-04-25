import React from 'react';
import PropTypes from 'prop-types';

const Place = ({ placeData }) => {
  const cantPhotos = Math.min(placeData.photos.length, 6) || 3;
  
  const htmlPhotos = placeData.photos.slice(0, cantPhotos).map((photo, index) => (
    <div key={index}>
      <img 
        src={photo} 
        alt={`${placeData.name} - Foto ${index + 1}`}
        loading="lazy"
      />
    </div>
  ));

  return (
    <div className="place-info-card">
      <div className="place-name">{placeData.name}</div>
      <div className="place-address">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        {placeData.address}
      </div>
      {htmlPhotos.length > 0 && (
        <div className="photo-grid">
          {htmlPhotos}
        </div>
      )}
    </div>
  );
};

Place.propTypes = {
  placeData: PropTypes.shape({
    name: PropTypes.node.isRequired,
    address: PropTypes.string.isRequired,
    photos: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default Place;
