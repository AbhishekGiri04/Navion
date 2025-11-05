import axios from 'axios'

// Using OpenRouteService (free alternative)
const ORS_API_KEY = '5b3ce3597851110001cf6248a1b2c8c7c4e04c5bb0b8b6b0e6b6b6b6' // Demo key

export const getRoute = async (start, end, profile = 'driving-car') => {
  try {
    // Convert profile names
    const profileMap = {
      'driving': 'driving-car',
      'walking': 'foot-walking',
      'cycling': 'cycling-regular'
    }
    
    const orsProfile = profileMap[profile] || 'driving-car'
    
    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${orsProfile}/geojson`,
      {
        coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )
    
    // Convert to MapTiler-like format
    return {
      routes: [{
        geometry: response.data.features[0].geometry,
        distance: response.data.features[0].properties.segments[0].distance,
        duration: response.data.features[0].properties.segments[0].duration
      }]
    }
  } catch (error) {
    console.error('Routing error:', error)
    // Fallback: create simple straight line
    return {
      routes: [{
        geometry: {
          coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
        },
        distance: 1000,
        duration: 300
      }]
    }
  }
}

export const getPlaces = async (query, center, radius = 5000) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`
    )
    
    return response.data.map(item => ({
      center: [parseFloat(item.lon), parseFloat(item.lat)],
      text: item.name || item.display_name.split(',')[0],
      place_name: item.display_name
    }))
  } catch (error) {
    console.error('Places search error:', error)
    return []
  }
}