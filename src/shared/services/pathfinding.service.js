// Real Road Pathfinding using OpenStreetMap Data
export class DijkstraPathfinder {
  constructor() {
    this.osrmBaseUrl = 'https://router.project-osrm.org/route/v1';
    this.graphhopperUrl = 'https://graphhopper.com/api/1/route';
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Calculate total distance of a path by summing all segments
  calculatePathDistance(path) {
    if (!path || path.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const prevPoint = path[i - 1];
      const currentPoint = path[i];
      
      const segmentDistance = this.calculateDistance(
        prevPoint[0], prevPoint[1],
        currentPoint[0], currentPoint[1]
      );
      
      totalDistance += segmentDistance;
    }
    
    return totalDistance;
  }
  
  // Calculate travel time using proper formula: Time = Distance / Speed
  calculateTravelTime(path, distance, vehicleType = 'driving') {
    if (!path || path.length < 2 || distance <= 0) return 1;
    
    // Define realistic average speeds for different vehicles (km/h)
    const vehicleSpeeds = {
      walking: 5,     // Walking speed
      cycling: 20,    // Cycling speed
      transit: 25,    // Public transport
      driving: this.getDrivingSpeed(distance) // Dynamic driving speed
    };
    
    // Get speed for the vehicle type
    const speed = vehicleSpeeds[vehicleType] || vehicleSpeeds.driving;
    
    // Formula: Time = Distance / Speed
    // Convert to minutes: (Distance in km / Speed in km/h) * 60 minutes/hour
    const timeInHours = distance / speed;
    const timeInMinutes = timeInHours * 60;
    
    // Add realistic adjustments
    let adjustedTime = timeInMinutes;
    
    if (vehicleType === 'driving') {
      // Add time for traffic lights, stops, etc.
      const trafficFactor = this.getTrafficFactor(distance);
      adjustedTime = timeInMinutes * trafficFactor;
    } else if (vehicleType === 'walking') {
      // Add time for crossings, rest stops
      adjustedTime = timeInMinutes * 1.1;
    } else if (vehicleType === 'cycling') {
      // Add time for traffic, stops
      adjustedTime = timeInMinutes * 1.15;
    }
    
    console.log(`⏱️ Time calculation for ${vehicleType}:`, {
      distance: `${distance.toFixed(2)} km`,
      speed: `${speed} km/h`,
      baseTime: `${timeInMinutes.toFixed(1)} min`,
      adjustedTime: `${adjustedTime.toFixed(1)} min`
    });
    
    return Math.max(1, Math.round(adjustedTime));
  }
  
  // Get driving speed based on distance (realistic speeds)
  getDrivingSpeed(distance) {
    if (distance > 50) {
      return 100; // Long highway trips
    } else if (distance > 20) {
      return 80;  // Highway/expressway
    } else if (distance > 10) {
      return 60;  // Main roads/arterials
    } else if (distance > 5) {
      return 45;  // City main streets
    } else if (distance > 2) {
      return 35;  // City streets
    } else {
      return 25;  // Local/residential streets
    }
  }
  
  // Get traffic factor based on distance
  getTrafficFactor(distance) {
    if (distance > 20) {
      return 1.1; // Highway traffic is lighter
    } else if (distance > 5) {
      return 1.2; // City traffic
    } else {
      return 1.3; // Heavy city traffic for short distances
    }
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Decode polyline (Google's polyline algorithm)
  decodePolyline(str, precision = 5) {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates = [];
    const factor = Math.pow(10, precision);

    while (index < str.length) {
      let byte = null;
      let shift = 0;
      let result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
  }

  // Get real route using multiple APIs for better coverage
  async getRealRoute(startPoint, endPoint, vehicleType = 'driving') {
    const profileMap = {
      'driving': 'driving',
      'walking': 'foot', 
      'cycling': 'cycling',
      'transit': 'driving'
    };
    const profile = profileMap[vehicleType] || 'driving';
    // Try OSRM first (most reliable for road routing)
    try {
      const osrmUrl = `${this.osrmBaseUrl}/${profile}/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?overview=full&geometries=polyline&steps=true`;
      console.log('🛣️ Trying OSRM:', osrmUrl);
      
      const response = await fetch(osrmUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const path = this.decodePolyline(route.geometry);
          
          console.log('✅ OSRM success! Path points:', path.length);
          
          // Calculate real distance from path points
          const realDistance = this.calculatePathDistance(path);
          const realDuration = this.calculateTravelTime(path, realDistance, vehicleType);
          
          console.log('📏 Real calculations:', {
            apiDistance: (route.distance / 1000).toFixed(2),
            realDistance: realDistance.toFixed(2),
            apiDuration: Math.round(route.duration / 60),
            realDuration: realDuration
          });
          
          return {
            path,
            distance: realDistance,
            duration: realDuration,
            distanceText: `${realDistance.toFixed(2)} km`,
            durationText: `${realDuration} min`,
            startLocation: `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}`,
            endLocation: `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}`,
            isRealRoute: true,
            source: 'OSRM',
            pathPoints: path.length
          };
        }
      }
    } catch (error) {
      console.log('⚠️ OSRM failed, trying alternatives:', error.message);
    }
    
    // Try Valhalla API (Mapzen/Open Source)
    try {
      const valhallaUrl = `https://valhalla1.openstreetmap.de/route?json={"locations":[{"lat":${startPoint.lat},"lon":${startPoint.lng}},{"lat":${endPoint.lat},"lon":${endPoint.lng}}],"costing":"auto","shape_match":"map_snap"}`;
      console.log('🗺️ Trying Valhalla...');
      
      const response = await fetch(valhallaUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.trip && data.trip.legs && data.trip.legs.length > 0) {
          const leg = data.trip.legs[0];
          const path = this.decodePolyline(leg.shape, 6); // Valhalla uses precision 6
          
          console.log('✅ Valhalla success! Path points:', path.length);
          
          // Calculate real distance from path points
          const realDistance = this.calculatePathDistance(path);
          const realDuration = this.calculateTravelTime(path, realDistance, vehicleType);
          
          console.log('📏 Valhalla calculations:', {
            apiDistance: leg.summary.length.toFixed(2),
            realDistance: realDistance.toFixed(2),
            apiDuration: Math.round(leg.summary.time / 60),
            realDuration: realDuration
          });
          
          return {
            path,
            distance: realDistance,
            duration: realDuration,
            distanceText: `${realDistance.toFixed(2)} km`,
            durationText: `${realDuration} min`,
            startLocation: `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}`,
            endLocation: `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}`,
            isRealRoute: true,
            source: 'Valhalla',
            pathPoints: path.length
          };
        }
      }
    } catch (error) {
      console.log('⚠️ Valhalla failed:', error.message);
    }
    
    // Final fallback - create road-following path
    console.log('🔄 Using road-following fallback');
    return this.createRoadFollowingPath(startPoint, endPoint);
  }
  
  // Create a road-following path that mimics real roads
  createRoadFollowingPath(startPoint, endPoint, vehicleType = 'driving') {
    const distance = this.calculateDistance(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    const path = [];
    
    // Calculate intermediate waypoints that follow likely road patterns
    const steps = Math.max(15, Math.floor(distance * 8));
    
    // Create waypoints that follow grid-like road patterns
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      
      let lat = startPoint.lat + (endPoint.lat - startPoint.lat) * ratio;
      let lng = startPoint.lng + (endPoint.lng - startPoint.lng) * ratio;
      
      // Add road-like deviations based on typical urban grid patterns
      if (i > 0 && i < steps) {
        // Simulate following major roads (N-S, E-W grid)
        const gridOffset = 0.002; // ~200m grid spacing
        
        // Snap to likely road grid
        const latGrid = Math.round(lat / gridOffset) * gridOffset;
        const lngGrid = Math.round(lng / gridOffset) * gridOffset;
        
        // Add some variation to avoid perfect grid
        const variation = 0.0005;
        lat = latGrid + (Math.random() - 0.5) * variation;
        lng = lngGrid + (Math.random() - 0.5) * variation;
        
        // Ensure we don't deviate too much from the direct path
        const maxDeviation = 0.003;
        const directLat = startPoint.lat + (endPoint.lat - startPoint.lat) * ratio;
        const directLng = startPoint.lng + (endPoint.lng - startPoint.lng) * ratio;
        
        if (Math.abs(lat - directLat) > maxDeviation) {
          lat = directLat + Math.sign(lat - directLat) * maxDeviation;
        }
        if (Math.abs(lng - directLng) > maxDeviation) {
          lng = directLng + Math.sign(lng - directLng) * maxDeviation;
        }
      }
      
      path.push([lat, lng]);
    }
    
    // Calculate real distance and time from path
    const realDistance = this.calculatePathDistance(path);
    const realDuration = this.calculateTravelTime(path, realDistance);
    
    console.log('📏 Road-following calculations:', {
      pathPoints: path.length,
      realDistance: realDistance.toFixed(2),
      realDuration: realDuration
    });
    
    return {
      path,
      distance: realDistance,
      duration: realDuration,
      distanceText: `${realDistance.toFixed(2)} km`,
      durationText: `${realDuration} min`,
      startLocation: `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}`,
      endLocation: `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}`,
      isRealRoute: false,
      source: 'Road-following',
      pathPoints: path.length
    };
  }

  // ALWAYS return 2 routes - Fastest and Alternative
  async getMultipleRoutes(startPoint, endPoint, vehicleType = 'driving') {
    const routes = [];
    
    // Try to get real routes with alternatives from OSRM
    try {
      const profileMap = { 'driving': 'driving', 'walking': 'foot', 'cycling': 'cycling', 'transit': 'driving' };
      const profile = profileMap[vehicleType] || 'driving';
      
      const url = `${this.osrmBaseUrl}/${profile}/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?overview=full&geometries=polyline&alternatives=true&steps=true`;
      console.log(`🚗 Getting ${vehicleType} routes...`);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          // Process up to 2 routes from API
          data.routes.slice(0, 2).forEach((route, index) => {
            const path = this.decodePolyline(route.geometry);
            const realDistance = this.calculatePathDistance(path);
            const realDuration = this.calculateTravelTime(path, realDistance, vehicleType);
            
            routes.push({
              path,
              distance: realDistance,
              duration: realDuration,
              distanceText: `${realDistance.toFixed(2)} km`,
              durationText: `${realDuration} min`,
              type: index === 0 ? 'Fastest' : 'Alternative',
              color: index === 0 ? '#1a73e8' : '#34a853',
              vehicle: this.getVehicleIcon(vehicleType),
              isRealRoute: true,
              source: 'OSRM'
            });
          });
          
          // If we only got 1 route from API, try to get alternative from different API
          if (routes.length === 1) {
            const altRoute = await this.getRealAlternativeRoute(startPoint, endPoint, vehicleType);
            routes.push(altRoute);
          }
          
          console.log('✅ Got', routes.length, 'routes (API + real alternative)');
          return routes;
        }
      }
    } catch (error) {
      console.log('⚠️ OSRM failed:', error.message);
    }
    
    // Fallback: Try to get at least one real route and one alternative
    console.log('🛠️ Getting real routes from different APIs...');
    
    // Try to get fastest route from OSRM
    const fastRoute = await this.getRealRoute(startPoint, endPoint, vehicleType);
    if (fastRoute) {
      routes.push({
        ...fastRoute,
        type: 'Fastest',
        color: '#1a73e8',
        vehicle: this.getVehicleIcon(vehicleType)
      });
    }
    
    // Try to get alternative route from different API or method
    const altRoute = await this.getRealAlternativeRoute(startPoint, endPoint, vehicleType);
    routes.push(altRoute);
    
    console.log('✅ Got', routes.length, 'real routes');
    return routes;
  }
  
