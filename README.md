# Paseando Ando

A modern React application for discovering travel destinations worldwide, powered by the Google Maps Platform.

Search for any place on Earth, view details (photos, reviews, ratings, opening hours), explore nearby attractions, and plan your route — all in one place.

## Features

- **Place Search** — Find any location using the Places API (New) text search
- **Place Details** — View photos, ratings, reviews, and opening hours
- **Nearby Places** — Discover tourist attractions near your destination
- **Route Planning** — Calculate driving, walking, cycling, or transit routes with the Routes API
- **Interactive Map** — Dynamic Google Maps with advanced markers

## Tech Stack

- **React 18** with functional components and hooks
- **Google Maps JavaScript API** (latest):
  - Places API (New) — `Place.searchByText()`, `fetchFields()`
  - Routes API — `Route.computeRoutes()`, polylines, waypoint markers
  - Advanced Markers — `AdvancedMarkerElement`
- **Bootstrap 5** for layout
- **Font Awesome** for icons

## Getting Started

### Prerequisites

- Node.js 16+
- A Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Places API (New)
  - Routes API

### Installation

```bash
git clone https://github.com/jgarrone82/React-Project-Travel.git
cd React-Project-Travel
npm install
```

### Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Add your Google Maps API key to `.env`:

```
REACT_APP_GOOGLE_API_KEY=your_api_key_here
```

3. (Recommended) In Google Cloud Console, restrict your API key:
   - **HTTP referrers**: add your domain(s)
   - **API restrictions**: limit to Maps JavaScript API, Places API, Routes API

### Run

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── App.js                  # Main component — search, map, route planning
├── App.css                 # Design system with CSS variables
├── Place.js                # Place details card
├── NearbyPlace.js          # Nearby place card with "choose destination"
├── Rating.js               # Star rating display
├── Horario.js              # Opening hours display
├── Reviews.js              # User reviews list
└── utils/
    └── loadGoogleMapsApi.js # Dynamic Google Maps API loader
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_GOOGLE_API_KEY` | Your Google Maps Platform API key |

See `.env.example` for the template.

## Important Notes

- **API keys in client-side apps are always visible** in browser DevTools. Security comes from Google Cloud Console restrictions (HTTP referrers, API quotas), not from hiding the key.
- The app uses `DEMO_MAP_ID` for map initialization. For production, create a dedicated Map ID in Google Cloud Console.

## License

© {year} Jorge Ariel Garrone. All rights reserved.
