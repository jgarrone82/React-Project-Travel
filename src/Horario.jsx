import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Horario = ({ horarios }) => {
  const [mostrarHorario, setMostrarHorario] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setMostrarHorario(prev => !prev);
  };

  // Support both old API (weekday_text) and new API (weekdayText)
  const weekdayText = horarios?.weekday_text || horarios?.weekdayText;
  
  if (!horarios || !weekdayText) {
    return (
      <div style={{ 
        padding: '1rem', 
        background: '#f8fafc', 
        borderRadius: '8px',
        margin: '1rem 0',
        textAlign: 'center',
        color: 'var(--text-light)'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Horario no disponible
      </div>
    );
  }

  const getCurrentDayIndex = () => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // Convert to Monday=0 format
  };

  const currentDayIndex = getCurrentDayIndex();

  const horarioItems = weekdayText.map((horario, index) => {
    const isToday = index === currentDayIndex;
    return (
      <div key={index} style={{ 
        padding: '0.75rem 1rem',
        backgroundColor: isToday ? 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' : (index % 2 === 0 ? '#f8fafc' : 'transparent'),
        borderRadius: '6px',
        marginBottom: '0.25rem',
        fontWeight: isToday ? 600 : 400,
        color: isToday ? 'white' : 'var(--text-dark)',
        background: isToday ? 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' : (index % 2 === 0 ? '#f8fafc' : 'transparent')
      }}>
        {horario}
        {isToday && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>← Hoy</span>}
      </div>
    );
  });

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <button 
        onClick={handleClick}
        className="btn-secondary-custom"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: mostrarHorario ? '1rem' : '0' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {mostrarHorario ? 'Ocultar horarios' : 'Ver horarios'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ 
          transition: 'transform 0.3s ease', 
          transform: mostrarHorario ? 'rotate(180deg)' : 'none',
          marginLeft: 'auto'
        }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      
      <div style={{ 
        maxHeight: mostrarHorario ? '500px' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        opacity: mostrarHorario ? 1 : 0
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '1rem'
        }}>
          {horarioItems}
        </div>
      </div>
    </div>
  );
};

Horario.propTypes = {
  horarios: PropTypes.shape({
    weekday_text: PropTypes.arrayOf(PropTypes.string),
    weekdayText: PropTypes.arrayOf(PropTypes.string)
  })
};

export default Horario;
