import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPalette, FaSun, FaMoon, FaRocket, FaWater, FaSnowflake } from 'react-icons/fa'

const ThemeMoodSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [autoSwitch, setAutoSwitch] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (autoSwitch) {
      const hour = currentTime.getHours()
      const isNight = hour < 6 || hour > 18
      const recommendedTheme = isNight ? 'dark' : 'streets'
      if (currentTheme !== recommendedTheme) {
        onThemeChange(recommendedTheme)
      }
    }
  }, [currentTime, autoSwitch, currentTheme, onThemeChange])

  const themes = [
    { 
      id: 'streets', 
      name: 'Streets', 
      icon: <FaSun />, 
      gradient: 'from-blue-400 to-blue-600',
      mood: 'Clean & Modern',
      time: 'day'
    },
    { 
      id: 'dark', 
      name: 'Dark', 
      icon: <FaMoon />, 
      gradient: 'from-gray-700 to-gray-900',
      mood: 'Night Mode',
      time: 'night'
    },
    { 
      id: 'satellite', 
      name: 'Satellite', 
      icon: <FaRocket />, 
      gradient: 'from-green-400 to-blue-500',
      mood: 'Aerial View',
      time: 'any'
    },

    { 
      id: 'ocean', 
      name: 'Ocean', 
      icon: <FaWater />, 
      gradient: 'from-blue-300 to-teal-500',
      mood: 'Calm & Serene',
      time: 'any'
    },
    { 
      id: 'winter', 
      name: 'Winter', 
      icon: <FaSnowflake />, 
      gradient: 'from-blue-200 to-white',
      mood: 'Cool & Crisp',
      time: 'any'
    }
  ]

  const currentThemeData = themes.find(theme => theme.id === currentTheme) || themes[0]
  const hour = currentTime.getHours()
  const isNight = hour < 6 || hour > 18

  const getRecommendedTheme = () => {
    if (isNight) {
      return themes.filter(t => t.time === 'night' || t.time === 'any')[0]
    }
    return themes.filter(t => t.time === 'day' || t.time === 'any')[0]
  }

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId)
    setIsOpen(false)
  }

  const recommendedTheme = getRecommendedTheme()

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white rounded-full p-4 shadow-lg border-2 transition-all duration-200 ${
          isOpen 
            ? 'border-purple-500 bg-purple-50 shadow-purple-200' 
            : 'border-white/20 hover:border-purple-300 hover:shadow-xl hover:bg-purple-50'
        }`}
      >
        <svg className={`w-5 h-5 transition-colors ${
          isOpen ? 'text-purple-600' : 'text-purple-500'
        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-full mb-3 right-0 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20 min-w-[280px]"
          >
            <div className="flex items-center space-x-2 mb-3">
              <FaPalette className="text-blue-500" />
              <h3 className="font-medium text-gray-800 text-sm">Mood Themes</h3>

            </div>

            {/* Recommended Theme */}
            {recommendedTheme.id !== currentTheme && (
              <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-800">Recommended for you</p>
                    <p className="text-xs text-gray-500">{recommendedTheme.mood}</p>
                  </div>
                  <button
                    onClick={() => handleThemeSelect(recommendedTheme.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`p-3 rounded-lg transition-all ${
                    currentTheme === theme.id 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : 'hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.gradient} flex items-center justify-center text-white mb-2 mx-auto`}>
                    {theme.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-800">{theme.name}</div>
                  <div className="text-xs text-gray-500">{theme.mood}</div>
                  {currentTheme === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Auto Theme Toggle */}
            <div className="mt-3 pt-2 border-t border-gray-200/50">
              <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoSwitch}
                  onChange={(e) => setAutoSwitch(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" 
                />
                <span>Auto-switch based on time</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThemeMoodSelector