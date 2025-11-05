import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaRoute, FaEye, FaUsers, FaCloud, FaTrafficLight, 
  FaCar, FaBicycle, FaWalking, FaChargingStation,
  FaBolt, FaLeaf, FaCompass, FaRobot
} from 'react-icons/fa'

const SmartControls = ({ 
  onRouteMode, 
  onARToggle, 
  onSocialToggle, 
  onWeatherToggle, 
  onTrafficToggle,
  onRouteTypeChange,
  currentMode = 'driving',
  currentRouteType = 'fastest'
}) => {
  const [showRoutePanel, setShowRoutePanel] = useState(false)
  const [selectedTransport, setSelectedTransport] = useState(currentMode)
  const [selectedRouteType, setSelectedRouteType] = useState(currentRouteType)

  const transportModes = [
    { id: 'driving', icon: <FaCar />, label: 'Drive', color: 'text-blue-500' },
    { id: 'walking', icon: <FaWalking />, label: 'Walk', color: 'text-green-500' },
    { id: 'cycling', icon: <FaBicycle />, label: 'Bike', color: 'text-orange-500' },
    { id: 'ev', icon: <FaChargingStation />, label: 'EV', color: 'text-purple-500' }
  ]

  const routeTypes = [
    { id: 'fastest', icon: <FaBolt />, label: 'Fastest', desc: 'Quickest route' },
    { id: 'eco', icon: <FaLeaf />, label: 'Eco', desc: 'Lowest emissions' },
    { id: 'scenic', icon: <FaCompass />, label: 'Scenic', desc: 'Beautiful views' }
  ]

  return (
    <div className="flex flex-col space-y-3">
      {/* Route Planning */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRoutePanel(!showRoutePanel)}
          className={`relative bg-white rounded-full p-4 shadow-lg border-2 transition-all duration-200 ${
            showRoutePanel 
              ? 'border-blue-500 bg-blue-50 shadow-blue-200' 
              : 'border-white/20 hover:border-blue-300 hover:shadow-xl'
          }`}
        >
          <motion.div
            animate={{ rotate: showRoutePanel ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className={`w-5 h-5 transition-colors ${
              showRoutePanel ? 'text-blue-600' : 'text-blue-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </motion.div>
          {showRoutePanel && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </motion.div>
          )}
        </motion.button>

        <AnimatePresence>
          {showRoutePanel && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute right-full mr-3 top-0 bg-white rounded-xl p-4 shadow-xl border border-gray-100 w-[280px] backdrop-blur-xl max-h-[80vh] overflow-y-auto"
              style={{ boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)' }}
            >
              {/* Compact Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Smart Routing</h3>
                    <p className="text-xs text-gray-500">AI-powered</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRoutePanel(false)}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors group"
                >
                  <svg className="w-3 h-3 text-gray-500 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {/* Compact Transport Modes */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Transport Mode</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {transportModes.map((mode) => (
                    <motion.button
                      key={mode.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTransport(mode.id)}
                      className={`relative flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 ${
                        selectedTransport === mode.id 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {selectedTransport === mode.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <span className={`text-lg ${selectedTransport === mode.id ? 'text-white' : mode.color}`}>
                        {mode.icon}
                      </span>
                      <span className="text-xs font-medium">{mode.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Compact Route Types */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Route Type</span>
                </div>
                <div className="space-y-2">
                  {routeTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedRouteType(type.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        selectedRouteType === type.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedRouteType === type.id ? 'bg-white/20' : 'bg-white'
                      }`}>
                        <span className={`text-sm ${
                          selectedRouteType === type.id ? 'text-white' : 'text-gray-600'
                        }`}>
                          {type.icon}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`text-xs font-semibold ${
                          selectedRouteType === type.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {type.label}
                        </div>
                        <div className={`text-xs ${
                          selectedRouteType === type.id ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {type.desc}
                        </div>
                      </div>
                      {selectedRouteType === type.id && (
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Compact Apply Button */}
              <div className="pt-3 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Apply transport mode
                    if (onRouteMode && selectedTransport !== currentMode) {
                      onRouteMode(selectedTransport)
                    }
                    
                    // Apply route type
                    if (onRouteTypeChange && selectedRouteType !== currentRouteType) {
                      onRouteTypeChange(selectedRouteType)
                    }
                    
                    // Close panel
                    setShowRoutePanel(false)
                    
                    console.log('✨ Applied settings:', {
                      transport: selectedTransport,
                      routeType: selectedRouteType
                    })
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span className="text-sm">Apply Route Settings</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Social Layer */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSocialToggle}
        className="bg-white rounded-full p-4 shadow-lg border-2 border-white/20 hover:border-pink-300 hover:shadow-xl transition-all duration-200 hover:bg-pink-50"
      >
        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </motion.button>

      {/* Weather */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onWeatherToggle}
        className="bg-white rounded-full p-4 shadow-lg border-2 border-white/20 hover:border-blue-300 hover:shadow-xl transition-all duration-200 hover:bg-blue-50"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      </motion.button>

      {/* Traffic */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onTrafficToggle}
        className="bg-white rounded-full p-4 shadow-lg border-2 border-white/20 hover:border-red-300 hover:shadow-xl transition-all duration-200 hover:bg-red-50"
      >
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </motion.button>
    </div>
  )
}

export default SmartControls