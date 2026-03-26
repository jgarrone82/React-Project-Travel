import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Reviews = ({ placeReviews }) => {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);

  const handleClick = () => {
    setMostrarComentarios(prev => !prev);
  };

  const btnName = mostrarComentarios ? 'Ocultar Comentarios' : 'Mostrar Comentarios';
  const mostrarClass = mostrarComentarios ? 'd-block' : 'd-none';

  const reviews = placeReviews?.length > 0 ? (
    placeReviews.map((review, index) => (
      <div key={index} className='row mt-2 mb-1'>
        <div className='col-2'><strong>{review.author_name}</strong></div>
        <div className='col-10'>{review.text}</div>
      </div>
    ))
  ) : (
    <div className='row mt-2 mb-1'>
      <strong>No hay comentarios</strong>
    </div>
  );

  return (
    <div className="container">
      <div className='mb-3'>
        <a 
          href='#reviews' 
          id='btnComentarios' 
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          {btnName}
        </a>
      </div>
      <div className={`container ${mostrarClass}`}>
        {reviews}
      </div>
    </div>
  );
};

Reviews.propTypes = {
  placeReviews: PropTypes.arrayOf(PropTypes.shape({
    author_name: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  }))
};

export default Reviews;
