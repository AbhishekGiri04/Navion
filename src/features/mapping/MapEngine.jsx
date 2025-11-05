import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../../shared/styles/leaflet-custom.css'
import NavigationControls from '../../shared/ui/NavigationControls'
import ThemeSelector from '../../shared/ui/ThemeSelector'
import VoiceAssistant from '../assistant/VoiceAssistant'
import ARNavigationView from '../augmented-reality/ARNavigationView'
import SocialFeed from '../social-network/SocialFeed'
import TrafficOverlay from '../../shared/ui/TrafficOverlay'
import RouteRenderer from '../../shared/ui/RouteRenderer'
import WeatherPanel from '../../shared/ui/WeatherPanel'
import LocationSearch from '../../shared/ui/LocationSearch'
import { getRoute } from '../../shared/services/routing.service'
import { DijkstraPathfinder } from '../../shared/services/pathfinding.service'
// import SearchBarMapTiler from '../ui/SearchBarMapTiler'
// import SidePanel from '../ui/SidePanel'
// import FloatingControls from '../ui/FloatingControls'
// import AIAssistant from '../ai/AIAssistant'
// import ARView from '../ar/ARView'
// import SocialLayer from '../social/SocialLayer'
// import ThemeSelector from '../ui/ThemeSelector'
// import RouteLayer from '../ui/RouteLayer'
// import WeatherLayer from '../ui/WeatherLayer'
// import TrafficLayer from '../ui/TrafficLayer'
// import { getRoute } from '../../utils/mapTilerRouting'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapEngine = ({ userLocation }) => {
  const [map, setMap] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [currentTheme, setCurrentTheme] = useState('streets')
  const [markers, setMarkers] = useState([])
  const [routeData, setRouteData] = useState(null)
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)
  const [routeMode, setRouteMode] = useState('driving')
  const [showAR, setShowAR] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [showTraffic, setShowTraffic] = useState(false)
  const [showRouteInfo, setShowRouteInfo] = useState(false)
  const [routeDetails, setRouteDetails] = useState(null)
  const [pathfinder] = useState(new DijkstraPathfinder())
  const [routePath, setRoutePath] = useState(null)
  const [multipleRoutes, setMultipleRoutes] = useState([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [currentRouteType, setCurrentRouteType] = useState('fastest')
  const [activeTab, setActiveTab] = useState('trending')
  const [newPost, setNewPost] = useState('')
  const [friends, setFriends] = useState([
    { id: 1, name: 'Emma Wilson', status: 'At Pier 39', distance: '0.5 mi', online: true, avatar: 'E' },
    { id: 2, name: 'David Park', status: 'Driving to Oakland', distance: '2.1 mi', online: true, avatar: 'D' },
    { id: 3, name: 'Lisa Zhang', status: 'Offline', distance: '5.2 mi', online: false, avatar: 'L' },
    { id: 4, name: 'Mike Chen', status: 'At Coffee Shop', distance: '1.2 mi', online: true, avatar: 'M' },
    { id: 5, name: 'Anna Smith', status: 'Working from home', distance: '3.8 mi', online: false, avatar: 'A' }
  ])
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: { name: 'Alex Chen', avatar: 'A' },
      location: 'Golden Gate Bridge, SF',
      text: 'Amazing sunset view from the bridge! Perfect spot for photos and memories.',
      likes: 24,
      comments: 8,
      timestamp: '2 hours ago',
      type: 'photo'
    },
    {
      id: 2,
      user: { name: 'Sarah Kim', avatar: 'S' },
      location: 'Blue Bottle Coffee, Mission',
      text: 'Hidden gem in the Mission district! The best coffee I\'ve had in SF.',
      likes: 12,
      comments: 3,
      timestamp: '4 hours ago',
      type: 'review',
      rating: 5
    }
  ])

  const mapStyles = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    ocean: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    vintage: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
    cyberpunk: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    winter: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  }

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const clickedPos = { lat: e.latlng.lat, lng: e.latlng.lng }
        
        if (!startPoint) {
          setStartPoint(clickedPos)
          const newMarker = {
            id: 'start',
            position: [e.latlng.lat, e.latlng.lng],
            title: 'Start Point',
            type: 'start'
          }
          setMarkers([newMarker])
        } else if (!endPoint) {
          setEndPoint(clickedPos)
          const newMarker = {
            id: 'end',
            position: [e.latlng.lat, e.latlng.lng],
            title: 'End Point',
            type: 'end'
          }
          setMarkers(prev => [...prev, newMarker])
          
          // Calculate real road route
          console.log('🗺️ Getting real road route from:', startPoint, 'to:', clickedPos)
          
          // Show loading state
          setRouteDetails({
            distance: 'Getting route...',
            duration: 'Please wait',
            weather: '22°C Clear',
            traffic: 'Finding roads...',
            startLocation: `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}`,
            endLocation: `${clickedPos.lat.toFixed(4)}, ${clickedPos.lng.toFixed(4)}`
          })
          setShowRouteInfo(true)
          
          // Get real road routes with current vehicle mode
          pathfinder.getRealRoute(startPoint, clickedPos, routeMode)
            .then(route => {
              console.log('🛣️ Real route received:', route)
              
              if (route && route.path && route.path.length > 0) {
                console.log('✅ Setting real route with', route.path.length, 'points')
                
                // Recalculate time with current vehicle mode
                const recalculatedTime = pathfinder.calculateTravelTime(route.path, route.distance, routeMode);
                
                setRoutePath(route.path)
                setRouteDetails({
                  distance: route.distanceText,
                  duration: `${recalculatedTime} min`,
                  weather: '22°C Clear',
                  traffic: route.isRealRoute ? `Real roads (${route.source})` : 'Road-following',
                  actualDistance: route.distance,
                  routeType: route.type || 'Route',
                  vehicle: routeMode === 'driving' ? '🚗' : routeMode === 'walking' ? '🚶' : routeMode === 'cycling' ? '🚴' : '🚌',
                  startLocation: route.startLocation,
                  endLocation: route.endLocation
                })
                
                // Also try to get alternatives with current vehicle mode
                pathfinder.getMultipleRoutes(startPoint, clickedPos, routeMode)
                  .then(routes => {
                    if (routes && routes.length > 1) {
                      console.log('🔄 Got', routes.length, 'route alternatives')
                      // Recalculate all route times with current vehicle mode
                      const updatedRoutes = routes.map(r => ({
                        ...r,
                        duration: pathfinder.calculateTravelTime(r.path, r.distance, routeMode),
                        durationText: `${pathfinder.calculateTravelTime(r.path, r.distance, routeMode)} min`,
                        vehicle: routeMode === 'driving' ? '🚗' : routeMode === 'walking' ? '🚶' : routeMode === 'cycling' ? '🚴' : '🚌'
                      }));
                      setMultipleRoutes(updatedRoutes)
                      setSelectedRouteIndex(0)
                    }
                  })
                  .catch(err => console.log('Alternatives failed:', err))
              } else {
                console.log('⚠️ No valid route, using fallback')
                const fallback = pathfinder.getDirectPath(startPoint, clickedPos)
                setRoutePath(fallback.path)
                setRouteDetails({
                  distance: fallback.distanceText,
                  duration: fallback.durationText,
                  weather: '22°C Clear',
                  traffic: 'Direct path',
                  actualDistance: fallback.distance,
                  routeType: 'Direct',
                  vehicle: '🚗'
                })
              }
            })
            .catch(error => {
              console.error('❌ Route API failed:', error)
              const fallback = pathfinder.getDirectPath(startPoint, clickedPos)
              setRoutePath(fallback.path)
              setRouteDetails({
                distance: fallback.distanceText,
                duration: fallback.durationText,
                weather: '22°C Clear',
                traffic: 'Offline mode',
                actualDistance: fallback.distance,
                routeType: 'Emergency'
              })
            })
        } else {
          // Reset everything - clear all points and route
          setStartPoint(null)
          setEndPoint(null)
          setRouteData(null)
          setRouteDetails(null)
          setShowRouteInfo(false)
          setMarkers([])
          setRoutePath(null)
          setMultipleRoutes([])
          setSelectedRouteIndex(0)
        }
      }
    })
    return null
  }

  const handleLocationSelect = (location) => {
    console.log('handleLocationSelect called with:', location)
    setSelectedLocation([location.lat, location.lng])
    if (map) {
      // Direct zoom to location with high zoom level
      map.setView([location.lat, location.lng], 16)
      
      // Add marker at searched location
      const locationMarker = {
        id: `search-${Date.now()}-${Math.random()}`,
        position: [location.lat, location.lng],
        title: location.name ? location.name.split(',')[0] : 'Searched Location',
        name: location.name,
        type: location.category || 'search',
        category: location.category,
        rating: location.rating,
        distance: location.distance
      }
      console.log('Creating marker:', locationMarker)
      setMarkers(prev => {
        const newMarkers = [...prev, locationMarker]
        console.log('Updated markers:', newMarkers)
        return newMarkers
      })
    } else {
      console.log('Map not available')
    }
  }

  const handleRouteMode = (mode) => {
    setRouteMode(mode)
    if (startPoint && endPoint) {
      // Recalculate routes with new mode
      if (multipleRoutes.length > 0) {
        const selectedRoute = multipleRoutes[selectedRouteIndex] || multipleRoutes[0]
        setRoutePath(selectedRoute.path)
        setRouteDetails({
          distance: selectedRoute.distanceText,
          duration: selectedRoute.durationText,
          weather: '22°C Clear',
          traffic: 'Real-time',
          actualDistance: selectedRoute.distance,
          routeType: selectedRoute.type
        })
      } else {
        // Fallback calculation
        const directRoute = pathfinder.getDirectPath(startPoint, endPoint)
        setRoutePath(directRoute.path)
        setRouteDetails({
          distance: directRoute.distanceText,
          duration: directRoute.durationText,
          weather: '22°C Clear',
          traffic: 'Direct',
          actualDistance: directRoute.distance,
          routeType: 'Direct Path'
        })
      }
    }
  }

  const handleVoiceCommand = (command) => {
    console.log('Voice command:', command)
    // Process voice commands here
  }
  
  const handleRouteTypeChange = (routeType) => {
    console.log('🛣️ Route type changed to:', routeType)
    setCurrentRouteType(routeType)
    
    // If we have existing routes, recalculate based on route type
    if (startPoint && endPoint && multipleRoutes.length > 0) {
      // Apply route type logic
      let selectedRoute;
      
      switch(routeType) {
        case 'fastest':
          // Select the route with shortest time
          selectedRoute = multipleRoutes.reduce((fastest, current) => 
            current.duration < fastest.duration ? current : fastest
          )
          break;
        case 'eco':
          // Select the route with shortest distance (most eco-friendly)
          selectedRoute = multipleRoutes.reduce((shortest, current) => 
            current.distance < shortest.distance ? current : shortest
          )
          break;
        case 'scenic':
          // Select the longest route (most scenic)
          selectedRoute = multipleRoutes.reduce((longest, current) => 
            current.distance > longest.distance ? current : longest
          )
          break;
        default:
          selectedRoute = multipleRoutes[0]
      }
      
      // Update the selected route
      const routeIndex = multipleRoutes.findIndex(r => r === selectedRoute)
      setSelectedRouteIndex(routeIndex >= 0 ? routeIndex : 0)
      setRoutePath(selectedRoute.path)
      setRouteDetails({
        distance: selectedRoute.distanceText,
        duration: selectedRoute.durationText,
        weather: '22°C Clear',
        traffic: selectedRoute.isRealRoute ? 'Real-time' : 'Estimated',
        actualDistance: selectedRoute.distance,
        routeType: `${selectedRoute.type} (${routeType})`,
        vehicle: selectedRoute.vehicle || '🚗'
      })
      
      console.log(`✨ Applied ${routeType} route:`, selectedRoute.distanceText, selectedRoute.durationText)
    }
  }



  const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  const getCategoryIcon = (category) => {
    const icons = {
      restaurant: '🍽️',
      cafe: '☕',
      gas: '⛽',
      hospital: '🏥',
      gym: '🏋️',
      bank: '🏦',
      shopping: '🛍️',
      school: '🏫',
      ev: '🔌'
    }
    return icons[category] || '📍'
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Advanced Search Bar */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-4 right-4 z-[1000] flex justify-center"
      >

        
        <LocationSearch 
          onLocationSelect={handleLocationSelect}
          onRouteSearch={(query) => console.log('Route search:', query)}
          userLocation={userLocation}
          onRouteCreate={(start, destination) => {
            // Set start point as current location
            setStartPoint(start)
            setEndPoint({ lat: destination.lat, lng: destination.lng })
            
            // Clear existing markers and add new ones
            const startMarker = {
              id: 'start',
              position: [start.lat, start.lng],
              title: 'Start Point',
              type: 'start'
            }
            const endMarker = {
              id: 'end', 
              position: [destination.lat, destination.lng],
              title: destination.name.split(',')[0],
              type: 'end'
            }
            setMarkers([startMarker, endMarker])
            
            // Show loading state
            setRouteDetails({
              distance: 'Getting route...',
              duration: 'Please wait',
              weather: '22°C Clear',
              traffic: 'Finding roads...',
              startLocation: `${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}`,
              endLocation: destination.name.split(',')[0]
            })
            setShowRouteInfo(true)
            
            // Get route
            pathfinder.getRealRoute(start, { lat: destination.lat, lng: destination.lng }, routeMode)
              .then(route => {
                if (route && route.path && route.path.length > 0) {
                  const recalculatedTime = pathfinder.calculateTravelTime(route.path, route.distance, routeMode)
                  setRoutePath(route.path)
                  setRouteDetails({
                    distance: route.distanceText,
                    duration: `${recalculatedTime} min`,
                    weather: '22°C Clear',
                    traffic: route.isRealRoute ? `Real roads (${route.source})` : 'Road-following',
                    actualDistance: route.distance,
                    routeType: route.type || 'Route',
                    vehicle: routeMode === 'driving' ? '🚗' : routeMode === 'walking' ? '🚶' : routeMode === 'cycling' ? '🚴' : '🚌',
                    startLocation: 'Current Location',
                    endLocation: destination.name.split(',')[0]
                  })
                  
                  // Auto-zoom to fit route
                  if (map) {
                    const bounds = [[start.lat, start.lng], [destination.lat, destination.lng]]
                    map.fitBounds(bounds, { padding: [50, 50] })
                  }
                  
                  // Get multiple routes
                  pathfinder.getMultipleRoutes(start, { lat: destination.lat, lng: destination.lng }, routeMode)
                    .then(routes => {
                      if (routes && routes.length > 1) {
                        const updatedRoutes = routes.map(r => ({
                          ...r,
                          duration: pathfinder.calculateTravelTime(r.path, r.distance, routeMode),
                          durationText: `${pathfinder.calculateTravelTime(r.path, r.distance, routeMode)} min`,
                          vehicle: routeMode === 'driving' ? '🚗' : routeMode === 'walking' ? '🚶' : routeMode === 'cycling' ? '🚴' : '🚌'
                        }))
                        setMultipleRoutes(updatedRoutes)
                        setSelectedRouteIndex(0)
                      }
                    })
                    .catch(err => console.log('Alternatives failed:', err))
                } else {
                  const fallback = pathfinder.getDirectPath(start, { lat: destination.lat, lng: destination.lng })
                  setRoutePath(fallback.path)
                  setRouteDetails({
                    distance: fallback.distanceText,
                    duration: fallback.durationText,
                    weather: '22°C Clear',
                    traffic: 'Direct path',
                    actualDistance: fallback.distance,
                    routeType: 'Direct',
                    vehicle: '🚗'
                  })
                  
                  // Auto-zoom to fit route
                  if (map) {
                    const bounds = [[start.lat, start.lng], [destination.lat, destination.lng]]
                    map.fitBounds(bounds, { padding: [50, 50] })
                  }
                }
              })
              .catch(error => {
                console.error('Route API failed:', error)
                const fallback = pathfinder.getDirectPath(start, { lat: destination.lat, lng: destination.lng })
                setRoutePath(fallback.path)
                setRouteDetails({
                  distance: fallback.distanceText,
                  duration: fallback.durationText,
                  weather: '22°C Clear',
                  traffic: 'Offline mode',
                  actualDistance: fallback.distance,
                  routeType: 'Emergency'
                })
                
                // Auto-zoom to fit route
                if (map) {
                  const bounds = [[start.lat, start.lng], [destination.lat, destination.lng]]
                  map.fitBounds(bounds, { padding: [50, 50] })
                }
              })
          }}
        />
      </motion.div>

      {/* Smart Controls */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute top-20 right-4 z-[1000]"
      >
        <NavigationControls
          onRouteMode={handleRouteMode}
          onARToggle={() => setShowAR(!showAR)}
          onSocialToggle={() => setShowSocial(!showSocial)}
          onWeatherToggle={() => setShowWeather(!showWeather)}
          onTrafficToggle={() => setShowTraffic(!showTraffic)}
          onRouteTypeChange={handleRouteTypeChange}
          currentMode={routeMode}
          currentRouteType={currentRouteType}
        />
      </motion.div>

      {/* Theme Mood Selector */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-4 right-4 z-[1000]"
      >
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
        />
      </motion.div>





      {/* Social Layer - Professional Modern UI */}
      <AnimatePresence>
        {showSocial && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-[1001] flex flex-col border-l border-gray-200"
          >
            {/* Modern Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-lg">Navion Social</h2>
                  <p className="text-xs text-blue-100">Discover & Share Places</p>
                </div>
              </div>
              <button
                onClick={() => setShowSocial(false)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Functional Tabs */}
            <div className="flex bg-gray-50">
              <button 
                onClick={() => setActiveTab('trending')}
                className={`flex-1 py-3 px-2 text-sm transition-colors ${
                  activeTab === 'trending' 
                    ? 'font-semibold text-blue-600 bg-white border-b-2 border-blue-500' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Trending</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-3 px-2 text-sm transition-colors ${
                  activeTab === 'friends' 
                    ? 'font-semibold text-blue-600 bg-white border-b-2 border-blue-500' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Friends</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 px-2 text-sm transition-colors ${
                  activeTab === 'create' 
                    ? 'font-semibold text-purple-600 bg-white border-b-2 border-purple-500' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create</span>
                </div>
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {activeTab === 'trending' && (
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-4">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                            post.user.avatar === 'A' ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                            post.user.avatar === 'S' ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                            'bg-gradient-to-br from-orange-500 to-red-600'
                          }`}>
                            {post.user.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{post.user.name}</h4>
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                post.type === 'photo' ? 'bg-blue-50 text-blue-600' :
                                post.type === 'review' ? 'bg-green-50 text-green-600' :
                                'bg-purple-50 text-purple-600'
                              }`}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  {post.type === 'photo' ? (
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  ) : post.type === 'review' ? (
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  ) : (
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  )}
                                </svg>
                                <span>{post.type === 'photo' ? 'Photo' : post.type === 'review' ? 'Review' : 'Post'}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{post.location}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-800 mb-4 leading-relaxed">{post.text}</p>
                        
                        {post.type === 'photo' && (
                          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-4 mb-4 border border-orange-100">
                            <div className="text-center text-5xl mb-2">🌉</div>
                            <div className="text-center text-sm font-medium text-gray-700">Beautiful Location</div>
                            <div className="text-center text-xs text-gray-500 mt-1">{post.location}</div>
                          </div>
                        )}
                        
                        {post.type === 'review' && post.rating && (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 mb-4 border border-amber-100">
                            <div className="flex justify-center space-x-1 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <svg key={i} className={`w-5 h-5 ${i <= post.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <div className="text-center">
                              <span className="text-lg font-bold text-gray-800">{post.rating}.0</span>
                              <span className="text-sm text-gray-600 ml-2">Excellent Rating</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-6">
                            <button 
                              onClick={() => {
                                const updatedPosts = posts.map(p => 
                                  p.id === post.id ? { ...p, likes: p.likes + 1 } : p
                                )
                                setPosts(updatedPosts)
                              }}
                              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors group"
                            >
                              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">{post.likes}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">{post.comments}</span>
                            </button>
                          </div>
                          <button className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {activeTab === 'friends' && (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                            friend.online 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {friend.avatar}
                          </div>
                          {friend.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">{friend.name}</h4>
                          <p className="text-xs text-gray-600 truncate">{friend.status}</p>
                          <span className="text-xs text-blue-600">{friend.distance} away</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              console.log('Locating friend:', friend.name)
                              if (map) {
                                const randomLat = userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.01 : 28.6139
                                const randomLng = userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.01 : 77.2090
                                map.setView([randomLat, randomLng], 15)
                              }
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-md transition-colors"
                          >
                            Locate
                          </button>
                          <button 
                            onClick={() => console.log('Messaging:', friend.name)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md transition-colors"
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      const newFriend = {
                        id: friends.length + 1,
                        name: `Friend ${friends.length + 1}`,
                        status: 'Just added',
                        distance: '0.1 mi',
                        online: true,
                        avatar: String.fromCharCode(65 + friends.length)
                      }
                      setFriends([...friends, newFriend])
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="font-semibold text-sm">Add New Friend</span>
                    </div>
                  </motion.button>
                </div>
              )}
              
              {activeTab === 'create' && (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>Share Your Experience</span>
                    </h3>
                    
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's interesting about this location?"
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none h-20 mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">Photo</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-yellow-600 transition-colors p-2 rounded-lg hover:bg-yellow-50">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm">Rate</span>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (newPost.trim()) {
                            const post = {
                              id: posts.length + 1,
                              user: { name: 'You', avatar: 'Y' },
                              location: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Current Location',
                              text: newPost,
                              likes: 0,
                              comments: 0,
                              timestamp: 'Just now',
                              type: 'post'
                            }
                            setPosts([post, ...posts])
                            setNewPost('')
                            setActiveTab('trending')
                          }
                        }}
                        disabled={!newPost.trim()}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed text-sm"
                      >
                        Share Post
                      </button>
                    </div>
                  </motion.div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => {
                        console.log('Creating hidden gem marker')
                        if (userLocation && map) {
                          const newMarker = {
                            id: `gem-${Date.now()}`,
                            position: [userLocation.lat, userLocation.lng],
                            title: 'Hidden Gem',
                            type: 'gem'
                          }
                          setMarkers(prev => [...prev, newMarker])
                        }
                      }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💎</div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Mark Hidden Gem</h4>
                      <p className="text-xs text-gray-600">Share secret spots</p>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => console.log('Creating trip plan')}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗺️</div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Create Trip</h4>
                      <p className="text-xs text-gray-600">Plan journeys</p>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather Layer - Real API Data */}
      {showWeather && <WeatherPanel userLocation={userLocation} onClose={() => setShowWeather(false)} />}

      {/* AR Navigation View */}
      {showAR && <ARNavigationView isActive={showAR} onClose={() => setShowAR(false)} />}



      {/* Navion Logo - Above Map */}
      <div className="fixed bottom-6 left-6 z-[1000]">
        <h1 className="font-extrabold text-3xl tracking-wide bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-2xl">
          Navion
        </h1>
      </div>

      {/* Route Options Panel - Professional */}
      {multipleRoutes.length > 0 && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute bottom-20 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-gray-200 max-w-[280px]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Route Options</h3>
            </div>
            <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full font-semibold">
              {currentRouteType}
            </span>
          </div>
          
          <div className="space-y-3">
            {multipleRoutes.map((route, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedRouteIndex(index)
                  setRoutePath(route.path)
                  setRouteDetails({
                    distance: route.distanceText,
                    duration: route.durationText,
                    weather: '22°C Clear',
                    traffic: route.isRealRoute ? 'Real-time' : 'Estimated',
                    actualDistance: route.distance,
                    routeType: route.type,
                    vehicle: route.vehicle || '🚗'
                  })
                }}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedRouteIndex === index
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedRouteIndex === index ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <span className={`text-sm ${
                        selectedRouteIndex === index ? 'text-white' : 'text-gray-600'
                      }`}>{route.vehicle || '🚗'}</span>
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${
                        selectedRouteIndex === index ? 'text-white' : 'text-gray-800'
                      }`}>{route.type}</div>
                      {route.isRealRoute && (
                        <div className="flex items-center space-x-1">
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            selectedRouteIndex === index ? 'bg-green-300' : 'bg-green-500'
                          }`}></div>
                          <span className={`text-xs ${
                            selectedRouteIndex === index ? 'text-green-200' : 'text-green-600'
                          }`}>LIVE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className={`font-semibold ${
                    selectedRouteIndex === index ? 'text-white' : 'text-gray-700'
                  }`}>{route.distanceText}</div>
                  <div className={`font-semibold ${
                    selectedRouteIndex === index ? 'text-blue-100' : 'text-gray-600'
                  }`}>{route.durationText}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Route Information - Professional Style */}
      {showRouteInfo && routeDetails && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 p-4 min-w-[300px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Route Overview</h3>
                <p className="text-xs text-gray-500">Live navigation data</p>
              </div>
            </div>
            <button 
              onClick={() => setShowRouteInfo(false)}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-all duration-200 group"
            >
              <svg className="w-4 h-4 text-gray-500 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Route Info */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 mb-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-xl">{routeDetails.vehicle || '🚗'}</span>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-white">{routeDetails.distance}</div>
                  <div className="text-blue-100 font-medium">{typeof routeDetails.duration === 'number' ? `${routeDetails.duration} min` : routeDetails.duration}</div>
                </div>
              </div>
              <div className="text-center bg-white/15 rounded-xl p-3 backdrop-blur-sm ml-3">
                <div className="text-xs text-blue-100 mb-1">Arrival</div>
                <div className="text-lg font-bold text-white">
                  {new Date(Date.now() + (typeof routeDetails.duration === 'number' ? routeDetails.duration * 60000 : 0)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <div className="text-xs text-blue-100">Weather</div>
                </div>
                <div className="font-bold text-white">{routeDetails.weather}</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-xs text-blue-100">Traffic</div>
                </div>
                <div className="font-bold text-white">Live Updates</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Smart AI Assistant */}
      <VoiceAssistant 
        onLocationSelect={(location) => {
          console.log('SmartAssistant calling handleLocationSelect with:', location)
          handleLocationSelect(location)
        }}
        onRouteMode={handleRouteMode}
        userLocation={userLocation}
      />
      
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629]}
        zoom={12}
        style={{ height: '100vh', width: '100%' }}
        whenCreated={setMap}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url={mapStyles[currentTheme]}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapEvents />

        {/* User Location - Fixed Position */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={new L.Icon({
              iconUrl: startPoint && startPoint.lat === userLocation.lat ? 
                'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' :
                'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [30, 45], iconAnchor: [15, 45], popupAnchor: [1, -34], shadowSize: [45, 45]
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <strong className={startPoint && startPoint.lat === userLocation.lat ? 'text-green-600' : 'text-blue-600'}>
                  {startPoint && startPoint.lat === userLocation.lat ? '🚀 Start Point' : '🧭 Your Location'}
                </strong>
                <br />
                <small className="text-gray-600">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</small>
                <br />
                {!startPoint ? (
                  <button 
                    onClick={() => setStartPoint({ lat: userLocation.lat, lng: userLocation.lng })}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1 hover:bg-blue-600"
                  >
                    Set as Start Point
                  </button>
                ) : startPoint.lat === userLocation.lat ? (
                  <button 
                    onClick={() => {
                      setStartPoint(null)
                      setEndPoint(null)
                      setRouteData(null)
                      setRouteDetails(null)
                      setShowRouteInfo(false)
                      setMarkers([])
                      setRoutePath(null)
                      setMultipleRoutes([])
                      setSelectedRouteIndex(0)
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-1 hover:bg-red-600"
                  >
                    Remove Start Point
                  </button>
                ) : null}
              </div>
            </Popup>
          </Marker>
        )}


        
        {/* Traffic Layer */}
        {showTraffic && <TrafficOverlay />}
        
        {/* Traffic Route Layer */}
        {startPoint && endPoint && (
          <RouteRenderer 
            map={map}
            startPoint={startPoint}
            endPoint={endPoint}
            routeData={routeData}
          />
        )}

        {/* Route Path Display */}
        {routePath && routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#1a73e8',
              weight: 6,
              opacity: 0.8,
              dashArray: routeMode === 'walking' ? '10, 10' : null
            }}
          />
        )}
        
        {/* Multiple Route Options */}
        {multipleRoutes.length > 1 && multipleRoutes.map((route, index) => (
          index !== selectedRouteIndex && (
            <Polyline
              key={index}
              positions={route.path}
              pathOptions={{
                color: route.color || '#34a853',
                weight: 4,
                opacity: 0.5,
                dashArray: '5, 5'
              }}
            />
          )
        ))}

        {/* Smart Markers */}
        {markers.map((marker, index) => {
          const icon = marker.type === 'start' ? 
            new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            }) : marker.type === 'end' ?
            new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            }) : customIcon
            
          return (
            <Marker key={marker.id} position={marker.position} icon={icon}>
              <Popup>
                <div className="text-center p-3">
                  <strong className="text-blue-600">
                    {marker.type === 'start' ? '🚀 Start Point' : 
                     marker.type === 'end' ? '🎯 Destination' : 
                     marker.category ? `${getCategoryIcon(marker.category)} ${marker.title || marker.name}` :
                     `📍 ${marker.name || `Marker ${index + 1}`}`}
                  </strong>
                  <br />
                  {marker.rating && (
                    <div className="text-yellow-500 text-sm my-1">
                      {'⭐'.repeat(Math.floor(marker.rating))} {marker.rating}
                    </div>
                  )}
                  {marker.distance && (
                    <div className="text-green-600 text-xs mb-2">
                      📍 {marker.distance}km away
                    </div>
                  )}
                  <small className="text-gray-600">{marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}</small>
                  <div className="mt-2 flex gap-1 justify-center">
                    <button 
                      onClick={() => {
                        const newMarkers = markers.filter(m => m.id !== marker.id)
                        setMarkers(newMarkers)
                        
                        // Clear route if removing any point
                        if (marker.type === 'start') {
                          setStartPoint(null)
                        } else if (marker.type === 'end') {
                          setEndPoint(null)
                        }
                        
                        // Clear route and info if no markers left or missing start/end
                        if (newMarkers.length === 0 || !newMarkers.find(m => m.type === 'start') || !newMarkers.find(m => m.type === 'end')) {
                          setRouteData(null)
                          setRouteDetails(null)
                          setShowRouteInfo(false)
                          setRoutePath(null)
                          setMultipleRoutes([])
                          setSelectedRouteIndex(0)
                        }
                      }}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                    <button 
                      onClick={() => {
                        // Create route to this location
                        if (userLocation) {
                          setStartPoint(userLocation)
                          setEndPoint({ lat: marker.position[0], lng: marker.position[1] })
                        }
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Route Here
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default MapEngine