  // Get real alternative route using different API or waypoints
  async getRealAlternativeRoute(startPoint, endPoint, vehicleType = 'driving') {
    // Try Valhalla for alternative route
    try {
      const valhallaUrl = `https://valhalla1.openstreetmap.de/route?json={"locations":[{"lat":${startPoint.lat},"lon":${startPoint.lng}},{"lat":${endPoint.lat},"lon":${endPoint.lng}}],"costing":"auto","shape_match":"map_snap"}`;
      console.log('🗺️ Getting alternative from Valhalla...');
      
      const response = await fetch(valhallaUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.trip && data.trip.legs && data.trip.legs.length > 0) {
          const leg = data.trip.legs[0];
          const path = this.decodePolyline(leg.shape, 6);
          const realDistance = this.calculatePathDistance(path);
          const realDuration = this.calculateTravelTime(path, realDistance, vehicleType);
          
          return {
            path,
            distance: realDistance,
            duration: realDuration,
            distanceText: `${realDistance.toFixed(2)} km`,
            durationText: `${realDuration} min`,
            type: 'Alternative',
            color: '#34a853',
            vehicle: this.getVehicleIcon(vehicleType),
            isRealRoute: true,
            source: 'Valhalla'
          };
        }
      }
    } catch (error) {
      console.log('⚠️ Valhalla alternative failed:', error.message);
    }
    
