import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Horario = ({ horarios }) => {
  const [mostrarHorario, setMostrarHorario] = useState(false);

  const handleClick = (e) => {
    if (e.target.id === 'horario') {
      setMostrarHorario(prev => !prev);
    }
  };

  if (!horarios || !horarios.weekday_text) {
    return (
      <div className='container my-2'>
        <div className='row'>
          <strong>Horario no disponible</strong>
        </div>
      </div>
    );
  }

  const horarioItems = horarios.weekday_text.map((horario, index) => (
    <div key={index} className='row'>
      {horario}
    </div>
  ));

  return (
    <div className='container my-2'>
      <div className='row'>
        <div className='col-3'>
          <a id='horario' href='#horario' onClick={handleClick}>
            Horario
          </a>
        </div>
        <div className={`col-6 ${mostrarHorario ? 'd-block' : 'd-none'}`}>
          {horarioItems}
        </div>
      </div>
    </div>
  );
};

Horario.propTypes = {
  horarios: PropTypes.shape({
    weekday_text: PropTypes.arrayOf(PropTypes.string)
  })
};

export default Horario;
