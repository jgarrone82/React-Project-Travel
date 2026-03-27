/**
 * Loads the Google Maps JavaScript API dynamically.
 * The API key is read from REACT_APP_GOOGLE_API_KEY environment variable.
 *
 * Usage:
 *   import { loadGoogleMapsApi } from './utils/loadGoogleMapsApi';
 *   await loadGoogleMapsApi();
 *   // window.google is now available
 */

let loadPromise = null;

export function loadGoogleMapsApi() {
  // If already loaded, return immediately
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  // If we're already loading, return the existing promise
  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return Promise.reject(
      new Error(
        'Google Maps API key not configured. ' +
        'Create a .env file with REACT_APP_GOOGLE_API_KEY=your_key_here'
      )
    );
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps API failed to initialize'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API script'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
