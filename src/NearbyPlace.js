import React from 'react';
import PropTypes from 'prop-types';
import Rating from './Rating';

const NearbyPlace = ({ placeData, chooseDestination }) => {
  const photo = placeData.photos?.[0] && (
    <img 
      src={placeData.photos[0].getUrl()} 
      className="card-img-top" 
      alt={placeData.name} 
    />
  );

  const rating = placeData.rating && (
    <Rating placeRating={placeData.rating} />
  );

  const handleChooseDestination = (e) => {
    e.preventDefault();
    chooseDestination(placeData.name);
  };

  return (
    <div className="col mb-4">
      <div className="card">
        {photo}
        <div className="card-body">
          <h5 className="card-title">
            {placeData.name}
          </h5>
          {rating}
          <a 
            href="#destino" 
            onClick={handleChooseDestination}
            className="btn btn-primary"
          >
            Escoger como destino
          </a>
        </div>
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