    // Try OSRM with waypoint for different route
    try {
      const midLat = (startPoint.lat + endPoint.lat) / 2 + (Math.random() - 0.5) * 0.01;
      const midLng = (startPoint.lng + endPoint.lng) / 2 + (Math.random() - 0.5) * 0.01;
      
      const profileMap = { 'driving': 'driving', 'walking': 'foot', 'cycling': 'cycling', 'transit': 'driving' };
      const profile = profileMap[vehicleType] || 'driving';
      
      const waypointUrl = `${this.osrmBaseUrl}/${profile}/${startPoint.lng},${startPoint.lat};${midLng},${midLat};${endPoint.lng},${endPoint.lat}?overview=full&geometries=polyline`;
      console.log('🛣️ Getting alternative via waypoint...');
      
      const response = await fetch(waypointUrl);
      if (response.ok) {
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const path = this.decodePolyline(route.geometry);
          const realDistance = this.calculatePathDistance(path);
          const realDuration = this.calculateTravelTime(path, realDistance, vehicleType);
          
          return {
            path,
            distance: realDistance,
            duration: realDuration,
            distanceText: `${realDistance.toFixed(2)} km`,
            durationText: `${realDuration} min`,
            type: 'Alternative',
            color: '#34a853',
            vehicle: this.getVehicleIcon(vehicleType),
            isRealRoute: true,
            source: 'OSRM-Waypoint'
          };
        }
      }
    } catch (error) {
      console.log('⚠️ OSRM waypoint failed:', error.message);
    }
    
    // Final fallback - road following
    console.log('🔄 Using road-following alternative');
    const altPath = this.createRoadFollowingAlternative(startPoint, endPoint);
    const altDistance = this.calculatePathDistance(altPath);
    const altDuration = this.calculateTravelTime(altPath, altDistance, vehicleType);
    
    return {
      path: altPath,
      distance: altDistance,
      duration: altDuration,
      distanceText: `${altDistance.toFixed(2)} km`,
      durationText: `${altDuration} min`,
      type: 'Alternative',
      color: '#34a853',
      vehicle: this.getVehicleIcon(vehicleType),
      isRealRoute: false,
      source: 'Road-following'
    };
  }
  
  // Get vehicle icon
  getVehicleIcon(vehicleType) {
    const icons = {
      'driving': '🚗',
      'walking': '🚶',
      'cycling': '🚴',
      'transit': '🚌'
    };
    return icons[vehicleType] || '🚗';
  }
  
  // Create road-following alternative path
  createRoadFollowingAlternative(startPoint, endPoint) {
    const path = [];
    const distance = this.calculateDistance(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    const steps = Math.max(20, Math.floor(distance * 10));
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      let lat = startPoint.lat + (endPoint.lat - startPoint.lat) * ratio;
      let lng = startPoint.lng + (endPoint.lng - startPoint.lng) * ratio;
      
      // Create alternative route by following different road grid pattern
      if (i > 0 && i < steps) {
        const gridOffset = 0.0025; // Slightly different grid for alternative
        
        // Alternative grid pattern (offset by half grid)
        const latGrid = Math.round((lat + gridOffset/2) / gridOffset) * gridOffset;
        const lngGrid = Math.round((lng + gridOffset/2) / gridOffset) * gridOffset;
        
        // Add road-like variations
        const roadVariation = 0.0008;
        lat = latGrid + (Math.random() - 0.5) * roadVariation;
        lng = lngGrid + (Math.random() - 0.5) * roadVariation;
        
        // Ensure reasonable deviation from direct path
        const maxDeviation = 0.004;
        const directLat = startPoint.lat + (endPoint.lat - startPoint.lat) * ratio;
        const directLng = startPoint.lng + (endPoint.lng - startPoint.lng) * ratio;
        
        if (Math.abs(lat - directLat) > maxDeviation) {
          lat = directLat + Math.sign(lat - directLat) * maxDeviation;
        }
        if (Math.abs(lng - directLng) > maxDeviation) {
          lng = directLng + Math.sign(lng - directLng) * maxDeviation;
        }
      }
      
      path.push([lat, lng]);
    }
    
    return path;
  }

  // Get the best route using real road data
  async findShortestPath(startPoint, endPoint) {
    const realRoute = await this.getRealRoute(startPoint, endPoint, 'driving');
    
    if (realRoute) {
      return {
        ...realRoute,
        type: 'Fastest Route',
        color: '#1a73e8'
      };
    }
    
    // Fallback to direct path if API fails
    return this.getDirectPath(startPoint, endPoint);
  }

  // Fallback direct path calculation with realistic adjustments
  getDirectPath(startPoint, endPoint) {
    // Create a path with some intermediate points for better distance calculation
    const path = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * ratio;
      const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * ratio;
      path.push([lat, lng]);
    }
    
    // Calculate real distance and time
    const realDistance = this.calculatePathDistance(path);
    const realDuration = this.calculateTravelTime(path, realDistance);
    
    console.log('📏 Direct path calculations:', {
      pathPoints: path.length,
      realDistance: realDistance.toFixed(2),
      realDuration: realDuration
    });

    return {
      path,
      distance: realDistance,
      duration: realDuration,
      distanceText: `${realDistance.toFixed(2)} km`,
      durationText: `${realDuration} min`,
      startLocation: `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}`,
      endLocation: `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}`,
      type: 'Direct Path',
      color: '#9c27b0',
      pathPoints: path.length
    };
  }

  // Main function to find multiple routes with real calculations
  async findMultipleRoutes(startPoint, endPoint) {
    console.log('🗺️ Finding routes with real distance/time calculations');
    console.log('From:', startPoint, 'To:', endPoint);
    
    const routes = await this.getMultipleRoutes(startPoint, endPoint);
    
    if (routes && routes.length > 0) {
      console.log('📍 Found', routes.length, 'route options with real calculations:');
      routes.forEach((route, index) => {
        console.log(`Route ${index + 1}: ${route.distanceText}, ${route.durationText}, ${route.pathPoints} points`);
      });
      return routes;
    }
    
    // Ultimate fallback with real calculations
    console.log('⚠️ Using emergency fallback with real calculations');
    const fallbackRoute = this.getDirectPath(startPoint, endPoint);
    return [fallbackRoute];
  }
}