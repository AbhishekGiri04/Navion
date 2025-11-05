import React, { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

const TrafficLayer = () => {
  const map = useMap()
  const [trafficLayers, setTrafficLayers] = useState([])

  useEffect(() => {
    const center = map.getCenter()
    const trafficData = generateTrafficData(center.lat, center.lng)
    
    const layers = []
    
    setTrafficLayers(layers)
    
    const legend = L.control({ position: 'bottomleft' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'traffic-legend')
      div.innerHTML = `
        <div style="background: white; padding: 12px; border-radius: 6px; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #ddd; font-family: Arial, sans-serif;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">
            Traffic Conditions
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 3px; background: #22c55e;"></div>
              <span style="color: #333;">Free Flow (60+ km/h)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 3px; background: #eab308;"></div>
              <span style="color: #333;">Moderate (30-60 km/h)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 3px; background: #f97316;"></div>
              <span style="color: #333;">Slow (15-30 km/h)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 3px; background: #ef4444;"></div>
              <span style="color: #333;">Heavy (0-15 km/h)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 3px; background: #991b1b;"></div>
              <span style="color: #333;">Standstill (0 km/h)</span>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 4px;">
            Last Updated: ${new Date().toLocaleTimeString()}
          </div>
        </div>
      `
      return div
    }
    legend.addTo(map)
    
    return () => {
      layers.forEach(layer => map.removeLayer(layer))
      map.removeControl(legend)
    }
  }, [map])
  
  const generateTrafficData = (lat, lng) => {
    const roads = [
      { name: 'Main Highway', type: 'highway' },
      { name: 'City Center Rd', type: 'arterial' },
      { name: 'Business District', type: 'arterial' },
      { name: 'Residential Ave', type: 'local' },
      { name: 'Industrial Blvd', type: 'arterial' },
      { name: 'Airport Road', type: 'highway' },
      { name: 'University St', type: 'local' },
      { name: 'Shopping Mall Rd', type: 'arterial' },
      { name: 'Hospital Route', type: 'local' },
      { name: 'Metro Station Rd', type: 'arterial' }
    ]
    
    return roads.map((road, index) => {
      const offset = (index - 5) * 0.01
      const route = [
        [lat + offset, lng - 0.02],
        [lat + offset + 0.005, lng - 0.01],
        [lat + offset + 0.01, lng],
        [lat + offset + 0.015, lng + 0.01],
        [lat + offset + 0.02, lng + 0.02]
      ]
      
      const hour = new Date().getHours()
      let trafficLevel, speed, delay
      
      if (road.type === 'highway') {
        if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19) {
          trafficLevel = Math.random() > 0.3 ? 'heavy' : 'slow'
          speed = trafficLevel === 'heavy' ? Math.round(Math.random() * 15) : Math.round(15 + Math.random() * 15)
        } else {
          trafficLevel = Math.random() > 0.7 ? 'moderate' : 'free'
          speed = trafficLevel === 'moderate' ? Math.round(30 + Math.random() * 30) : Math.round(60 + Math.random() * 40)
        }
      } else if (road.type === 'arterial') {
        trafficLevel = ['free', 'moderate', 'slow'][Math.floor(Math.random() * 3)]
        speed = trafficLevel === 'free' ? Math.round(40 + Math.random() * 20) :
                trafficLevel === 'moderate' ? Math.round(20 + Math.random() * 20) :
                Math.round(Math.random() * 20)
      } else {
        trafficLevel = ['free', 'moderate'][Math.floor(Math.random() * 2)]
        speed = trafficLevel === 'free' ? Math.round(30 + Math.random() * 20) : Math.round(15 + Math.random() * 15)
      }
      
      delay = speed < 15 ? `${Math.round(Math.random() * 20 + 10)} min` :
              speed < 30 ? `${Math.round(Math.random() * 10 + 5)} min` :
              speed < 50 ? `${Math.round(Math.random() * 5 + 2)} min` : 'No delay'
      
      return {
        roadName: road.name,
        route,
        level: trafficLevel,
        speed,
        delay,
        type: road.type
      }
    })
  }
  
  const getTrafficColor = (level) => {
    switch (level) {
      case 'free': return '#22c55e'
      case 'moderate': return '#eab308'
      case 'slow': return '#f97316'
      case 'heavy': return '#ef4444'
      case 'standstill': return '#991b1b'
      default: return '#6b7280'
    }
  }

  return null
}

export default TrafficLayer