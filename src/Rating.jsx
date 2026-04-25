import React from 'react';
import PropTypes from 'prop-types';
import StarRatings from 'react-star-ratings';

const Rating = ({ placeRating }) => (
  <div className="rating-container">
    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--primary-color)' }}>
      {placeRating}
    </div>
    <div>
      <StarRatings 
        rating={placeRating} 
        starRatedColor="#F59E0B" 
        starEmptyColor="#e2e8f0"
        starDimension="28px" 
        starSpacing="2px"
        numberOfStars={5} 
        name='rating' 
      />
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
      {placeRating >= 4.5 ? 'Excelente' : placeRating >= 4 ? 'Muy bueno' : placeRating >= 3 ? 'Bueno' : 'Regular'}
    </div>
  </div>
);

Rating.propTypes = {
  placeRating: PropTypes.number.isRequired
};

export default Rating;
