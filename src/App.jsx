import React, { useState, useEffect } from 'react'
import MapEngine from './features/mapping/MapEngine'
import LoadingSpinner from './shared/ui/LoadingSpinner'
import { useGeolocation } from './shared/composables/useLocation'

function App() {
  const { location } = useGeolocation()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="App">
      <MapEngine userLocation={location} />
    </div>
  )
}

export default App