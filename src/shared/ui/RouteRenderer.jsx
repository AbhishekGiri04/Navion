import { useEffect } from 'react'
import L from 'leaflet'

const TrafficRoute = ({ map, startPoint, endPoint, routeData }) => {
  useEffect(() => {
    if (!map || !startPoint || !endPoint) return

    // Mock route with traffic data
    const routeCoordinates = [
      [startPoint.lat, startPoint.lng],
      [(startPoint.lat + endPoint.lat) / 2, (startPoint.lng + endPoint.lng) / 2],
      [endPoint.lat, endPoint.lng]
    ]

    // Create different colored segments based on traffic
    const segments = [
      {
        coords: [routeCoordinates[0], routeCoordinates[1]],
        traffic: 'heavy', // Red
        color: '#ef4444'
      },
      {
        coords: [routeCoordinates[1], routeCoordinates[2]], 
        traffic: 'light', // Blue
        color: '#3b82f6'
      }
    ]

    const routeLayers = []

    segments.forEach((segment) => {
      const polyline = L.polyline(segment.coords, {
        color: segment.color,
        weight: 6,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(map)

      routeLayers.push(polyline)
    })

    // Add traffic legend
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'traffic-legend')
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold;">Traffic</h4>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 16px; height: 3px; background: #ef4444;"></div>
              <span style="font-size: 11px;">Heavy</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 16px; height: 3px; background: #f59e0b;"></div>
              <span style="font-size: 11px;">Moderate</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 16px; height: 3px; background: #3b82f6;"></div>
              <span style="font-size: 11px;">Light</span>
            </div>
          </div>
        </div>
      `
      return div
    }
    legend.addTo(map)

    return () => {
      routeLayers.forEach(layer => map.removeLayer(layer))
      map.removeControl(legend)
    }
  }, [map, startPoint, endPoint, routeData])

  return null
}

export default TrafficRoute