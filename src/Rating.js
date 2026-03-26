import React from 'react';
import PropTypes from 'prop-types';
import StarRatings from 'react-star-ratings';
import 'font-awesome/css/font-awesome.css';

const Rating = ({ placeRating }) => (
  <div className='row mt-2 mb-1'>
    <div className='col-3'><strong>Rating: </strong></div>
    <div className='col-2'><strong>{placeRating}</strong></div>
    <div className='col-6'>
      <StarRatings 
        rating={placeRating} 
        starRatedColor="blue" 
        starDimension="30px" 
        numberOfStars={5} 
        name='rating' 
      />
    </div>
  </div>
);

Rating.propTypes = {
  placeRating: PropTypes.number.isRequired
};

export default Rating;
