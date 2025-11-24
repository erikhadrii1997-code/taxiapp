'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface BookingMapProps {
  pickup: string
  dropoff: string
}

export default function BookingMap({ pickup, dropoff }: BookingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on a default location (NYC)
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([40.7128, -74.0060], 13)
    
    // Ensure map fills container
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !pickup || !dropoff) return

    const map = mapInstanceRef.current

    // Create markers for pickup and dropoff
    // For demo purposes, using default coordinates
    // In production, you would geocode the addresses
    const pickupCoords: [number, number] = [40.7128, -74.0060]
    const dropoffCoords: [number, number] = [40.7589, -73.9851]

    // Custom icons
    const pickupIcon = L.divIcon({
      className: 'custom-marker pickup-marker',
      html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    const dropoffIcon = L.divIcon({
      className: 'custom-marker dropoff-marker',
      html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    // Add markers
    const pickupMarker = L.marker(pickupCoords, { icon: pickupIcon })
      .addTo(map)
      .bindPopup('Pickup Location')

    const dropoffMarker = L.marker(dropoffCoords, { icon: dropoffIcon })
      .addTo(map)
      .bindPopup('Dropoff Location')

    // Fit bounds to show both markers
    const bounds = L.latLngBounds([pickupCoords, dropoffCoords])
    map.fitBounds(bounds, { padding: [50, 50] })
    
    // Ensure map fills container after fitting bounds
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    // Draw route line
    const polyline = L.polyline([pickupCoords, dropoffCoords], {
      color: '#d4af37',
      weight: 4,
      opacity: 0.7,
    }).addTo(map)

    return () => {
      map.removeLayer(pickupMarker)
      map.removeLayer(dropoffMarker)
      map.removeLayer(polyline)
    }
  }, [pickup, dropoff])

  return <div ref={mapRef} className="w-full h-full" style={{ minHeight: '100%', minWidth: '100%', borderRadius: '50%' }} />
}

