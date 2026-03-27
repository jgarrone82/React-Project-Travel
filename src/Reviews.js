import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Reviews = ({ placeReviews }) => {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);

  const handleClick = () => {
    setMostrarComentarios(prev => !prev);
  };

  const reviewCount = placeReviews?.length || 0;

  const reviews = placeReviews?.length > 0 ? (
    placeReviews.map((review, index) => {
      // Support both old API (author_name) and new API (authorAttribution.displayName)
      const authorName = review.author_name || 
                        (review.authorAttribution && review.authorAttribution.displayName) ||
                        (review.author && review.author.displayName) ||
                        'Usuario anónimo';
      const reviewText = review.text || review.originalText || 'Sin comentario';
      const rating = review.rating || 0;
      
      return (
        <div key={index} style={{ 
          padding: '1rem', 
          borderBottom: index < placeReviews.length - 1 ? '1px solid #e2e8f0' : 'none',
          backgroundColor: index % 2 === 0 ? '#f8fafc' : 'transparent',
          borderRadius: '8px',
          marginBottom: '0.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong style={{ color: 'var(--text-dark)', display: 'block' }}>
                {authorName}
              </strong>
              {rating > 0 && (
                <span style={{ fontSize: '0.875rem', color: '#F59E0B' }}>
                  {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
                </span>
              )}
            </div>
          </div>
          <p style={{ 
            margin: 0, 
            color: 'var(--text-light)', 
            lineHeight: '1.5',
            paddingLeft: '2.75rem'
          }}>
            {reviewText}
          </p>
        </div>
      );
    })
  ) : (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.5rem', opacity: 0.5 }}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <p>No hay comentarios disponibles</p>
    </div>
  );

  return (
    <div className="reviews-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <a 
          href='#reviews' 
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="review-toggle-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.3s ease', transform: mostrarComentarios ? 'rotate(180deg)' : 'none' }}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
          {mostrarComentarios ? 'Ocultar comentarios' : `Ver ${reviewCount} comentarios`}
        </a>
      </div>
      
      <div style={{ 
        maxHeight: mostrarComentarios ? '600px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
        opacity: mostrarComentarios ? 1 : 0
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {reviews}
        </div>
      </div>
    </div>
  );
};

Reviews.propTypes = {
  placeReviews: PropTypes.arrayOf(PropTypes.shape({
    author_name: PropTypes.string,
    text: PropTypes.string,
    rating: PropTypes.number,
    authorAttribution: PropTypes.shape({
      displayName: PropTypes.string
    }),
    author: PropTypes.shape({
      displayName: PropTypes.string
    }),
    originalText: PropTypes.string
  }))
};

export default Reviews;
