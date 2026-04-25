import React from 'react';
import PropTypes from 'prop-types';
import Rating from './Rating';

const NearbyPlace = ({ placeData, chooseDestination }) => {
  const photo = placeData.photos?.[0] && (
    <img 
      src={placeData.photos[0].getURI ? placeData.photos[0].getURI() : placeData.photos[0]} 
      alt={placeData.name}
      loading="lazy"
    />
  );

  const rating = placeData.rating && (
    <div style={{ marginBottom: '1rem' }}>
      <Rating placeRating={placeData.rating} />
    </div>
  );

  const handleChooseDestination = (e) => {
    e.preventDefault();
    chooseDestination(placeData.name);
  };

  return (
    <div className="nearby-card">
      {photo}
      <div className="card-body">
        <h5 className="card-title">
          {placeData.name}
        </h5>
        {rating}
        <button 
          onClick={handleChooseDestination}
          className="btn-secondary-custom"
          style={{ width: '100%' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Elegir destino
        </button>
      </div>
    </div>
  );
};

NearbyPlace.propTypes = {
  placeData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    photos: PropTypes.array,
    rating: PropTypes.number
  }).isRequired,
  chooseDestination: PropTypes.func.isRequired
};

export default NearbyPlace;
