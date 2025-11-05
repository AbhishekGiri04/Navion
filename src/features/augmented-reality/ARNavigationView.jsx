import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaTimes, FaCamera, FaCompass, FaArrowUp, FaLocationArrow } from 'react-icons/fa'

const ARView = ({ onClose }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 })
  const [arDirections, setArDirections] = useState([
    { id: 1, direction: 'Turn right in 100m', distance: '100m', angle: 45 },
    { id: 2, direction: 'Continue straight', distance: '500m', angle: 0 },
  ])

  useEffect(() => {
    startCamera()
    
    // Listen for device orientation
    const handleOrientation = (event) => {
      setDeviceOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      })
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      stopCamera()
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      setIsStreaming(false)
    }
  }

  const AROverlay = () => (
    <div className="absolute inset-0 pointer-events-none">
      {/* Compass */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: -deviceOrientation.alpha }}
          className="text-white"
        >
          <FaCompass className="text-2xl" />
        </motion.div>
      </div>

      {/* Direction Arrows */}
      {arDirections.map((direction) => (
        <motion.div
          key={direction.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute"
          style={{
            left: `${50 + direction.angle}%`,
            top: '40%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="bg-nova-blue/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <FaArrowUp 
                className="text-lg"
                style={{ transform: `rotate(${direction.angle}deg)` }}
              />
              <span className="font-semibold">{direction.distance}</span>
            </div>
            <p className="text-sm">{direction.direction}</p>
          </div>
          
          {/* Arrow pointing down to road */}
          <div className="flex justify-center mt-2">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-nova-blue"
            />
          </div>
        </motion.div>
      ))}

      {/* Speed and Location Info */}
      <div className="absolute bottom-20 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <FaLocationArrow className="text-nova-blue" />
              <span className="text-sm">Current Location</span>
            </div>
            <span className="text-lg font-bold">45 mph</span>
          </div>
          
          <div className="text-xs opacity-80">
            Following fastest route • 12 min remaining
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-600 rounded-full h-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              className="bg-nova-blue h-1 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* AR Grid Overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="pointer-events-none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="cyan" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <FaCamera className="text-nova-blue" />
            <span className="font-semibold">AR Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </div>

      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* AR Overlay */}
      {isStreaming && <AROverlay />}

      {/* Loading State */}
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-nova-blue border-t-transparent rounded-full mx-auto mb-4"
            />
            <p>Initializing AR Camera...</p>
            <p className="text-sm opacity-70 mt-2">
              Please allow camera access for AR navigation
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors"
        >
          Recalibrate
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-nova-blue text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
        >
          Switch to Map
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ARView