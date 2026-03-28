import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import Place from './Place';
import Rating from './Rating';
import Horario from './Horario';
import NearbyPlace from './NearbyPlace';
import Reviews from './Reviews';
import { loadGoogleMapsApi } from './utils/loadGoogleMapsApi';

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
  const routeMapRef = useRef(null);
  const routePolylinesRef = useRef([]);

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
    let cancelled = false;

    loadGoogleMapsApi()
      .then((maps) => {
        if (cancelled) return;

        googleRef.current = window.google;
        console.log('Google Maps API loaded');

        // Load Routes library
        googleRef.current.maps.importLibrary('routes');

        const mapCenter = new googleRef.current.maps.LatLng(4.624335, -74.064644);
        mapRef.current = new googleRef.current.maps.Map(
          document.getElementById('gmapContainer'),
          { center: mapCenter, zoom: 15, mapId: 'DEMO_MAP_ID' }
        );

        // Initial search using new Place API (searchByText)
        const initialRequest = {
          textQuery: 'Google Sydney',
          fields: ['id', 'location']
        };

        googleRef.current.maps.places.Place.searchByText(initialRequest)
          .then(({ places }) => {
            if (cancelled || !places || places.length === 0) return;
            new googleRef.current.maps.marker.AdvancedMarkerElement({
              map: mapRef.current,
              position: places[0].location,
              title: places[0].displayName || 'Google Sydney'
            });
          })
          .catch((err) => {
            console.error('Initial search error:', err);
          });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load Google Maps API:', err);
        handleError(err, err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [handleError]);

  // Show map helper
  const showMap = useCallback((mapCenter) => {
    const map = new window.google.maps.Map(
      document.getElementById('map'),
      { zoom: 15, center: mapCenter, mapId: 'DEMO_MAP_ID' }
    );
    routeMapRef.current = map;
    // Clean up previous route polylines
    routePolylinesRef.current.forEach(p => p.setMap(null));
    routePolylinesRef.current = [];
    new window.google.maps.marker.AdvancedMarkerElement({ position: mapCenter, map });
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

  // Find place callbacks - using new Place API with fetchFields()
  const foundPlaceDetail = useCallback(async (placeId) => {
    try {
      // Create Place instance and fetch fields (new API)
      const place = new googleRef.current.maps.places.Place({
        id: placeId
      });
      
      await place.fetchFields({
        fields: [
          'displayName', 'formattedAddress', 'id', 'location',
          'rating', 'reviews', 'regularOpeningHours', 'photos'
        ]
      });

      const placePhotos = place.photos
        ? place.photos.slice(0, 3).map(p => p.getURI({ maxWidth: 160, maxHeight: 120 }))
        : [''];

      const placeTemp = {
        id: place.id,
        name: place.displayName,
        address: place.formattedAddress,
        photos: placePhotos
      };

      setPlaces(<Place placeData={placeTemp} />);
      setPlaceHorarios(<Horario horarios={place.regularOpeningHours} />);
      setPlaceRating(
        place.rating
          ? <Rating placeRating={place.rating} />
          : <div key={1} className='row mt-2 mb-1 pl-3' />
      );
      setPlaceReviews(<Reviews placeReviews={place.reviews} />);
      setNearbyPlaces([]);
      setPlaceLocation(place.location);
      showMap(place.location);
    } catch (err) {
      console.error('Google Places API error (fetchFields):', err);
      handleError(err, 'Error al obtener detalles del lugar.');
    }
  }, [handleError, showMap]);

  const findPlaceResult = useCallback(async (destino) => {
    try {
      // Use new Place.searchByText() API
      const result = await googleRef.current.maps.places.Place.searchByText({
        textQuery: destino,
        fields: ['id', 'displayName', 'formattedAddress']
      });

      if (!result.places || result.places.length === 0) {
        handleError(null, 'No se encontraron resultados para tu búsqueda.');
        setPlaces(null);
        setShowAllNearbyPlaces(false);
        return;
      }

      const place = result.places[0];
      const placeTemp = {
        id: place.id,
        name: place.displayName,
        address: place.formattedAddress,
        photos: ['']
      };
      setPlaces(<Place placeData={placeTemp} />);
      foundPlaceDetail(place.id);
    } catch (err) {
      console.error('Google Places search error:', err);
      const errorMessages = {
        'INVALID_REQUEST': 'Solicitud inválida.',
        'OVER_QUERY_LIMIT': 'Límite de consultas excedido. Intenta más tarde.'
      };
      handleError(null, errorMessages[err.message] || 'Error al buscar el lugar.');
      setPlaces(null);
      setShowAllNearbyPlaces(false);
      return;
    }
  }, [handleError, foundPlaceDetail]);

  // Event handlers
  const handleSearch = useCallback(() => {
    clearError();
    const destino = document.getElementById('destino').value;
    if (!destino || destino.trim() === '') {
      handleError(null, 'Por favor, ingresa un destino para buscar.');
      return;
    }

    // Use new Place.searchByText() API - no more PlacesService needed
    findPlaceResult(destino);
  }, [clearError, handleError, findPlaceResult]);

  const handleNearbySearch = useCallback(async () => {
    try {
      clearError();
      if (!placeLocation) {
        handleError(null, 'Primero debes buscar un lugar para encontrar lugares cercanos.');
        return;
      }

      // Use new Place.searchByText() with locationBias as alternative to nearbySearch
      const result = await googleRef.current.maps.places.Place.searchByText({
        textQuery: 'lugares turísticos',
        locationBias: {
          lat: placeLocation.lat(),
          lng: placeLocation.lng()
        },
        maxResultCount: 20,
        fields: ['id', 'displayName', 'formattedAddress', 'location', 'photos', 'rating']
      });

      if (!result.places || result.places.length === 0) {
        handleError(null, 'No se encontraron lugares cercanos.');
        setNearbyPlaces([]);
        return;
      }

      const nearbyPlacesElements = result.places.map((place, index) => (
        <NearbyPlace
          key={index}
          placeData={{
            place_id: place.id,
            name: place.displayName,
            formatted_address: place.formattedAddress,
            geometry: { location: place.location },
            photos: place.photos,
            rating: place.rating
          }}
          chooseDestination={changeDestination}
        />
      ));
      setNearbyPlaces(nearbyPlacesElements);
    } catch (err) {
      console.error('Google Places nearby search error:', err);
      handleError(null, 'Error al buscar lugares cercanos.');
    }
  }, [clearError, handleError, placeLocation, changeDestination]);

  const calcRoute = useCallback(async () => {
    try {
      const start = document.getElementById('origen').value;
      const end = document.getElementById('destino').value;
      const travelMode = document.getElementById('mode').value;

      if (!start || !end) {
        handleError(null, 'Por favor, ingresa origen y destino.');
        return;
      }

      // Clean up previous polylines
      routePolylinesRef.current.forEach(p => p.setMap(null));
      routePolylinesRef.current = [];

      // Load Routes library and compute route
      const { Route } = await window.google.maps.importLibrary('routes');

      const request = {
        origin: start,
        destination: end,
        travelMode: travelMode,
        fields: ['path']
      };

      const { routes } = await Route.computeRoutes(request);

      if (!routes || routes.length === 0) {
        handleError(null, 'No se encontró una ruta disponible.');
        return;
      }

      // Create polylines and add to map
      const polylines = routes[0].createPolylines();
      polylines.forEach(polyline => polyline.setMap(routeMapRef.current));
      routePolylinesRef.current = polylines;

      // Create start/end markers
      const markers = await routes[0].createWaypointAdvancedMarkers();
      markers.forEach(marker => marker.setMap(routeMapRef.current));

      // Fit map to route path
      if (routes[0].path) {
        const bounds = new window.google.maps.LatLngBounds();
        routes[0].path.forEach(point => bounds.extend(point));
        routeMapRef.current.fitBounds(bounds);
      }
    } catch (err) {
      console.error('Routes API error:', err);
      handleError(err, 'Error al calcular la ruta.');
    }
  }, [handleError]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path>
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          Paseando Ando
        </h1>
      </header>
      <main>
        <div className="principal">
          <div className="contenido">
            <h2>Te invitamos a buscar el destino de tus próximas vacaciones...</h2>
          </div>
          
          <div className="search-container">
            {error && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="alert alert-danger" role="alert" style={{ position: 'relative', paddingRight: '2.5rem' }}>
                  {error}
                  <button
                    type="button"
                    onClick={clearError}
                    aria-label="Close"
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: 'inherit',
                      opacity: '0.6'
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                Indica el lugar que deseas visitar
              </label>
            </div>
            
            <div className="search-input-wrapper">
              <input id='destino' type='text' placeholder="Ej: Museo del Louvre, París" />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button
                id="btnBuscar"
                className="btn-primary-custom"
                onClick={handleSearch}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Buscar Lugar
              </button>
            </div>
            
            {places}
            {placeHorarios}
            {placeRating}
            {placeReviews}
            
            {places && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  className="btn-secondary-custom"
                  onClick={handleNearbySearch}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Buscar lugares cercanos
                </button>
              </div>
            )}
            
            <div className="nearby-places-grid">
              {showAllNearbyPlaces
                ? nearbyPlaces
                : nearbyPlaces?.slice(0, 9)
              }
            </div>
            
            {nearbyPlaces.length > 0 && !showAllNearbyPlaces && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a
                  href='#nearby'
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAllNearbyPlaces(true);
                  }}
                  className="show-more-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  Mostrar más lugares cercanos
                </a>
              </div>
            )}
            
            {nearbyPlaces.length > 0 && (
              <div className="route-planner">
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                  </svg>
                  Planificar ruta
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    id='origen'
                    type='text'
                    placeholder="¿Desde dónde sales?"
                    style={{
                      padding: '0.75rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  <select id="mode" style={{
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}>
                    <option value="DRIVING">🚗 Conducción</option>
                    <option value="WALKING">🚶 Caminando</option>
                    <option value="BICYCLING">🚴 Bicicleta</option>
                    <option value="TRANSIT">🚌 Transporte público</option>
                  </select>
                </div>
                <button
                  className="btn-primary-custom"
                  onClick={calcRoute}
                  style={{ width: '100%' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Calcular ruta
                </button>
              </div>
            )}
            
            <div id='map'></div>
          </div>
        </div>
      </main>
      
      <footer className="App-footer">
        <div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '0.5rem' }}>
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <h4>&copy; {new Date().getFullYear()} Jorge Ariel Garrone / Todos los derechos reservados</h4>
        </div>
      </footer>
    </div>
  );
};

export default App;
