import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import Place from './Place';
import Rating from './Rating';
import Horario from './Horario';
import NearbyPlace from './NearbyPlace';
import Reviews from './Reviews';

const App = () => {
  // State
  const [places, setPlaces] = useState(null);
  const [placeHorarios, setPlaceHorarios] = useState(null);
  const [placeRating, setPlaceRating] = useState(null);
  const [placeReviews, setPlaceReviews] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showAllNearbyPlaces, setShowAllNearbyPlaces] = useState(false);
  const [placeLocation, setPlaceLocation] = useState(null);
  const [error, setError] = useState(null);

  // Refs for Google Maps
  const mapRef = useRef(null);
  const googleRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const serviceRef = useRef(null);
  const intervalRef = useRef(null);

  // Error handling
  const handleError = useCallback((err, userMessage) => {
    console.error('Error:', err);
    setError(userMessage || 'Ha ocurrido un error. Por favor, intenta nuevamente.');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (window.google) {
        googleRef.current = window.google;
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('Load Place API');
        
        directionsServiceRef.current = new googleRef.current.maps.DirectionsService();
        directionsRendererRef.current = new googleRef.current.maps.DirectionsRenderer();
        
        const mapCenter = new googleRef.current.maps.LatLng(4.624335, -74.064644);
        mapRef.current = new googleRef.current.maps.Map(
          document.getElementById('gmapContainer'),
          { center: mapCenter, zoom: 15 }
        );

        // Initial search
        const request = {
          location: mapRef.current.getCenter(),
          radius: '500',
          query: 'Google Sydney'
        };
        const service = new googleRef.current.maps.places.PlacesService(mapRef.current);
        service.textSearch(request, (results, status) => {
          if (status === googleRef.current.maps.places.PlacesServiceStatus.OK && results[0]) {
            new googleRef.current.maps.Marker({
              map: mapRef.current,
              place: {
                placeId: results[0].place_id,
                location: results[0].geometry.location
              }
            });
          }
        });
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Show map helper
  const showMap = useCallback((mapCenter) => {
    const map = new window.google.maps.Map(
      document.getElementById('map'),
      { zoom: 15, center: mapCenter }
    );
    directionsRendererRef.current.setMap(map);
    new window.google.maps.Marker({ position: mapCenter, map });
  }, []);

  // Change destination handler
  const changeDestination = useCallback((destino) => {
    console.log(destino);
    const destInput = document.getElementById('destino');
    const btnBuscar = document.getElementById('btnBuscar');
    if (destInput && btnBuscar) {
      destInput.value = destino;
      btnBuscar.click();
    }
  }, []);

  // Find place callbacks
  const foundPlaceDetail = useCallback((place, status) => {
    if (status !== 'OK') {
      console.error('Google Places API error (getDetails):', status);
      handleError(null, 'Error al obtener detalles del lugar.');
      return;
    }

    try {
      const placePhotos = place.photos
        ? place.photos.slice(0, 3).map(p => p.getUrl({ maxWidth: 160, maxHeight: 120 }))
        : [''];

      const placeTemp = {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        photos: placePhotos
      };

      setPlaces(<Place placeData={placeTemp} />);
      setPlaceHorarios(<Horario horarios={place.opening_hours} />);
      setPlaceRating(
        place.rating
          ? <Rating placeRating={place.rating} />
          : <div key={1} className='row mt-2 mb-1 pl-3' />
      );
      setPlaceReviews(<Reviews placeReviews={place.reviews} />);
      setNearbyPlaces([]);
      setPlaceLocation(place.geometry.location);
      showMap(place.geometry.location);
    } catch (err) {
      handleError(err, 'Error al procesar la información del lugar.');
    }
  }, [handleError, showMap]);

  const findPlaceDetail = useCallback((placeIdFound) => {
    const request = {
      placeId: placeIdFound,
      fields: [
        'address_component', 'adr_address', 'alt_id', 'formatted_address', 'opening_hours',
        'icon', 'id', 'name', 'business_status', 'photo', 'place_id', 'plus_code', 'scope',
        'type', 'url', 'utc_offset_minutes', 'vicinity', 'geometry', 'rating', 'reviews'
      ]
    };
    serviceRef.current.getDetails(request, foundPlaceDetail);
  }, [foundPlaceDetail]);

  const findPlaceResult = useCallback((results, status) => {
    if (status !== 'OK') {
      const errorMessages = {
        'ZERO_RESULTS': 'No se encontraron resultados para tu búsqueda.',
        'OVER_QUERY_LIMIT': 'Límite de consultas excedido. Intenta más tarde.',
        'REQUEST_DENIED': 'Error de acceso a la API de Google Places.',
        'INVALID_REQUEST': 'Solicitud inválida.',
        'UNKNOWN_ERROR': 'Error desconocido. Intenta nuevamente.'
      };
      handleError(null, errorMessages[status] || 'Error al buscar el lugar.');
      setPlaces(null);
      setShowAllNearbyPlaces(false);
      return;
    }

    if (results.length > 0) {
      const place = results[0];
      const placeTemp = {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        photos: ['']
      };
      setPlaces(<Place placeData={placeTemp} />);
      findPlaceDetail(place.place_id);
    }
  }, [handleError, findPlaceDetail]);

  // Search nearby callback
  const callbackSearchNearby = useCallback((results, status) => {
    if (status === googleRef.current.maps.places.PlacesServiceStatus.OK) {
      if (results.length) {
        const nearbyPlacesElements = results.map((place, index) => (
          <NearbyPlace
            key={index}
            placeData={place}
            chooseDestination={changeDestination}
          />
        ));
        setNearbyPlaces(nearbyPlacesElements);
      } else {
        setNearbyPlaces([]);
      }
    } else {
      console.error('Google Places API error (nearbySearch):', status);
      const errorMessages = {
        'ZERO_RESULTS': 'No se encontraron lugares cercanos.',
        'OVER_QUERY_LIMIT': 'Límite de consultas excedido. Intenta más tarde.',
        'REQUEST_DENIED': 'Acceso denegado a la API de Google Places.',
        'INVALID_REQUEST': 'Solicitud inválida.',
        'UNKNOWN_ERROR': 'Error desconocido. Intenta nuevamente.'
      };
      handleError(null, errorMessages[status] || 'Error al buscar lugares cercanos.');
    }
  }, [changeDestination, handleError]);

  // Event handlers
  const handleSearch = useCallback(() => {
    try {
      clearError();
      const destino = document.getElementById('destino').value;
      if (!destino || destino.trim() === '') {
        handleError(null, 'Por favor, ingresa un destino para buscar.');
        return;
      }

      const request = {
        query: destino,
        fields: ['photos', 'formatted_address', 'name', 'place_id']
      };
      serviceRef.current = new googleRef.current.maps.places.PlacesService(mapRef.current);
      serviceRef.current.findPlaceFromQuery(request, findPlaceResult);
    } catch (err) {
      handleError(err, 'Error al buscar el lugar. Verifica tu conexión e intenta nuevamente.');
    }
  }, [clearError, handleError, findPlaceResult]);

  const handleNearbySearch = useCallback(() => {
    try {
      clearError();
      if (!placeLocation) {
        handleError(null, 'Primero debes buscar un lugar para encontrar lugares cercanos.');
        return;
      }

      const request = {
        location: placeLocation,
        radius: '10000'
      };
      serviceRef.current = new googleRef.current.maps.places.PlacesService(mapRef.current);
      serviceRef.current.nearbySearch(request, callbackSearchNearby);
    } catch (err) {
      handleError(err, 'Error al buscar lugares cercanos.');
    }
  }, [clearError, handleError, placeLocation, callbackSearchNearby]);

  const calcRoute = useCallback(() => {
    const start = document.getElementById('origen').value;
    const end = document.getElementById('destino').value;
    const travelMode = document.getElementById('mode').value;

    const request = {
      origin: start,
      destination: end,
      travelMode: travelMode
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
      }
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Paseando Ando</h1>
      </header>
      <main>
        <div className="principal">
          <div className="contenido">
            <h2>Te invitamos a buscar el destino de tus próximas vacaciones...</h2>
          </div>
          <div className='container border rounded p-3 mt-4' style={{ width: '50%' }}>
            {error && (
              <div className='row mb-3'>
                <div className='col-12'>
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                      type="button"
                      className="close"
                      onClick={clearError}
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className='row'>
              <div className='col-4'></div>
              <div className='col-4 text-center'>
                <label><strong>Indica el lugar</strong></label>
              </div>
              <div className='col-4'></div>
            </div>
            <div className='row'>
              <div className='col-3'></div>
              <div className='col-6 text-center py-2'>
                <input id='destino' size="40" type='text' />
              </div>
              <div className='col-3'></div>
            </div>
            <div className='row'>
              <div className='col-4'></div>
              <div className='col-4 text-center'>
                <button
                  id="btnBuscar"
                  className='btn btn-info text-center'
                  onClick={handleSearch}
                >
                  Buscar Lugar
                </button>
              </div>
              <div className='col-4'></div>
            </div>
            {places}
            {placeHorarios}
            <div className="container">
              {placeRating}
            </div>
            {placeReviews}
            {places && (
              <div className='row'>
                <div className="col-12">
                  <button
                    className="btn btn-info text-center"
                    onClick={handleNearbySearch}
                  >
                    Buscar lugares cercanos
                  </button>
                </div>
              </div>
            )}
            <div className="row row-cols-1 row-cols-md-1 mt-2">
              {showAllNearbyPlaces
                ? nearbyPlaces
                : nearbyPlaces?.slice(0, 9)
              }
            </div>
            {nearbyPlaces.length > 0 && (
              <div className="container">
                <div className="mb-3">
                  <a
                    href='#nearby'
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAllNearbyPlaces(true);
                    }}
                  >
                    Mostrar más lugares cercanos
                  </a>
                </div>
                <div className="row">
                  <div className="col">
                    <input
                      id='origen'
                      className="form-control"
                      type='text'
                      placeholder="Origen"
                    />
                  </div>
                  <div className="col">
                    <select id="mode" className="form-control">
                      <option value="DRIVING">Conducción</option>
                      <option value="WALKING">Caminando</option>
                      <option value="BICYCLING">Bicicleta</option>
                      <option value="TRANSIT">Tránsito</option>
                    </select>
                  </div>
                  <div className="col">
                    <button
                      className="btn btn-info"
                      onClick={calcRoute}
                    >
                      Ir al destino indicado
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div id='map' className='mt-2'></div>
          </div>
        </div>
      </main>
      <footer className="App-footer">
        <div>
          <h4>&copy; 2020 Jorge Ariel Garrone / Todos los derechos reservados</h4>
        </div>
      </footer>
    </div>
  );
};

export default App;
