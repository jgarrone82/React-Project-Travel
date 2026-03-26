import React from 'react';
import PropTypes from 'prop-types';

const Place = ({ placeData }) => {
  const cantPhotos = Math.min(placeData.photos.length, 6) || 3;
  const colSize = 4;
  
  const htmlPhotos = placeData.photos.slice(0, cantPhotos).map((photo, index) => (
    <div key={index} className={`col-${colSize} text-center`}>
      <img src={photo} alt={placeData.name} />
    </div>
  ));

  return (
    <div>
      <div className='row py-2'>
        <div className='col-12 text-center'>{placeData.name}</div>
      </div>
      <div className='row py-2'>
        {htmlPhotos.slice(0, 3)}
      </div>
      <div className='row py-2'>
        {htmlPhotos.slice(3, 6)}
      </div>
      <div className='row'>
        <div className='col-2'></div>
        <div className='col-8'>{placeData.address}</div>
        <div className='col-2'></div>
      </div>
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
