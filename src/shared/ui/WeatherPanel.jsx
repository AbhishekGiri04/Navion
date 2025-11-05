import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const WeatherWidget = ({ userLocation, onClose }) => {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userLocation) {
      fetchWeatherData(userLocation.lat, userLocation.lng)
    }
  }, [userLocation])

  const fetchWeatherData = async (lat, lng) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lng}?unitGroup=metric&key=${import.meta.env.VITE_WEATHER_API_KEY}&contentType=json`
      )
      
      if (!response.ok) {
        throw new Error('Weather data not available')
      }
      
      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (conditions) => {
    if (!conditions) return '🌤️'
    const condition = conditions.toLowerCase()
    if (condition.includes('clear') || condition.includes('sunny')) return '☀️'
    if (condition.includes('cloud')) return '☁️'
    if (condition.includes('rain')) return '🌧️'
    if (condition.includes('snow')) return '❄️'
    if (condition.includes('storm')) return '⛈️'
    return '🌤️'
  }

  const formatTemp = (temp) => Math.round(temp)

  if (loading) {
    return (
      <div className="fixed top-20 left-4 z-[1001] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 min-w-[350px]">
        <div className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed top-20 left-4 z-[1001] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 min-w-[350px]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">⚠️ Weather Error</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed top-20 left-4 z-[1001] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 min-w-[350px] max-w-[400px]"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center">
          🌍 Live Weather
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {weatherData && (
        <div className="p-4">
          {/* Current Weather */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
            <div className="text-center mb-3">
              <div className="text-4xl mb-2">{getWeatherIcon(weatherData.currentConditions?.conditions)}</div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {formatTemp(weatherData.currentConditions?.temp)}°C
              </div>
              <div className="text-gray-600">{weatherData.currentConditions?.conditions}</div>
              <div className="text-xs text-gray-500 mt-1">📍 {weatherData.resolvedAddress}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center p-2 bg-white/50 rounded-lg">
                <div className="text-gray-600">Humidity</div>
                <div className="font-semibold text-blue-600">{Math.round(weatherData.currentConditions?.humidity)}%</div>
              </div>
              <div className="text-center p-2 bg-white/50 rounded-lg">
                <div className="text-gray-600">Wind</div>
                <div className="font-semibold text-green-600">{Math.round(weatherData.currentConditions?.windspeed)} km/h</div>
              </div>
              <div className="text-center p-2 bg-white/50 rounded-lg">
                <div className="text-gray-600">Feels Like</div>
                <div className="font-semibold text-purple-600">{formatTemp(weatherData.currentConditions?.feelslike)}°</div>
              </div>
            </div>
          </div>

          {/* 24 Hour Forecast */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🕐</span>Today's Forecast
            </h4>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
              {weatherData.days?.[0]?.hours?.slice(0, 12).map((hour, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="text-xs text-gray-600 mb-1">
                    {new Date(`2000-01-01T${hour.datetime}`).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-sm mb-1">{getWeatherIcon(hour.conditions)}</div>
                  <div className="text-xs font-medium">{formatTemp(hour.temp)}°</div>
                </div>
              ))}
            </div>
            
            {/* 7 Day Forecast */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                <span className="mr-2">📅</span>7 Day Forecast
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {weatherData.days?.slice(0, 7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getWeatherIcon(day.conditions)}</span>
                      <div>
                        <div className="text-sm font-medium">
                          {index === 0 ? 'Today' : new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-gray-500">{day.conditions}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatTemp(day.tempmax)}°</div>
                      <div className="text-xs text-gray-500">{formatTemp(day.tempmin)}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default WeatherWidget