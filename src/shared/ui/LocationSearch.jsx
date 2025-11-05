import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SearchBox = ({ onLocationSelect, onRouteSearch, userLocation, onRouteCreate }) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  // Geocoding function using Nominatim (OpenStreetMap)
  const searchLocation = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      
      const formattedSuggestions = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        address: item.display_name
      }))
      
      setSuggestions(formattedSuggestions)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchLocation(query)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name.split(',')[0]) // Show only the main name
    setShowSuggestions(false)
    onLocationSelect(suggestion)
    
    // Create route from current location to searched destination
    if (userLocation && onRouteCreate) {
      onRouteCreate(userLocation, suggestion)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0])
      } else if (query.trim()) {
        // Direct search without suggestions
        searchLocation(query).then(() => {
          if (suggestions.length > 0) {
            handleSuggestionClick(suggestions[0])
          }
        })
      }
    }
  }

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="relative w-full max-w-[600px]">
      <div className="bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200">
        <div className="flex items-center px-4 py-3">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbzY7QDEqCDDmwhwQBBuDRq54FZt2CI5L7lQ&s" 
            alt="Search" 
            className="w-5 h-5 mr-3"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search places, addresses, or landmarks..."
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
          />
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2"></div>
          )}
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setSuggestions([])
                setShowSuggestions(false)
              }}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[1001]"
          >
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-blue-600 text-sm">📍</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.name.split(',')[0]}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.address}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {suggestion.type}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Press Enter to select first result</span>
                <span>Click to select location</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {showSuggestions && !isLoading && query.length >= 3 && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-[1001]"
          >
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">No results found</div>
              <div className="text-sm">Try searching for a different location</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBox