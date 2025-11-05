import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBrain, FaMicrophone, FaTimes, FaRobot, FaLightbulb, FaMapMarkerAlt } from 'react-icons/fa'

const SmartAssistant = ({ onLocationSelect, onRouteMode, userLocation }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hi! I'm Nova, your AI navigation assistant. I can help you find places, plan routes, and provide smart travel suggestions. Try asking me something like 'Find coffee shops nearby' or 'What's the best route to avoid traffic?'",
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)

  const aiSuggestions = [
    "Find restaurants near me",
    "Show EV charging stations",
    "Plan scenic route to beach",
    "Avoid traffic to downtown",
    "Find nearest hospital",
    "Show me hidden gems nearby"
  ]

  const handleUserInput = async (input) => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    setTimeout(() => {
      const aiResponse = generateSmartResponse(input)
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse.text,
        timestamp: new Date(),
        action: aiResponse.action
      }
      setMessages(prev => [...prev, aiMessage])
      
      if (aiResponse.action) {
        executeAction(aiResponse.action)
      }
    }, 1000)

    setInputText('')
  }

  const generateSmartResponse = (input) => {
    const lowerInput = input.toLowerCase()
    const locations = findAndMarkLocations(lowerInput)

    // Check for specific location names first
    if (lowerInput.includes('burger king') || lowerInput.includes('burgerking')) {
      return {
        text: `Found Burger King! I've located it on your map with directions and menu info. Click the marker to get route!`,
        action: { type: 'markLocations', locations: ['Burger King'], category: 'restaurant' }
      }
    }

    if (lowerInput.includes('mcdonald') || lowerInput.includes('mcdonalds')) {
      return {
        text: `Found McDonald's nearby! Marked on your map with current offers and drive-thru info.`,
        action: { type: 'markLocations', locations: ['McDonalds'], category: 'restaurant' }
      }
    }

    if (lowerInput.includes('starbucks')) {
      return {
        text: `Located Starbucks! Check the map marker for menu, WiFi availability and seating info.`,
        action: { type: 'markLocations', locations: ['Starbucks'], category: 'cafe' }
      }
    }

    if (lowerInput.includes('kfc')) {
      return {
        text: `Found KFC! I've marked it on your map with current deals and delivery options.`,
        action: { type: 'markLocations', locations: ['KFC'], category: 'restaurant' }
      }
    }

    // Check for locate commands
    if (lowerInput.includes('locate') || lowerInput.includes('find') || lowerInput.includes('where is')) {
      if (lowerInput.includes('restaurant') || lowerInput.includes('food') || lowerInput.includes('eat')) {
        return {
          text: `Found ${locations.restaurants.length} restaurants nearby: ${locations.restaurants.join(', ')}. All marked on your map!`,
          action: { type: 'markLocations', locations: locations.restaurants, category: 'restaurant' }
        }
      }
      if (lowerInput.includes('coffee') || lowerInput.includes('cafe')) {
        return {
          text: `Located ${locations.cafes.length} coffee shops: ${locations.cafes.join(', ')}. Check map for ratings!`,
          action: { type: 'markLocations', locations: locations.cafes, category: 'cafe' }
        }
      }
      if (lowerInput.includes('gym') || lowerInput.includes('fitness')) {
        return {
          text: `Found ${locations.gyms.length} gyms: ${locations.gyms.join(', ')}. All locations marked with facilities info!`,
          action: { type: 'markLocations', locations: locations.gyms, category: 'gym' }
        }
      }
    }

    // General category searches
    if (lowerInput.includes('restaurant') || lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('dining')) {
      return {
        text: `Found ${locations.restaurants.length} restaurants nearby: ${locations.restaurants.join(', ')}. I've marked them on your map with ratings and reviews!`,
        action: { type: 'markLocations', locations: locations.restaurants, category: 'restaurant' }
      }
    }

    if (lowerInput.includes('coffee') || lowerInput.includes('cafe') || lowerInput.includes('tea')) {
      return {
        text: `Perfect! Found ${locations.cafes.length} coffee shops: ${locations.cafes.join(', ')}. Check the map for ratings, prices and distance from you.`,
        action: { type: 'markLocations', locations: locations.cafes, category: 'cafe' }
      }
    }

    if (lowerInput.includes('gas') || lowerInput.includes('petrol') || lowerInput.includes('fuel') || lowerInput.includes('pump')) {
      return {
        text: `Located ${locations.gas.length} fuel stations: ${locations.gas.join(', ')}. Showing current fuel prices and availability on your map.`,
        action: { type: 'markLocations', locations: locations.gas, category: 'gas' }
      }
    }

    if (lowerInput.includes('hospital') || lowerInput.includes('medical') || lowerInput.includes('doctor') || lowerInput.includes('clinic')) {
      return {
        text: `Found ${locations.hospitals.length} medical facilities: ${locations.hospitals.join(', ')}. Marked with emergency services and contact information.`,
        action: { type: 'markLocations', locations: locations.hospitals, category: 'hospital' }
      }
    }

    if (lowerInput.includes('gym') || lowerInput.includes('fitness') || lowerInput.includes('workout') || lowerInput.includes('exercise')) {
      return {
        text: `Located ${locations.gyms.length} fitness centers: ${locations.gyms.join(', ')}. Check map for facilities, timings and membership details.`,
        action: { type: 'markLocations', locations: locations.gyms, category: 'gym' }
      }
    }

    if (lowerInput.includes('bank') || lowerInput.includes('atm') || lowerInput.includes('cash') || lowerInput.includes('money')) {
      return {
        text: `Found ${locations.banks.length} banking locations: ${locations.banks.join(', ')}. Showing ATM availability and banking hours.`,
        action: { type: 'markLocations', locations: locations.banks, category: 'bank' }
      }
    }

    if (lowerInput.includes('shop') || lowerInput.includes('mall') || lowerInput.includes('store') || lowerInput.includes('market')) {
      return {
        text: `Located ${locations.shopping.length} shopping areas: ${locations.shopping.join(', ')}. Marked with store directories and parking info.`,
        action: { type: 'markLocations', locations: locations.shopping, category: 'shopping' }
      }
    }

    if (lowerInput.includes('school') || lowerInput.includes('college') || lowerInput.includes('university') || lowerInput.includes('education')) {
      return {
        text: `Found ${locations.schools.length} educational institutions: ${locations.schools.join(', ')}. Check map for courses and contact details.`,
        action: { type: 'markLocations', locations: locations.schools, category: 'school' }
      }
    }

    if (lowerInput.includes('charging') || lowerInput.includes('ev') || lowerInput.includes('electric')) {
      return {
        text: `Great choice! Found ${locations.ev.length} EV charging stations: ${locations.ev.join(', ')}. Showing real-time availability and charging speeds.`,
        action: { type: 'markLocations', locations: locations.ev, category: 'ev' }
      }
    }

    if (lowerInput.includes('traffic')) {
      return {
        text: "Analyzing current traffic conditions... I'm calculating the fastest route avoiding congestion. Check the traffic layer for live updates.",
        action: { type: 'traffic', show: true }
      }
    }

    return {
      text: "I can help you find any location! Try: 'locate Burger King', 'find restaurants near me', 'where is Starbucks', or ask for coffee shops, gas stations, hospitals, gyms, banks, shopping malls, schools, or EV charging stations.",
      action: null
    }
  }

  const findAndMarkLocations = (query) => {
    return {
      restaurants: ['Pizza Palace', 'Burger King', 'Local Diner', 'Sushi Express', 'Italian Bistro'],
      cafes: ['Starbucks', 'Coffee Bean', 'Local Cafe', 'Tea House', 'Brew & Beans'],
      gas: ['Shell Station', 'BP Fuel', 'Indian Oil', 'Reliance Petrol', 'HP Gas'],
      hospitals: ['City Hospital', 'Emergency Care', 'Medical Center', 'Clinic Plus', 'Health Hub'],
      gyms: ['Fitness First', 'Gold Gym', 'Local Fitness', 'Yoga Studio', 'CrossFit Box'],
      banks: ['HDFC Bank', 'SBI ATM', 'ICICI Branch', 'Axis Bank', 'PNB Branch'],
      shopping: ['City Mall', 'Shopping Complex', 'Local Market', 'Supermarket', 'Plaza'],
      schools: ['Public School', 'College Campus', 'University', 'Training Center', 'Academy'],
      ev: ['Tesla Supercharger', 'Fast Charge Hub', 'EV Station', 'Green Charging', 'PowerGrid']
    }
  }

  const executeAction = (action) => {
    switch (action.type) {
      case 'markLocations':
        console.log('Executing markLocations action:', action)
        markLocationsOnMap(action.locations, action.category)
        break
      case 'route':
        onRouteMode(action.mode)
        break
      case 'traffic':
        console.log('Show traffic layer')
        break
      case 'weather':
        console.log('Show weather layer')
        break
    }
  }

  const markLocationsOnMap = (locations, category) => {
    console.log(`Marking ${category} locations:`, locations)
    
    const mockCoords = locations.map((location, index) => {
      const lat = (userLocation?.lat || 20.5937) + (Math.random() - 0.5) * 0.02
      const lng = (userLocation?.lng || 78.9629) + (Math.random() - 0.5) * 0.02
      
      return {
        name: location,
        lat: lat,
        lng: lng,
        category: category,
        rating: (Math.random() * 2 + 3).toFixed(1),
        distance: (Math.random() * 5 + 0.5).toFixed(1)
      }
    })
    
    // Mark each location on the map
    mockCoords.forEach(coord => {
      console.log(`📍 ${coord.name} - ${coord.rating}⭐ - ${coord.distance}km away`)
      onLocationSelect({
        lat: coord.lat,
        lng: coord.lng,
        name: coord.name,
        category: coord.category,
        rating: coord.rating,
        distance: coord.distance
      })
    })
  }

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        handleUserInput(transcript)
      }

      recognition.start()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    handleUserInput(suggestion)
  }

  return (
    <>
      {/* AI Assistant Toggle */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 z-[1000] bg-white rounded-full p-4 shadow-lg border-2 transition-all duration-200 ${
          isOpen 
            ? 'border-blue-500 bg-blue-50 shadow-blue-200' 
            : 'border-white/20 hover:border-blue-300 hover:shadow-xl hover:bg-blue-50'
        }`}
      >
        <svg className={`w-5 h-5 transition-colors ${
          isOpen ? 'text-blue-600' : 'text-blue-500'
        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {messages.length > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
          >
            {messages.length - 1}
          </motion.div>
        )}
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            className="fixed bottom-32 right-4 z-[1000] w-96 h-96 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  <FaRobot />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Nova AI</h3>
                  <p className="text-xs text-gray-600">Smart Navigation Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200/50">
                <div className="flex items-center space-x-1 mb-2">
                  <FaLightbulb className="text-yellow-500 text-sm" />
                  <span className="text-xs text-gray-600">Try asking:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200/50">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserInput(inputText)}
                  placeholder="Ask Nova anything..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={startVoiceInput}
                  className={`p-2 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-blue-500'
                  }`}
                >
                  <FaMicrophone />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SmartAssistant