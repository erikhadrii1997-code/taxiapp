'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { MapPin, Clock, Star, ArrowRight, Car, Shield, Zap, Phone, X, TrendingUp, Users, Navigation, Sparkles, Home, Briefcase, Heart, Plus, Trash2, Plane, Building2, ShoppingBag, UtensilsCrossed, LocateIcon, Loader2, Calendar, CalendarClock, Play } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { VehicleType, Booking, Trip } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

// Dynamically import map component
const HomeMapComponent = dynamic(() => import('@/components/map/HomeMap'), {
  ssr: false,
})

const vehicles = [
  {
    type: 'standard' as VehicleType,
    name: 'Standard',
    ratePerKm: 0.5,
    capacity: 4,
    time: '~12 min',
    image: 'https://alphazug.com/wp-content/uploads/2020/11/800px-Rolls-Royce_Phantom_VIII_Genf_2019_1Y7A5148.jpg',
    features: ['AC', 'Music', 'Charging'],
    details: 'Perfect for everyday rides. Comfortable seating for up to 4 passengers with ample luggage space.',
    icon: 'car',
    badge: 'Popular',
    badgeColor: 'yellow',
    popularity: 85,
  },
  {
    type: 'premium' as VehicleType,
    name: 'Premium',
    ratePerKm: 0.8,
    capacity: 4,
    time: '~10 min',
    image: 'https://grandex.de/wp-content/uploads/2025/02/1732025731_a2ffe1f614e25c297f73-17.jpg',
    features: ['Leather', 'WiFi', 'Drinks'],
    details: 'Luxury and comfort for a premium experience. Ideal for business trips or special occasions.',
    icon: 'crown',
    badge: 'Premium',
    badgeColor: 'purple',
    popularity: 60,
  },
  {
    type: 'luxury' as VehicleType,
    name: 'SUV',
    ratePerKm: 0.7,
    capacity: 6,
    time: '~11 min',
    image: 'https://media.istockphoto.com/id/1348551471/photo/night-photo-of-a-cadillac-escalade-luxury-suv-limo-used-for-uber-and-lyft.jpg?s=612x612&w=0&k=20&c=o6z49qXSxzjUm6JR8ml2QQNxs1E1oBgJOktZwYAWkZo=',
    features: ['Spacious', 'Luggage', 'Safety'],
    details: 'Spacious and robust, perfect for groups or extra luggage. Comfort for up to 6 passengers.',
    icon: 'suv-pickup',
    badge: 'Adventure',
    badgeColor: 'green',
    popularity: 70,
  },
  {
    type: 'xl' as VehicleType,
    name: 'XL',
    ratePerKm: 1.0,
    capacity: 8,
    time: '~9 min',
    image: 'https://www.topgear.com/sites/default/files/2024/02/2024-cadillac-escalade-v-series-010.jpg',
    features: ['Extra Space', 'Luggage'],
    details: 'Extra-large vehicle for big groups or lots of luggage. Comfortably seats up to 8 passengers.',
    icon: 'truck-pickup',
    badge: 'Group',
    badgeColor: 'blue',
    popularity: 40,
  },
]

// Sample driver data
const drivers = [
  { name: 'John Doe', vehicle: 'Toyota Camry', licensePlate: 'XYZ-1234', vehicleType: 'standard' as VehicleType },
  { name: 'Michael Smith', vehicle: 'BMW 5 Series', licensePlate: 'ABC-5678', vehicleType: 'premium' as VehicleType },
  { name: 'David Johnson', vehicle: 'Cadillac Escalade', licensePlate: 'DEF-9012', vehicleType: 'luxury' as VehicleType },
  { name: 'Robert Williams', vehicle: 'Mercedes Sprinter', licensePlate: 'GHI-3456', vehicleType: 'xl' as VehicleType },
  { name: 'James Brown', vehicle: 'Honda Accord', licensePlate: 'JKL-7890', vehicleType: 'standard' as VehicleType },
  { name: 'William Davis', vehicle: 'Audi A6', licensePlate: 'MNO-2345', vehicleType: 'premium' as VehicleType },
]

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null)
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [datetime, setDatetime] = useState('')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [driverDistance, setDriverDistance] = useState(4.6)
  const [driverETA, setDriverETA] = useState(8)
  const [driverInfo, setDriverInfo] = useState<{ name: string; vehicle: string; licensePlate: string }>({
    name: 'John Doe',
    vehicle: 'Toyota Camry',
    licensePlate: 'XYZ-1234',
  })
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showVehicleInfo, setShowVehicleInfo] = useState(false)
  const [estimatedDistance, setEstimatedDistance] = useState(0)
  const [estimatedFare, setEstimatedFare] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [recentLocations, setRecentLocations] = useState<string[]>([])
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>([])
  const [homeLocation, setHomeLocation] = useState<string>('')
  const [workLocation, setWorkLocation] = useState<string>('')
  const [popularDestinations, setPopularDestinations] = useState<Record<string, number>>({})
  const [showSuggestions, setShowSuggestions] = useState<'pickup' | 'destination' | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentLocationAddress, setCurrentLocationAddress] = useState<string>('')
  const [recommendedVehicle, setRecommendedVehicle] = useState<VehicleType | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [scheduledRides, setScheduledRides] = useState<any[]>([])
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [showVideoPlayButton, setShowVideoPlayButton] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [animatedStats, setAnimatedStats] = useState({
    happyRiders: 0,
    drivers: 0,
    completedRides: 0,
    rating: 0,
  })
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }

      // Load recent and favorite locations
      const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setRecentLocations(recent.slice(0, 5))
      setFavoriteLocations(favorites.slice(0, 5))
      
      // Load saved places (Home, Work)
      const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '{}')
      setHomeLocation(savedPlaces.home || '')
      setWorkLocation(savedPlaces.work || '')
      
      // Load popular destinations usage stats
      const popularStats = JSON.parse(localStorage.getItem('popularDestinations') || '{}')
      setPopularDestinations(popularStats)
      
      // Load scheduled rides
      const scheduled = JSON.parse(localStorage.getItem('scheduledRides') || '[]')
      // Filter out past scheduled rides
      const activeScheduled = scheduled.filter((ride: any) => {
        const rideDate = new Date(ride.datetime)
        return rideDate > new Date()
      })
      setScheduledRides(activeScheduled.sort((a: any, b: any) => 
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      ))

      // Auto-advance carousel
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % vehicles.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [])

  // Reload trips when component mounts or when storage changes
  useEffect(() => {
    const loadTrips = () => {
      if (typeof window !== 'undefined') {
        const trips = JSON.parse(localStorage.getItem('trips') || '[]')
        // Get all recent trips (completed or upcoming), sorted by most recent, limit to 3
        const recentTripsList = trips
          .filter((trip: Trip) => {
            if (!trip || !trip.status) return false
            const status = trip.status.toLowerCase().trim()
            return status === 'completed' || status === 'upcoming' || status === 'in-progress'
          })
          .sort((a: Trip, b: Trip) => {
            // Sort by date, most recent first
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return dateB - dateA
          })
          .slice(0, 3)
        setRecentTrips(recentTripsList)
      }
    }

    loadTrips()

    // Listen for storage changes (when trips are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'trips') {
        loadTrips()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for changes (in case of same-tab updates)
    const interval = setInterval(loadTrips, 2000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Update driver info based on selected vehicle or default
  useEffect(() => {
    if (selectedVehicle) {
      // Find a driver for the selected vehicle type
      const availableDrivers = drivers.filter(d => d.vehicleType === selectedVehicle)
      if (availableDrivers.length > 0) {
        const randomDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)]
        setDriverInfo({
          name: randomDriver.name,
          vehicle: randomDriver.vehicle,
          licensePlate: randomDriver.licensePlate,
        })
      }
    } else {
      // Default driver
      setDriverInfo({
        name: 'John Doe',
        vehicle: 'Toyota Camry',
        licensePlate: 'XYZ-1234',
      })
    }
  }, [selectedVehicle])

  // Update driver distance and ETA based on user input (pickup/destination)
  useEffect(() => {
    if (pickup && destination && estimatedDistance > 0) {
      // When user provides pickup and destination, calculate estimated distance
      // Calculate initial driver distance (driver starts further away when booking)
      // Driver distance should be a realistic portion of total trip (e.g., 20-40% of trip distance)
      const initialDriverDistance = Math.min(Math.max(estimatedDistance * 0.25, 2), 8) // 25% of trip, min 2km, max 8km
      setDriverDistance(parseFloat(initialDriverDistance.toFixed(1)))
      
      // Calculate ETA based on distance and average city speed (40 km/h)
      const averageSpeed = 40 // km/h
      const driverETAValue = Math.max(1, Math.round((initialDriverDistance / averageSpeed) * 60))
      setDriverETA(driverETAValue)
    } else if (!pickup || !destination) {
      // Default values when no pickup/destination
      setDriverDistance(4.6)
      setDriverETA(7)
    }
  }, [pickup, destination, estimatedDistance, estimatedTime])

  useEffect(() => {
    // Simulate live driver tracking with realistic updates
    // Average city speed: 35-45 km/h (use 40 km/h average)
    // Update every 3 seconds (realistic GPS update interval)
    const averageSpeed = 40 // km/h
    const updateInterval = 3000 // 3 seconds
    const distancePerUpdate = (averageSpeed / 3600) * (updateInterval / 1000) // km per update
    
    if (pickup && destination && driverDistance > 0.05) {
      const interval = setInterval(() => {
        setDriverDistance((prev) => {
          // Realistic distance decrease with slight variation (traffic, lights, etc.)
          const variation = 0.8 + (Math.random() * 0.4) // 80% to 120% of normal speed
          const decrease = distancePerUpdate * variation
          const newDistance = Math.max(0.05, prev - decrease)
          
          // Calculate ETA based on remaining distance and speed
          const remainingETA = Math.max(1, Math.round((newDistance / averageSpeed) * 60))
          setDriverETA(remainingETA)
          
          return parseFloat(newDistance.toFixed(1))
        })
      }, updateInterval)
      return () => clearInterval(interval)
    } else if (!pickup || !destination) {
      // Keep updating with default simulation when no input
      const interval = setInterval(() => {
        setDriverDistance((prev) => {
          const variation = 0.8 + (Math.random() * 0.4)
          const decrease = distancePerUpdate * variation
          const newDistance = Math.max(0.05, prev - decrease)
          
          const remainingETA = Math.max(1, Math.round((newDistance / averageSpeed) * 60))
          setDriverETA(remainingETA)
          
          return parseFloat(newDistance.toFixed(1))
        })
      }, updateInterval)
      return () => clearInterval(interval)
    }
  }, [pickup, destination, driverDistance])

  // Animated Stats Counter with Scroll Detection
  const animateCounters = useCallback(() => {
    setStatsVisible(true)
    
    // Reset to 0 first
    setAnimatedStats({
      happyRiders: 0,
      drivers: 0,
      completedRides: 0,
      rating: 0,
    })
    
    // Animate counters
    const targets = {
      happyRiders: 500,
      drivers: 30,
      completedRides: 500,
      rating: 4.9,
    }

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const animate = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setAnimatedStats({
        happyRiders: Math.floor(targets.happyRiders * easeOutQuart),
        drivers: Math.floor(targets.drivers * easeOutQuart),
        completedRides: Math.floor(targets.completedRides * easeOutQuart),
        rating: parseFloat((targets.rating * easeOutQuart).toFixed(1)),
      })

      if (currentStep >= steps) {
        clearInterval(animate)
        setAnimatedStats(targets)
      }
    }, stepDuration)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observerOptions = {
      threshold: 0.2,
      rootMargin: '50px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsVisible) {
          animateCounters()
        }
      })
    }, observerOptions)

    // Check if stats section exists and observe it
    const statsSection = document.getElementById('stats-section')
    if (statsSection) {
      observer.observe(statsSection)
    }

    return () => {
      if (statsSection) {
        observer.unobserve(statsSection)
      }
    }
  }, [statsVisible, animateCounters])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handlePlay = () => setShowVideoPlayButton(false)
      const handlePause = () => setShowVideoPlayButton(true)
      const handleEnded = () => setShowVideoPlayButton(true)

      video.addEventListener('play', handlePlay)
      video.addEventListener('pause', handlePause)
      video.addEventListener('ended', handleEnded)

      return () => {
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('pause', handlePause)
        video.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  // Smart location suggestions
  const generateLocationSuggestions = useCallback((query: string): string[] => {
    const allLocations = [
      '123 Main Street, New York, NY',
      '456 Park Avenue, New York, NY',
      '789 Broadway, New York, NY',
      'JFK Airport, New York, NY',
      'LaGuardia Airport, New York, NY',
      'Times Square, New York, NY',
      'Central Park, New York, NY',
      'Empire State Building, New York, NY',
      'Brooklyn Bridge, New York, NY',
      'Statue of Liberty, New York, NY',
      ...recentLocations,
      ...favoriteLocations,
    ]

    if (!query || query.length < 2) return []
    
    return allLocations
      .filter(loc => loc.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .sort((a, b) => {
        // Prioritize recent and favorites
        const aIsRecent = recentLocations.includes(a)
        const bIsRecent = recentLocations.includes(b)
        const aIsFavorite = favoriteLocations.includes(a)
        const bIsFavorite = favoriteLocations.includes(a)
        
        if (aIsFavorite && !bIsFavorite) return -1
        if (!aIsFavorite && bIsFavorite) return 1
        if (aIsRecent && !bIsRecent) return -1
        if (!aIsRecent && bIsRecent) return 1
        return 0
      })
  }, [recentLocations, favoriteLocations])

  // Smart fare calculation
  useEffect(() => {
    if (pickup && destination) {
      // Simulate distance calculation (in real app, use geocoding API)
      // Generate consistent distance based on input strings for better UX
      const inputHash = (pickup + destination).length
      const distance = (inputHash % 20) + 5 // 5-25 km based on input
      const time = Math.round(distance * 2) // Estimated time in minutes
      
      setEstimatedDistance(parseFloat(distance.toFixed(1)))
      setEstimatedTime(time)
      
      // Calculate fare only if vehicle is selected
      if (selectedVehicle) {
        const vehicle = vehicles.find(v => v.type === selectedVehicle)
        if (vehicle) {
          const baseFare = 10
          const distanceFare = distance * vehicle.ratePerKm
          const timeFare = time * 0.5 // Time in minutes * rate
          const total = baseFare + distanceFare + timeFare
          setEstimatedFare(parseFloat(total.toFixed(2)))
        }
      }
    } else {
      // Reset estimates when no pickup/destination
      setEstimatedDistance(0)
      setEstimatedTime(0)
      setEstimatedFare(0)
    }
  }, [pickup, destination, selectedVehicle])

  // Smart vehicle recommendation
  useEffect(() => {
    if (pickup && destination) {
      // Recommend based on distance, time, and user preferences
      const distance = estimatedDistance || Math.random() * 20 + 5
      const isLongDistance = distance > 15
      const isGroup = false // Could be determined from user history
      
      if (isLongDistance) {
        setRecommendedVehicle('premium')
      } else if (isGroup) {
        setRecommendedVehicle('xl')
      } else {
        setRecommendedVehicle('standard')
      }
    }
  }, [pickup, destination, estimatedDistance])

  // Smart Current Location Detection with Reverse Geocoding
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Location services are not supported on this device')
      return
    }

    setIsGettingLocation(true)
    const loadingToast = toast.loading('Detecting your location...')

      navigator.geolocation.getCurrentPosition(
      async (position) => {
          const { latitude, longitude } = position.coords
        
        try {
          // Reverse geocoding to get address (using free Nominatim API)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Luxride Taxi App'
              }
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            const address = data.display_name || `${data.address?.road || ''}, ${data.address?.city || data.address?.town || data.address?.village || ''}`.trim() || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
            
            const locationString = address || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
            
            // Set pickup location
            setPickup(locationString)
            setCurrentLocationAddress(locationString)
            
            // Smart: Auto-save to recent locations
            if (typeof window !== 'undefined') {
              const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
              if (!recent.includes(locationString)) {
                recent.unshift(locationString)
                setRecentLocations(recent.slice(0, 5))
                localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
              }
            }
            
            toast.dismiss(loadingToast)
            toast.success('📍 Location detected and set as pickup!')
            
            // Smart: If destination is empty, suggest popular destinations
            if (!destination) {
              setTimeout(() => {
                toast('💡 Tip: Select a destination to continue booking', { duration: 3000 })
              }, 1000)
            }
    } else {
            // Fallback to coordinates if geocoding fails
            const locationString = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
            setPickup(locationString)
            setCurrentLocationAddress(locationString)
            toast.dismiss(loadingToast)
            toast.success('📍 Location detected!')
          }
        } catch (error) {
          // Fallback to coordinates if geocoding fails
          const locationString = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          setPickup(locationString)
          setCurrentLocationAddress(locationString)
          toast.dismiss(loadingToast)
          toast.success('📍 Location detected!')
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        toast.dismiss(loadingToast)
        
        // Smart error messages based on error type
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('📍 Location access denied. Please enable location permissions in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('📍 Location information unavailable. Please enter manually.')
            break
          case error.TIMEOUT:
            toast.error('📍 Location request timed out. Please try again.')
            break
          default:
            toast.error('📍 Unable to access location. Please enter manually.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleVehicleSelect = (vehicleType: VehicleType) => {
    setSelectedVehicle(vehicleType)
    setShowVehicleInfo(true)
    setRecommendedVehicle(null) // Clear recommendation after selection
  }

  // Touch handlers for carousel swipe
  // New improved slider state and handlers
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
    setDragOffset(0)
  }

  const handleSliderTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = dragStart - currentX
    setDragOffset(diff)
  }

  const handleSliderTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 50
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        setCarouselIndex((prev) => (prev + 1) % vehicles.length)
      } else {
        setCarouselIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length)
      }
    }
    
    setIsDragging(false)
    setDragOffset(0)
    setDragStart(0)
  }

  const handlePickupChange = (value: string) => {
    setPickup(value)
    if (value.length >= 2) {
      const suggestions = generateLocationSuggestions(value)
      setPickupSuggestions(suggestions)
      setShowSuggestions('pickup')
    } else {
      setPickupSuggestions([])
      setShowSuggestions(null)
    }
  }

  const handleDestinationChange = (value: string) => {
    setDestination(value)
    if (value.length >= 2) {
      const suggestions = generateLocationSuggestions(value)
      setDestinationSuggestions(suggestions)
      setShowSuggestions('destination')
    } else {
      setDestinationSuggestions([])
      setShowSuggestions(null)
    }
  }

  const handleSelectLocation = (location: string, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickup(location)
      setPickupSuggestions([])
    } else {
      setDestination(location)
      setDestinationSuggestions([])
    }
    setShowSuggestions(null)

    // Save to recent locations
    if (typeof window !== 'undefined') {
      const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
      if (!recent.includes(location)) {
        recent.unshift(location)
        setRecentLocations(recent.slice(0, 5))
        localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedVehicle || !pickup || !destination) {
      toast.error('Please complete all required fields and select a vehicle')
      return
    }

    setIsBooking(true)
    const vehicle = vehicles.find(v => v.type === selectedVehicle)
    const distance = estimatedDistance || Math.random() * 15 + 5
    const fare = estimatedFare > 0 ? estimatedFare : (distance * vehicle!.ratePerKm + 10)

    // Simulate booking delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500))

    const booking: Booking = {
      id: `ride-${Date.now()}`,
      pickup,
      destination,
      date: datetime.split('T')[0] || new Date().toISOString().split('T')[0],
      time: datetime.split('T')[1] || new Date().toTimeString().split(' ')[0],
      datetime: datetime || new Date().toISOString(),
      vehicleType: selectedVehicle,
      vehicleName: vehicle!.name,
      price: fare,
      status: 'requested',
      timestamp: new Date().toISOString(),
      distance: parseFloat(distance.toFixed(1)),
      duration: estimatedTime || Math.round(distance * 2),
    }

    // Save booking
    if (typeof window !== 'undefined') {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
      bookings.unshift(booking)
      localStorage.setItem('bookings', JSON.stringify(bookings))

      const trips = JSON.parse(localStorage.getItem('trips') || '[]')
      trips.unshift({
        id: booking.id,
        route: `${pickup} to ${destination}`,
        date: booking.date,
        type: vehicle!.name,
        price: fare,
        status: 'Upcoming',
      })
      localStorage.setItem('trips', JSON.stringify(trips))

      // Create notification for inbox
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'booking_confirmed',
        title: 'Ride Booked Successfully',
        message: `Your ride from ${pickup} to ${destination} has been booked. ${vehicle!.name} will pick you up.`,
        timestamp: new Date().toISOString(),
        read: false,
        booking: booking,
      }
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      notifications.unshift(notification)
      localStorage.setItem('notifications', JSON.stringify(notifications))

      // Save to recent locations
      const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
      if (!recent.includes(pickup)) recent.unshift(pickup)
      if (!recent.includes(destination)) recent.unshift(destination)
      localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
    }

    setIsBooking(false)
    toast.success('Ride booked successfully. Your driver has been notified.')
    
    // Refresh recent trips for quick rebook
    if (typeof window !== 'undefined') {
      const trips = JSON.parse(localStorage.getItem('trips') || '[]')
      const recentTripsList = trips
        .filter((trip: Trip) => {
          const status = trip.status.toLowerCase()
          return status === 'completed' || status === 'upcoming'
        })
        .sort((a: Trip, b: Trip) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateB - dateA
        })
        .slice(0, 3)
      setRecentTrips(recentTripsList)
    }
    
    // Reset form
    setPickup('')
    setDestination('')
    setDatetime('')
    setSelectedVehicle(null)
    setShowVehicleInfo(false)
    setEstimatedDistance(0)
    setEstimatedFare(0)
    setEstimatedTime(0)
  }

  const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle)

  // Smart estimate fare calculation
  const calculateFareEstimate = (distance: number, vehicleType: VehicleType) => {
    const vehicle = vehicles.find(v => v.type === vehicleType)
    if (!vehicle) return 0
    const baseFare = 10
    const distanceFare = distance * vehicle.ratePerKm
    const timeFare = (distance * 2) * 0.5
    return baseFare + distanceFare + timeFare
  }

  // Quick Rebook handler
  const handleQuickRebook = (trip: Trip) => {
    // Parse route (format: "Location A to Location B")
    const routeParts = trip.route.split(' to ')
    if (routeParts.length === 2) {
      setPickup(routeParts[0].trim())
      setDestination(routeParts[1].trim())
      
      // Find and select the vehicle type based on trip type
      const vehicleType = vehicles.find(v => v.name.toLowerCase() === trip.type.toLowerCase())?.type
      if (vehicleType) {
        setSelectedVehicle(vehicleType)
      }
      
      // Set current date/time for immediate booking
      const now = new Date()
      const dateTime = now.toISOString().slice(0, 16)
      setDatetime(dateTime)
      
      toast.success('Trip details loaded! Review and book your ride.')
      
      // Scroll to booking form
      setTimeout(() => {
        const formElement = document.getElementById('booking-form')
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  // Saved Places handlers - Smart & Intelligent
  const handleSetHome = () => {
    const location = pickup || destination
    if (location && location.trim()) {
      const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '{}')
      savedPlaces.home = location.trim()
      localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces))
      setHomeLocation(location.trim())
      
      // Smart: Auto-add to favorites if not already there
      if (!favoriteLocations.includes(location.trim())) {
        const favorites = [...favoriteLocations, location.trim()]
        setFavoriteLocations(favorites)
        localStorage.setItem('favorites', JSON.stringify(favorites))
      }
      
      toast.success('Home location saved!')
    } else {
      // Smart: Suggest from recent locations or favorites
      const suggestions = [...recentLocations, ...favoriteLocations].filter(Boolean)
      const suggestionText = suggestions.length > 0 ? `\n\nSuggestions: ${suggestions.slice(0, 3).join(', ')}` : ''
      const input = prompt(`Enter your home address:${suggestionText}`)
      if (input && input.trim()) {
        const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '{}')
        savedPlaces.home = input.trim()
        localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces))
        setHomeLocation(input.trim())
        
        // Auto-add to favorites
        if (!favoriteLocations.includes(input.trim())) {
          const favorites = [...favoriteLocations, input.trim()]
          setFavoriteLocations(favorites)
          localStorage.setItem('favorites', JSON.stringify(favorites))
        }
        
        toast.success('Home location saved!')
      }
    }
  }

  const handleSetWork = () => {
    const location = pickup || destination
    if (location && location.trim()) {
      const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '{}')
      savedPlaces.work = location.trim()
      localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces))
      setWorkLocation(location.trim())
      
      // Smart: Auto-add to favorites if not already there
      if (!favoriteLocations.includes(location.trim())) {
        const favorites = [...favoriteLocations, location.trim()]
        setFavoriteLocations(favorites)
        localStorage.setItem('favorites', JSON.stringify(favorites))
      }
      
      toast.success('Work location saved!')
    } else {
      // Smart: Suggest from recent locations or favorites
      const suggestions = [...recentLocations, ...favoriteLocations].filter(Boolean)
      const suggestionText = suggestions.length > 0 ? `\n\nSuggestions: ${suggestions.slice(0, 3).join(', ')}` : ''
      const input = prompt(`Enter your work address:${suggestionText}`)
      if (input && input.trim()) {
        const savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '{}')
        savedPlaces.work = input.trim()
        localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces))
        setWorkLocation(input.trim())
        
        // Auto-add to favorites
        if (!favoriteLocations.includes(input.trim())) {
          const favorites = [...favoriteLocations, input.trim()]
          setFavoriteLocations(favorites)
          localStorage.setItem('favorites', JSON.stringify(favorites))
        }
        
        toast.success('Work location saved!')
      }
    }
  }

  const handleSelectSavedPlace = (location: string, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickup(location)
      setShowSuggestions(null)
      // Smart: If destination is empty and we have work/home, suggest the opposite
      if (!destination) {
        if (location === homeLocation && workLocation) {
          // If selecting home as pickup, suggest work as destination
          setTimeout(() => {
            toast('💡 Tip: Select Work as destination?', { duration: 3000 })
          }, 500)
        } else if (location === workLocation && homeLocation) {
          // If selecting work as pickup, suggest home as destination
          setTimeout(() => {
            toast('💡 Tip: Select Home as destination?', { duration: 3000 })
          }, 500)
        }
      }
    } else {
      setDestination(location)
      setShowSuggestions(null)
      
      // Smart: Track popular destinations usage
      const stats = { ...popularDestinations }
      stats[location] = (stats[location] || 0) + 1
      setPopularDestinations(stats)
      localStorage.setItem('popularDestinations', JSON.stringify(stats))
      
      // Smart: Auto-add to favorites if used frequently (3+ times)
      if (stats[location] >= 3 && !favoriteLocations.includes(location)) {
        const favorites = [...favoriteLocations, location]
        setFavoriteLocations(favorites)
        localStorage.setItem('favorites', JSON.stringify(favorites))
        toast.success(`✨ ${location} added to favorites (frequently used)!`)
      }
    }
    toast.success('Location selected!')
    
    // Auto-calculate fare if vehicle is selected
    if (selectedVehicle && (type === 'pickup' ? destination : pickup)) {
      const distance = estimatedDistance || Math.random() * 15 + 5
      const vehicle = vehicles.find(v => v.type === selectedVehicle)
      if (vehicle) {
        const baseFare = 10
        const distanceFare = distance * vehicle.ratePerKm
        const timeFare = (distance * 2) * 0.5
        const total = baseFare + distanceFare + timeFare
        setEstimatedFare(parseFloat(total.toFixed(2)))
        setEstimatedDistance(distance)
        setEstimatedTime(Math.round(distance * 2))
      }
    }
  }

  const handleAddFavorite = () => {
    const location = pickup || destination
    if (!location || location.trim() === '') {
      // Smart: Try to get from recent locations if form is empty
      if (recentLocations.length > 0) {
        const input = prompt('Enter location to add to favorites:', recentLocations[0])
        if (input && input.trim()) {
          const loc = input.trim()
          if (!favoriteLocations.includes(loc)) {
            const favorites = [...favoriteLocations, loc]
            setFavoriteLocations(favorites)
            localStorage.setItem('favorites', JSON.stringify(favorites))
            toast.success('Added to favorites!')
          } else {
            toast.error('Already in favorites')
          }
        }
      } else {
        toast.error('Please enter a location first')
      }
      return
    }
    
    if (favoriteLocations.includes(location)) {
      toast.error('Already in favorites')
    } else {
      const favorites = [...favoriteLocations, location]
      setFavoriteLocations(favorites)
      localStorage.setItem('favorites', JSON.stringify(favorites))
      toast.success('Added to favorites!')
    }
  }

  const handleRemoveFavorite = (location: string) => {
    const favorites = favoriteLocations.filter(fav => fav !== location)
    setFavoriteLocations(favorites)
    localStorage.setItem('favorites', JSON.stringify(favorites))
    toast.success('Removed from favorites')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section with Smart Map */}
        <section className="hero-section text-gray-800 w-full py-8 md:py-12 relative overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col items-center max-w-7xl">
            {/* Compact Hero Header - Positioned above map */}
            <div className="relative mb-4 flex items-center justify-center gap-3">
              {/* Small car icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm animate-pulse"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-md">
                  <Car className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Compact heading with background design */}
              <div className="relative px-4 py-2 bg-cream rounded-xl border border-primary/20 shadow-md">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 rounded-xl"></div>
                
                {/* Text */}
                <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                  Go anywhere with Luxride
                </h2>
              </div>
            </div>
            
            {/* Circular Map Container */}
            <div className="relative mb-8 w-full max-w-[400px] h-[400px] flex items-center justify-center z-0">
              {/* Decorative Elements */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow z-0"></div>
              <div className="absolute inset-[-20px] rounded-full border border-primary/20 z-0"></div>
              
              {/* Map Container */}
              <div className="relative w-[350px] h-[350px] md:w-[380px] md:h-[380px] rounded-full overflow-hidden border-4 border-primary shadow-2xl shadow-primary/30 animate-fade-in hover:scale-105 transition-transform duration-300 z-0">
                <HomeMapComponent />
                {/* Compass */}
                <div className="absolute top-3 right-3 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-primary z-10 cursor-pointer hover:scale-110 transition-transform">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                {/* Map Label */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-primary z-10 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" strokeWidth={2.5} fill="currentColor" />
                  Your Location
                </div>
              </div>
            </div>

            {/* Live Driver Tracking with Smart Updates */}
            <Card className="w-full max-w-[500px] mb-6 border-2 border-primary/20 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary-dark"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary animate-pulse" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Live Driver Tracking</h3>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary-dark/20 text-primary-dark rounded-full text-xs font-semibold flex items-center gap-1 border border-primary/30">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-lg p-3 border border-primary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      <span className="text-xs text-gray-700 font-medium">Distance</span>
                    </div>
                    <div className="text-lg font-bold text-primary-dark">
                      {driverDistance < 0.1 ? '< 0.1' : driverDistance.toFixed(1)} km
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-lg p-3 border border-primary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-700 font-medium">Estimated Arrival</span>
                    </div>
                    <div className="text-lg font-bold text-primary-dark">
                      {driverETA === 0 ? '< 1 min' : driverETA === 1 ? '1 min' : `${driverETA} min`}
                    </div>
                  </div>
                </div>

                {/* Tracking Map */}
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative mb-4 border border-gray-300 shadow-inner">
                  {/* Map-like background with subtle grid */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px),
                                      repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)`
                    }}></div>
                  </div>
                  
                  {/* Road path */}
                  <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-400 transform -translate-y-1/2 shadow-inner">
                    {/* Road center line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-yellow-300 transform -translate-y-1/2"></div>
                    {/* Progress indicator */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-3000 ease-linear" 
                      style={{ width: `${Math.min(100, Math.max(0, 100 - ((driverDistance / 5) * 100)))}%` }}
                    ></div>
                  </div>
                  
                  {/* Connection line between driver and user */}
                  <svg className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
                    <line 
                      x1={`${Math.min(85, Math.max(5, 5 + ((5 - driverDistance) / 5) * 80))}%`}
                      y1="50%"
                      x2="90%"
                      y2="50%"
                      stroke="rgba(212, 175, 55, 0.3)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  </svg>
                  
                  {/* User Marker (Pickup Location) - Fixed position */}
                  <div className="absolute top-1/2 right-[10%] transform -translate-y-1/2 z-20">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full shadow-xl border-4 border-white flex items-center justify-center relative">
                      <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} fill="currentColor" />
                      {/* Pulse ring */}
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30"></div>
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-primary-dark bg-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap border border-primary/20">
                      Your Location
                    </div>
                  </div>
                  
                  {/* Driver Marker - Moving */}
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 z-20 transition-all duration-3000 ease-linear"
                    style={{ left: `${Math.min(85, Math.max(5, 5 + ((5 - driverDistance) / 5) * 80))}%` }}
                  >
                    <div className="w-10 h-10 bg-primary rounded-full shadow-xl border-2 border-white flex items-center justify-center relative">
                      <Car className="w-6 h-6 text-white" />
                      {/* Pulse ring for live tracking */}
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40"></div>
                  </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-primary bg-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                      Driver
                  </div>
                </div>

                  {/* Status Message */}
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <div className="inline-block bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-primary/20">
                      <p className="text-xs font-semibold text-primary-dark">
                        {driverDistance < 0.1 
                          ? '✓ Driver has arrived at pickup location' 
                          : driverDistance < 0.3 
                          ? 'Driver is approaching your location' 
                          : driverDistance < 0.8 
                          ? 'Driver is nearby, please be ready' 
                          : driverDistance < 1.5 
                          ? 'Driver is less than 2 minutes away' 
                          : driverDistance < 3 
                          ? 'Driver is on the way to pickup' 
                          : 'Driver is heading to your location'}
                      </p>
                  </div>
                  </div>
                  </div>

              </Card>

            {/* New Vehicle Slider - Matching Choose Your Ride Width */}
            <div className="w-full max-w-[800px] mx-auto mb-6">
              <div 
                className="relative w-full overflow-hidden rounded-2xl shadow-xl border border-gray-200"
                onTouchStart={handleSliderTouchStart}
                onTouchMove={handleSliderTouchMove}
                onTouchEnd={handleSliderTouchEnd}
              >
                {/* Slider Container */}
                <div 
                  className="flex transition-transform duration-300 ease-out h-[400px] sm:h-[350px] md:h-[380px] lg:h-[400px]"
                  style={{ 
                    transform: `translateX(calc(-${carouselIndex * 100}% + ${isDragging ? -dragOffset : 0}px))`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                  }}
                >
                  {vehicles.map((vehicle, index) => (
                    <div 
                      key={vehicle.type} 
                      className="min-w-full w-full h-full relative flex-shrink-0 flex items-center justify-center bg-gray-100"
                    >
                      {/* Full Photo - 100% Fit */}
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-contain"
                        style={{ 
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'contain'
                        }}
                        loading={index === carouselIndex ? 'eager' : 'lazy'}
                        fetchPriority={index === carouselIndex ? 'high' : 'auto'}
                        sizes="(max-width: 640px) 100vw, 800px"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                      
                      {/* Vehicle Info Overlay - Top Position */}
                      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 text-white z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-bold text-xl sm:text-2xl md:text-3xl mb-1">{vehicle.name}</div>
                            <div className="text-base sm:text-lg md:text-xl opacity-90 font-semibold">
                              {formatCurrency(vehicle.ratePerKm)}/km
                            </div>
                          </div>
                          <div className="bg-black/70 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold">
                            {vehicle.badge}
                          </div>
                        </div>
                        {/* Vehicle Features */}
                        <div className="flex flex-wrap gap-2">
                          {vehicle.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="text-xs sm:text-sm bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length)}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/70 hover:bg-black/90 active:bg-black rounded-full flex items-center justify-center text-white transition-all shadow-lg z-20"
                  aria-label="Previous vehicle"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % vehicles.length)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/70 hover:bg-black/90 active:bg-black rounded-full flex items-center justify-center text-white transition-all shadow-lg z-20"
                  aria-label="Next vehicle"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {vehicles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`rounded-full transition-all duration-300 ${
                        index === carouselIndex 
                          ? 'bg-primary w-10 h-2.5 shadow-lg' 
                          : 'bg-white/60 w-2.5 h-2.5 hover:bg-white/80'
                      }`}
                      aria-label={`Go to vehicle ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Vehicle Selection */}
            <Card className="w-full max-w-[800px] mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark"></div>
              
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Car className="w-8 h-8 text-primary animate-pulse" />
                  <h3 className="text-3xl font-bold font-serif">Choose Your Ride</h3>
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-dark mx-auto mb-4 rounded-full"></div>
                <p className="text-gray-600">Select the perfect vehicle for your journey</p>
                
                {/* Smart Recommendation */}
                {recommendedVehicle && !selectedVehicle && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center gap-2 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-gray-800">
                      Recommended: <span className="text-primary">{vehicles.find(v => v.type === recommendedVehicle)?.name}</span> based on your route
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicle Grid with Smart Sorting */}
              <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 mb-6">
                {vehicles
                  .sort((a, b) => {
                    // Show recommended first
                    if (a.type === recommendedVehicle) return -1
                    if (b.type === recommendedVehicle) return 1
                    // Then by popularity
                    return b.popularity - a.popularity
                  })
                  .map((vehicle) => (
                  <button
                    key={vehicle.type}
                    onClick={() => handleVehicleSelect(vehicle.type)}
                    className={`
                      relative p-4 md:p-4 rounded-2xl transition-all duration-300 overflow-hidden group w-full
                      ${selectedVehicle === vehicle.type
                        ? 'bg-primary/10 border-2 border-primary shadow-lg transform scale-105 ring-2 ring-primary/50'
                        : recommendedVehicle === vehicle.type && !selectedVehicle
                        ? 'bg-primary/5 border-2 border-primary/50 shadow-md hover:border-primary'
                        : 'bg-cream border-2 border-gray-200 hover:border-primary/50 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Recommended Badge */}
                    {recommendedVehicle === vehicle.type && !selectedVehicle && (
                      <div className="absolute top-2 right-2 z-10 bg-primary text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        Recommended
                      </div>
                    )}

                    {/* Vehicle Image */}
                    <div className="relative h-40 md:h-32 rounded-xl overflow-hidden mb-3">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        style={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }}
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      {/* Badge */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {vehicle.badge}
                      </div>
                      {selectedVehicle === vehicle.type && (
                        <div className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Info */}
                    <div className="text-center">
                      <div className="font-bold text-gray-800 mb-1">{vehicle.name}</div>
                      <div className="text-primary font-bold text-sm mb-2">${vehicle.ratePerKm.toFixed(2)}/km</div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{vehicle.capacity} seats</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{vehicle.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {vehicle.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="text-xs bg-cream-light text-gray-600 px-1.5 py-0.5 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Vehicle Info with Smart Details */}
              {selectedVehicle && showVehicleInfo && selectedVehicleData && (
                <Card className="mb-6 border-2 border-primary/20 animate-fade-in">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t-2xl"></div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold font-serif">{selectedVehicleData.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{selectedVehicleData.details}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 bg-cream-light rounded-xl border border-gray-200 hover:border-primary transition-colors">
                      <div className="text-primary font-bold text-lg">${selectedVehicleData.ratePerKm.toFixed(2)}/km</div>
                      <div className="text-xs text-gray-600 mt-1">Price</div>
                    </div>
                    <div className="text-center p-3 bg-cream-light rounded-xl border border-gray-200 hover:border-primary transition-colors">
                      <div className="text-primary font-bold text-lg">{selectedVehicleData.capacity}</div>
                      <div className="text-xs text-gray-600 mt-1">Seats</div>
                    </div>
                    <div className="text-center p-3 bg-cream-light rounded-xl border border-gray-200 hover:border-primary transition-colors">
                      <div className="text-primary font-bold text-lg">{selectedVehicleData.time}</div>
                      <div className="text-xs text-gray-600 mt-1">Est. Time</div>
                    </div>
                    <div className="text-center p-3 bg-cream-light rounded-xl border border-gray-200 hover:border-primary transition-colors">
                      <div className="text-primary font-bold text-lg">Premium</div>
                      <div className="text-xs text-gray-600 mt-1">Quality</div>
                    </div>
                  </div>

                  {/* Smart Fare Preview */}
                  {pickup && destination && estimatedFare > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-xl border border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">Estimated Fare:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(estimatedFare)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Distance: {estimatedDistance} km • Time: ~{estimatedTime} min
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setShowVehicleInfo(false)
                      setSelectedVehicle(null)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Change Vehicle
                  </Button>
                </Card>
              )}

              {/* Smart Booking Form */}
              <Card>
                {/* Smart Fare Estimator */}
                <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="text-primary w-5 h-5" />
                    Smart Fare Estimator
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Distance (km)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 10"
                        className="w-full"
                        min={1}
                        max={100}
                        id="est-distance"
                        onChange={(e) => {
                          const distance = parseFloat(e.target.value)
                          if (distance && selectedVehicle) {
                            const fare = calculateFareEstimate(distance, selectedVehicle)
                            setEstimatedFare(fare)
                            setEstimatedDistance(distance)
                            setEstimatedTime(Math.round(distance * 2))
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Vehicle Type</label>
                      <select
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary text-sm"
                        onChange={(e) => {
                          const distanceInput = document.getElementById('est-distance') as HTMLInputElement
                          const distance = parseFloat(distanceInput?.value || '0')
                          if (distance) {
                            const fare = calculateFareEstimate(distance, e.target.value as VehicleType)
                            setEstimatedFare(fare)
                          }
                        }}
                      >
                        {vehicles.map(v => (
                          <option key={v.type} value={v.type}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {estimatedFare > 0 && (
                      <div className="p-3 bg-cream-light rounded-lg border border-primary/30">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Estimated Fare:</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(estimatedFare)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                  {/* Pickup Location with Smart Suggestions */}
                  <div className="relative">
                    <Input
                      placeholder="Enter pickup location"
                      value={pickup}
                      onChange={(e) => handlePickupChange(e.target.value)}
                      icon={<MapPin className="w-5 h-5" />}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark transition-colors"
                      title="Use current location"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
                    
                    {/* Smart Suggestions Dropdown */}
                    {showSuggestions === 'pickup' && pickupSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-cream rounded-xl shadow-xl border border-gray-200 z-40 max-h-60 overflow-y-auto">
                        {pickupSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(suggestion, 'pickup')}
                            className="w-full text-left px-4 py-3 hover:bg-cream-dark flex items-center gap-2 transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                            {favoriteLocations.includes(suggestion) && (
                              <Star className="w-3 h-3 text-primary fill-primary ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent & Favorite Locations */}
                    {!pickup && (recentLocations.length > 0 || favoriteLocations.length > 0) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-cream rounded-xl shadow-xl border border-gray-200 z-40 p-2">
                        {favoriteLocations.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-semibold text-gray-500 px-2 py-1">Favorites</div>
                            {favoriteLocations.map((loc, idx) => (
                              <button
                                key={`fav-${idx}`}
                                type="button"
                                onClick={() => handleSelectLocation(loc, 'pickup')}
                                className="w-full text-left px-4 py-2 hover:bg-cream-dark flex items-center gap-2 rounded-lg transition-colors"
                              >
                                <Star className="w-3 h-3 text-primary fill-primary" />
                                <span className="text-sm">{loc}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {recentLocations.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 px-2 py-1">Recent</div>
                            {recentLocations.map((loc, idx) => (
                              <button
                                key={`recent-${idx}`}
                                type="button"
                                onClick={() => handleSelectLocation(loc, 'pickup')}
                                className="w-full text-left px-4 py-2 hover:bg-cream-dark flex items-center gap-2 rounded-lg transition-colors"
                              >
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-sm">{loc}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Destination with Smart Suggestions */}
                  <div className="relative">
                    <Input
                      placeholder="Enter destination"
                      value={destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      icon={<MapPin className="w-5 h-5" />}
                      required
                    />
                    
                    {/* Smart Suggestions Dropdown */}
                    {showSuggestions === 'destination' && destinationSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-cream rounded-xl shadow-xl border border-gray-200 z-40 max-h-60 overflow-y-auto">
                        {destinationSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(suggestion, 'destination')}
                            className="w-full text-left px-4 py-3 hover:bg-cream-dark flex items-center gap-2 transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                            {favoriteLocations.includes(suggestion) && (
                              <Star className="w-3 h-3 text-primary fill-primary ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent & Favorite Locations */}
                    {!destination && (recentLocations.length > 0 || favoriteLocations.length > 0) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-cream rounded-xl shadow-xl border border-gray-200 z-40 p-2">
                        {favoriteLocations.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-semibold text-gray-500 px-2 py-1">Favorites</div>
                            {favoriteLocations.map((loc, idx) => (
                              <button
                                key={`fav-dest-${idx}`}
                                type="button"
                                onClick={() => handleSelectLocation(loc, 'destination')}
                                className="w-full text-left px-4 py-2 hover:bg-cream-dark flex items-center gap-2 rounded-lg transition-colors"
                              >
                                <Star className="w-3 h-3 text-primary fill-primary" />
                                <span className="text-sm">{loc}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {recentLocations.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 px-2 py-1">Recent</div>
                            {recentLocations.map((loc, idx) => (
                              <button
                                key={`recent-dest-${idx}`}
                                type="button"
                                onClick={() => handleSelectLocation(loc, 'destination')}
                                className="w-full text-left px-4 py-2 hover:bg-cream-dark flex items-center gap-2 rounded-lg transition-colors"
                              >
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-sm">{loc}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date/Time Picker - Allows any date and time */}
                  <div className="relative">
                    <Input
                      type="datetime-local"
                      value={datetime}
                      onChange={(e) => setDatetime(e.target.value)}
                      icon={<Clock className="w-5 h-5 sm:w-5 sm:h-5" />}
                      className="text-base sm:text-base py-3.5"
                    />
                  </div>

                  {/* Smart Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full relative overflow-hidden"
                    disabled={!selectedVehicle || !pickup || !destination || isBooking}
                    isLoading={isBooking}
                  >
                    {!isBooking && (
                      <>
                        <Car className="mr-2 w-5 h-5" />
                        {selectedVehicle && estimatedFare > 0
                          ? `Book Ride - ${formatCurrency(estimatedFare)}`
                          : selectedVehicle
                          ? 'Request Ride'
                          : 'Select Vehicle First'}
                      </>
                    )}
                  </Button>

                  {/* Smart Validation Message */}
                  {(!selectedVehicle || !pickup || !destination) && (
                    <div className="text-center text-sm text-gray-600 animate-fade-in">
                      {!selectedVehicle && <span className="text-primary">⚠️ Please select a vehicle</span>}
                      {!pickup && selectedVehicle && <span className="text-primary">⚠️ Please enter pickup location</span>}
                      {!destination && pickup && <span className="text-primary">⚠️ Please enter destination</span>}
                    </div>
                  )}
                </form>
              </Card>

              {/* Current Location Section - Smart & Intelligent */}
              <Card className="mt-4 sm:mt-6 animate-fade-in border-2 border-primary/20">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                      <Navigation className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Current Location
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">Use your current location for quick pickup</p>
                </div>

                <div className="space-y-3">
                  {/* Current Location Button */}
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-5 h-5" />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </button>

                  {/* Current Location Display */}
                  {currentLocationAddress && (
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-600 mb-1 font-semibold">Current Pickup Location:</div>
                          <div className="text-sm font-medium text-gray-900 break-words">{currentLocationAddress}</div>
                          <button
                            onClick={() => {
                              setPickup('')
                              setCurrentLocationAddress('')
                              toast.success('Location cleared')
                            }}
                            className="mt-2 text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Clear Location
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smart Tips */}
                  {!currentLocationAddress && (
                    <div className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-700">
                          <span className="font-semibold">Smart Tip:</span> Enable location permissions for faster booking. Your location is only used for pickup and never shared.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Saved Places Section - Smart & Intelligent */}
              <Card className="mt-4 sm:mt-6 animate-fade-in border-2 border-primary/20">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Saved Places
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">Quick access to your frequently used locations</p>
                </div>

                <div className="space-y-4">
                  {/* Manual Location Entry - Smart & Efficient */}
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h4 className="font-bold text-gray-900 text-sm">Enter Locations Manually</h4>
                    </div>
                    <div className="space-y-3">
                      {/* Pickup Input */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Pickup Location</label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Enter pickup location"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            className="flex-1 text-sm"
                            onFocus={() => setShowSuggestions('pickup')}
                          />
                          {pickup && (
                            <button
                              onClick={() => {
                                setPickup('')
                                toast.success('Pickup location cleared')
                              }}
                              className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                              title="Clear pickup"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {/* Quick suggestions for pickup */}
                        {!pickup && (homeLocation || workLocation || favoriteLocations.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {homeLocation && (
                              <button
                                onClick={() => setPickup(homeLocation)}
                                className="px-2 py-1 bg-white border border-primary/30 text-primary text-xs font-semibold rounded hover:bg-primary/5 transition-colors flex items-center gap-1"
                              >
                                <Home className="w-3 h-3" />
                                Home
                              </button>
                            )}
                            {workLocation && (
                              <button
                                onClick={() => setPickup(workLocation)}
                                className="px-2 py-1 bg-white border border-primary/30 text-primary text-xs font-semibold rounded hover:bg-primary/5 transition-colors flex items-center gap-1"
                              >
                                <Briefcase className="w-3 h-3" />
                                Work
                              </button>
                            )}
                            {favoriteLocations.slice(0, 2).map((fav, idx) => (
                              <button
                                key={idx}
                                onClick={() => setPickup(fav)}
                                className="px-2 py-1 bg-white border border-primary/30 text-primary text-xs font-semibold rounded hover:bg-primary/5 transition-colors flex items-center gap-1"
                              >
                                <Heart className="w-3 h-3" />
                                {fav.length > 15 ? fav.substring(0, 15) + '...' : fav}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Drop-off Input */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Drop-off Location</label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Enter drop-off location"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="flex-1 text-sm"
                            onFocus={() => setShowSuggestions('destination')}
                          />
                          {destination && (
                            <button
                              onClick={() => {
                                setDestination('')
                                toast.success('Drop-off location cleared')
                              }}
                              className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                              title="Clear drop-off"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {/* Quick suggestions for drop-off */}
                        {!destination && (homeLocation || workLocation || favoriteLocations.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {homeLocation && (
                              <button
                                onClick={() => setDestination(homeLocation)}
                                className="px-2 py-1 bg-white border border-primary/30 text-primary text-xs font-semibold rounded hover:bg-primary/5 transition-colors flex items-center gap-1"
                              >
                                <Home className="w-3 h-3" />
                                Home
                              </button>
                            )}
                            {workLocation && (
                              <button
                                onClick={() => setDestination(workLocation)}
                                className="px-2 py-1 bg-white border border-primary/30 text-primary text-xs font-semibold rounded hover:bg-primary/5 transition-colors flex items-center gap-1"
                              >
                                <Briefcase className="w-3 h-3" />
                                Work
                              </button>
                            )}
                            {favoriteLocations.slice(0, 2).map((fav, idx) => (
                              <button
                                key={idx}
                                onClick={() => setDestination(fav)}
                                className="px-2 py-1 bg-white border border-primary/30 text-primary text-xs font-semibold rounded hover:bg-primary/5 transition-colors flex items-center gap-1"
                              >
                                <Heart className="w-3 h-3" />
                                {fav.length > 15 ? fav.substring(0, 15) + '...' : fav}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Smart Actions */}
                      {(pickup || destination) && (
                        <div className="pt-2 border-t border-primary/20">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (pickup && destination) {
                                  // Auto-save to recent locations
                                  if (typeof window !== 'undefined') {
                                    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                    if (!recent.includes(pickup)) recent.unshift(pickup)
                                    if (!recent.includes(destination)) recent.unshift(destination)
                                    setRecentLocations(recent.slice(0, 5))
                                    localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                  }
                                  // Auto-calculate fare if vehicle selected
                                  if (selectedVehicle) {
                                    const distance = estimatedDistance || Math.random() * 15 + 5
                                    const vehicle = vehicles.find(v => v.type === selectedVehicle)
                                    if (vehicle) {
                                      const baseFare = 10
                                      const distanceFare = distance * vehicle.ratePerKm
                                      const timeFare = (distance * 2) * 0.5
                                      const total = baseFare + distanceFare + timeFare
                                      setEstimatedFare(parseFloat(total.toFixed(2)))
                                      setEstimatedDistance(distance)
                                      setEstimatedTime(Math.round(distance * 2))
                                    }
                                  }
                                  toast.success('Locations set! Select a vehicle to continue.')
                                  // Scroll to vehicle selection
                                  setTimeout(() => {
                                    const formElement = document.getElementById('booking-form')
                                    if (formElement) {
                                      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    }
                                  }, 300)
                                } else {
                                  toast.error('Please enter both pickup and drop-off locations')
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              Apply Locations
                            </button>
                            <button
                              onClick={() => {
                                setPickup('')
                                setDestination('')
                                setShowSuggestions(null)
                                toast.success('Locations cleared')
                              }}
                              className="px-4 py-2 bg-white border-2 border-primary/30 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition-all duration-200"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Home & Work Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Home Location */}
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1">Home</h4>
                            {homeLocation ? (
                              <p className="text-xs text-gray-700 truncate" title={homeLocation}>{homeLocation}</p>
                            ) : (
                              <p className="text-xs text-gray-500 italic">Not set</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const input = prompt('Enter pickup location manually:', pickup || homeLocation || '')
                              if (input && input.trim()) {
                                setPickup(input.trim())
                                // Auto-save to recent
                                if (typeof window !== 'undefined') {
                                  const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                  if (!recent.includes(input.trim())) recent.unshift(input.trim())
                                  setRecentLocations(recent.slice(0, 5))
                                  localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                }
                                toast.success('Pickup location set!')
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                          >
                            Set as Pickup
                          </button>
                          <button
                            onClick={() => {
                              const input = prompt('Enter drop-off location manually:', destination || homeLocation || '')
                              if (input && input.trim()) {
                                setDestination(input.trim())
                                // Auto-save to recent
                                if (typeof window !== 'undefined') {
                                  const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                  if (!recent.includes(input.trim())) recent.unshift(input.trim())
                                  setRecentLocations(recent.slice(0, 5))
                                  localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                }
                                toast.success('Drop-off location set!')
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-primary/80 to-primary-dark/80 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                          >
                            Set as Drop-off
                          </button>
                        </div>
                        {workLocation && (
                          <button
                            onClick={() => {
                              const pickupInput = prompt('Enter pickup location manually:', pickup || homeLocation || '')
                              if (pickupInput && pickupInput.trim()) {
                                const dropInput = prompt('Enter drop-off location manually:', destination || workLocation || '')
                                if (dropInput && dropInput.trim()) {
                                  setPickup(pickupInput.trim())
                                  setDestination(dropInput.trim())
                                  setShowSuggestions(null)
                                  // Auto-save both to recent
                                  if (typeof window !== 'undefined') {
                                    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                    if (!recent.includes(pickupInput.trim())) recent.unshift(pickupInput.trim())
                                    if (!recent.includes(dropInput.trim())) recent.unshift(dropInput.trim())
                                    setRecentLocations(recent.slice(0, 5))
                                    localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                  }
                                  toast.success('Both locations set!')
                                  // Auto-calculate fare
                                  if (selectedVehicle) {
                                    const distance = estimatedDistance || Math.random() * 15 + 5
                                    const vehicle = vehicles.find(v => v.type === selectedVehicle)
                                    if (vehicle) {
                                      const baseFare = 10
                                      const distanceFare = distance * vehicle.ratePerKm
                                      const timeFare = (distance * 2) * 0.5
                                      const total = baseFare + distanceFare + timeFare
                                      setEstimatedFare(parseFloat(total.toFixed(2)))
                                      setEstimatedDistance(distance)
                                      setEstimatedTime(Math.round(distance * 2))
                                    }
                                  }
                                } else if (pickupInput.trim()) {
                                  setPickup(pickupInput.trim())
                                  toast.success('Pickup location set!')
                                }
                              }
                            }}
                            className="w-full px-3 py-2 bg-gradient-to-r from-primary/20 to-primary-dark/20 border-2 border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/30 hover:border-primary/60 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Home → Work (Set Both)
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={handleSetHome}
                          className="w-full px-3 py-2 bg-white border-2 border-primary/30 text-primary text-sm font-semibold rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {homeLocation ? 'Update Home' : 'Set Home'}
                        </button>
                        <button
                          onClick={() => {
                            const input = prompt('Enter new pickup location:', pickup || '')
                            if (input && input.trim()) {
                              setPickup(input.trim())
                              // Auto-save to recent
                              if (typeof window !== 'undefined') {
                                const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                if (!recent.includes(input.trim())) recent.unshift(input.trim())
                                setRecentLocations(recent.slice(0, 5))
                                localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                              }
                              toast.success('Pickup location set!')
                            }
                          }}
                          className="w-full px-3 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-3 h-3" />
                          Enter Pickup Manually
                        </button>
                      </div>
                    </div>

                    {/* Work Location */}
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1">Work</h4>
                            {workLocation ? (
                              <p className="text-xs text-gray-700 truncate" title={workLocation}>{workLocation}</p>
                            ) : (
                              <p className="text-xs text-gray-500 italic">Not set</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const input = prompt('Enter pickup location manually:', pickup || workLocation || '')
                              if (input && input.trim()) {
                                setPickup(input.trim())
                                // Auto-save to recent
                                if (typeof window !== 'undefined') {
                                  const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                  if (!recent.includes(input.trim())) recent.unshift(input.trim())
                                  setRecentLocations(recent.slice(0, 5))
                                  localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                }
                                toast.success('Pickup location set!')
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                          >
                            Set as Pickup
                          </button>
                          <button
                            onClick={() => {
                              const input = prompt('Enter drop-off location manually:', destination || workLocation || '')
                              if (input && input.trim()) {
                                setDestination(input.trim())
                                // Auto-save to recent
                                if (typeof window !== 'undefined') {
                                  const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                  if (!recent.includes(input.trim())) recent.unshift(input.trim())
                                  setRecentLocations(recent.slice(0, 5))
                                  localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                }
                                toast.success('Drop-off location set!')
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-primary/80 to-primary-dark/80 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                          >
                            Set as Drop-off
                          </button>
                        </div>
                        {homeLocation && (
                          <button
                            onClick={() => {
                              const pickupInput = prompt('Enter pickup location manually:', pickup || workLocation || '')
                              if (pickupInput && pickupInput.trim()) {
                                const dropInput = prompt('Enter drop-off location manually:', destination || homeLocation || '')
                                if (dropInput && dropInput.trim()) {
                                  setPickup(pickupInput.trim())
                                  setDestination(dropInput.trim())
                                  setShowSuggestions(null)
                                  // Auto-save both to recent
                                  if (typeof window !== 'undefined') {
                                    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                    if (!recent.includes(pickupInput.trim())) recent.unshift(pickupInput.trim())
                                    if (!recent.includes(dropInput.trim())) recent.unshift(dropInput.trim())
                                    setRecentLocations(recent.slice(0, 5))
                                    localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                  }
                                  toast.success('Both locations set!')
                                  // Auto-calculate fare
                                  if (selectedVehicle) {
                                    const distance = estimatedDistance || Math.random() * 15 + 5
                                    const vehicle = vehicles.find(v => v.type === selectedVehicle)
                                    if (vehicle) {
                                      const baseFare = 10
                                      const distanceFare = distance * vehicle.ratePerKm
                                      const timeFare = (distance * 2) * 0.5
                                      const total = baseFare + distanceFare + timeFare
                                      setEstimatedFare(parseFloat(total.toFixed(2)))
                                      setEstimatedDistance(distance)
                                      setEstimatedTime(Math.round(distance * 2))
                                    }
                                  }
                                } else if (pickupInput.trim()) {
                                  setPickup(pickupInput.trim())
                                  toast.success('Pickup location set!')
                                }
                              }
                            }}
                            className="w-full px-3 py-2 bg-gradient-to-r from-primary/20 to-primary-dark/20 border-2 border-primary/40 text-primary text-xs font-semibold rounded-lg hover:bg-primary/30 hover:border-primary/60 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Work → Home (Set Both)
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={handleSetWork}
                          className="w-full px-3 py-2 bg-white border-2 border-primary/30 text-primary text-sm font-semibold rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {workLocation ? 'Update Work' : 'Set Work'}
                        </button>
                        <button
                          onClick={() => {
                            const input = prompt('Enter new drop-off location:', destination || '')
                            if (input && input.trim()) {
                              setDestination(input.trim())
                              // Auto-save to recent
                              if (typeof window !== 'undefined') {
                                const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                if (!recent.includes(input.trim())) recent.unshift(input.trim())
                                setRecentLocations(recent.slice(0, 5))
                                localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                              }
                              toast.success('Drop-off location set!')
                            }
                          }}
                          className="w-full px-3 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-3 h-3" />
                          Enter Drop-off Manually
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Favorites Section */}
                  <div className="pt-4 border-t border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white fill-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Favorites</h4>
                        <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full">({favoriteLocations.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            // Smart: Suggest from recent locations, popular destinations, or airports
                            const suggestions = [
                              ...recentLocations,
                              ...Object.keys(popularDestinations),
                              'JFK Airport',
                              'LaGuardia Airport',
                              'Newark Airport'
                            ].filter((loc, idx, arr) => arr.indexOf(loc) === idx && !favoriteLocations.includes(loc)).slice(0, 5)
                            
                            const suggestionText = suggestions.length > 0 
                              ? `\n\nSuggestions: ${suggestions.join(', ')}` 
                              : ''
                            
                            const input = prompt(`Enter location to add to favorites:${suggestionText}`, 
                              pickup || destination || recentLocations[0] || '')
                            
                            if (input && input.trim()) {
                              const loc = input.trim()
                              if (!favoriteLocations.includes(loc)) {
                                const favorites = [...favoriteLocations, loc]
                                setFavoriteLocations(favorites)
                                localStorage.setItem('favorites', JSON.stringify(favorites))
                                toast.success(`✨ ${loc} added to favorites!`)
                              } else {
                                toast.error('Already in favorites')
                              }
                            }
                          }}
                          className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-primary to-primary-dark text-white text-[10px] sm:text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1 flex-1 sm:flex-none"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                        <button
                          onClick={() => {
                            const pickupInput = prompt('Enter pickup location manually:', pickup || '')
                            if (pickupInput && pickupInput.trim()) {
                              setPickup(pickupInput.trim())
                              const dropInput = prompt('Enter drop-off location manually:', destination || '')
                              if (dropInput && dropInput.trim()) {
                                setDestination(dropInput.trim())
                                // Auto-save both to recent
                                if (typeof window !== 'undefined') {
                                  const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                  if (!recent.includes(pickupInput.trim())) recent.unshift(pickupInput.trim())
                                  if (!recent.includes(dropInput.trim())) recent.unshift(dropInput.trim())
                                  setRecentLocations(recent.slice(0, 5))
                                  localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                }
                                toast.success('Both locations set manually!')
                                // Scroll to form
                                setTimeout(() => {
                                  const formElement = document.getElementById('booking-form')
                                  if (formElement) {
                                    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  }
                                }, 300)
                              } else if (pickupInput.trim()) {
                                toast.success('Pickup location set!')
                                // Scroll to form
                                setTimeout(() => {
                                  const formElement = document.getElementById('booking-form')
                                  if (formElement) {
                                    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  }
                                }, 300)
                              }
                            }
                          }}
                          className="px-2.5 sm:px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-[10px] sm:text-xs font-semibold rounded-lg hover:bg-primary/20 transition-all duration-200 flex items-center gap-1 flex-1 sm:flex-none"
                          title="Enter both locations manually"
                        >
                          <MapPin className="w-3 h-3" />
                          Manual Entry
                        </button>
                      </div>
                    </div>
                    
                    {favoriteLocations.length > 0 ? (
                      <div className="space-y-2.5 sm:space-y-2">
                        {favoriteLocations.map((fav, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 sm:p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 group hover:shadow-md"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white" />
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1" title={fav}>{fav}</span>
                            </div>
                            <div className="flex flex-row items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                              <button
                                onClick={() => {
                                  // Directly set favorite as pickup
                                  setPickup(fav)
                                  // Auto-save to recent
                                  if (typeof window !== 'undefined') {
                                    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                    if (!recent.includes(fav)) recent.unshift(fav)
                                    setRecentLocations(recent.slice(0, 5))
                                    localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                  }
                                  toast.success(`Pickup set to ${fav}`)
                                  // Scroll to form
                                  setTimeout(() => {
                                    const formElement = document.getElementById('booking-form')
                                    if (formElement) {
                                      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    }
                                  }, 300)
                                }}
                                className="px-2.5 py-1.5 sm:px-3 bg-gradient-to-r from-primary to-primary-dark text-white text-[10px] sm:text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none min-w-[90px] sm:min-w-0"
                              >
                                Set as Pickup
                              </button>
                              <button
                                onClick={() => {
                                  // Directly set favorite as drop-off
                                  setDestination(fav)
                                  // Auto-save to recent
                                  if (typeof window !== 'undefined') {
                                    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                    if (!recent.includes(fav)) recent.unshift(fav)
                                    setRecentLocations(recent.slice(0, 5))
                                    localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                  }
                                  toast.success(`Drop-off set to ${fav}`)
                                  // Scroll to form
                                  setTimeout(() => {
                                    const formElement = document.getElementById('booking-form')
                                    if (formElement) {
                                      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    }
                                  }, 300)
                                }}
                                className="px-2.5 py-1.5 sm:px-3 bg-gradient-to-r from-primary/80 to-primary-dark/80 text-white text-[10px] sm:text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap flex-1 sm:flex-none min-w-[90px] sm:min-w-0"
                              >
                                Set as Drop-off
                              </button>
                              <button
                                onClick={() => {
                                  // Set favorite as both pickup and drop-off
                                  setPickup(fav)
                                  setDestination(fav)
                                  // Auto-save to recent
                                  if (typeof window !== 'undefined') {
                                    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                                    if (!recent.includes(fav)) recent.unshift(fav)
                                    setRecentLocations(recent.slice(0, 5))
                                    localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                                  }
                                  toast.success(`Set ${fav} as both pickup and drop-off`)
                                  // Scroll to form
                                  setTimeout(() => {
                                    const formElement = document.getElementById('booking-form')
                                    if (formElement) {
                                      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    }
                                  }, 300)
                                }}
                                className="px-2 py-1.5 sm:px-2 bg-primary/20 border border-primary/40 text-primary text-[10px] sm:text-xs font-semibold rounded-lg hover:bg-primary/30 hover:border-primary/60 transition-all duration-200 whitespace-nowrap"
                                title="Set as both pickup and drop-off"
                              >
                                Set Both
                              </button>
                              <button
                                onClick={() => handleRemoveFavorite(fav)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                                title="Remove from favorites"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Heart className="w-6 h-6 text-primary" />
                        </div>
                        <p className="font-medium">No favorites yet</p>
                        <p className="text-xs mt-1 text-gray-400">Add locations you use frequently</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Popular Destinations Section - Smart & Intelligent */}
              <Card className="mt-4 sm:mt-6 animate-fade-in border-2 border-primary/20">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Popular Destinations
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">Quick access to popular locations in your area</p>
                </div>

                <div className="space-y-4">
                  {/* Airport Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                        <Plane className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">Airports</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['JFK Airport', 'LaGuardia Airport', 'Newark Airport'].map((airport, idx) => {
                        const usageCount = popularDestinations[airport] || 0
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectSavedPlace(airport, 'destination')}
                            className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group relative"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Plane className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate">{airport}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {usageCount > 0 && (
                                  <span className="text-xs text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
                                    {usageCount}x
                                  </span>
                                )}
                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Hotels Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">Hotels</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['Marriott Hotel', 'Hilton Hotel', 'Grand Plaza Hotel'].map((hotel, idx) => {
                        const usageCount = popularDestinations[hotel] || 0
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectSavedPlace(hotel, 'destination')}
                            className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate">{hotel}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {usageCount > 0 && (
                                  <span className="text-xs text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
                                    {usageCount}x
                                  </span>
                                )}
                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shopping Malls Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">Shopping Malls</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['Times Square Mall', 'Central Park Shopping', 'Brooklyn Center'].map((mall, idx) => {
                        const usageCount = popularDestinations[mall] || 0
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectSavedPlace(mall, 'destination')}
                            className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <ShoppingBag className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate">{mall}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {usageCount > 0 && (
                                  <span className="text-xs text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
                                    {usageCount}x
                                  </span>
                                )}
                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Restaurants Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                        <UtensilsCrossed className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900">Restaurants</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['Fine Dining Restaurant', 'Italian Bistro', 'Seafood Grill'].map((restaurant, idx) => {
                        const usageCount = popularDestinations[restaurant] || 0
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectSavedPlace(restaurant, 'destination')}
                            className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <UtensilsCrossed className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate">{restaurant}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {usageCount > 0 && (
                                  <span className="text-xs text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
                                    {usageCount}x
                                  </span>
                                )}
                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Smart Quick Actions */}
                  <div className="pt-4 border-t border-primary/20">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          if (homeLocation) {
                            handleSelectSavedPlace(homeLocation, 'pickup')
                            toast('💡 Tip: Select a destination above!', { duration: 3000 })
                          } else {
                            toast.error('Set your home location first')
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary-dark/10 border-2 border-primary/30 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Home className="w-4 h-4" />
                        Home → Destination
                      </button>
                      <button
                        onClick={() => {
                          if (workLocation) {
                            handleSelectSavedPlace(workLocation, 'pickup')
                            toast('💡 Tip: Select a destination above!', { duration: 3000 })
                          } else {
                            toast.error('Set your work location first')
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary-dark/10 border-2 border-primary/30 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" />
                        Work → Destination
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Airport Transfers Section - Smart & Intelligent */}
              <Card className="mt-4 sm:mt-6 animate-fade-in border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                      <Plane className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        Airport Transfers
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">Premium airport transportation service</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Airport Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-900">Select Airport</label>
                      <span className="text-xs text-gray-600 bg-primary/10 px-2 py-1 rounded-full">Click to set as destination</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Choose an airport below to set it as your drop-off location</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'JFK Airport', code: 'JFK', distance: '25 km', time: '~35 min' },
                        { name: 'LaGuardia Airport', code: 'LGA', distance: '15 km', time: '~25 min' },
                        { name: 'Newark Airport', code: 'EWR', distance: '30 km', time: '~40 min' }
                      ].map((airport, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            // Smart: Set airport as destination and suggest home/work as pickup
                            handleSelectSavedPlace(airport.name, 'destination')
                            if (homeLocation && !pickup) {
                              setTimeout(() => {
                                toast('💡 Tip: Use Home as pickup?', { duration: 3000 })
                              }, 500)
                            } else if (workLocation && !pickup) {
                              setTimeout(() => {
                                toast('💡 Tip: Use Work as pickup?', { duration: 3000 })
                              }, 500)
                            }
                          }}
                          className="p-4 bg-white rounded-xl border-2 border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all duration-200 text-left group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Plane className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-bold text-gray-900 text-sm">{airport.name}</div>
                                <div className="text-xs text-primary font-semibold">{airport.code}</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{airport.distance}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{airport.time}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Booking Options */}
                  <div className="pt-4 border-t border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-900">Quick Booking Options</label>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">Enter pickup location manually for your airport transfer</p>
                    <div className="grid grid-cols-1 gap-3">
                      {/* Manual Pickup Entry */}
                      <button
                        onClick={() => {
                          // Prompt for manual pickup entry only
                          const pickupInput = prompt('Enter pickup location manually:', pickup || homeLocation || '')
                          if (pickupInput && pickupInput.trim()) {
                            setPickup(pickupInput.trim())
                            // Auto-save to recent
                            if (typeof window !== 'undefined') {
                              const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]')
                              if (!recent.includes(pickupInput.trim())) recent.unshift(pickupInput.trim())
                              setRecentLocations(recent.slice(0, 5))
                              localStorage.setItem('recentLocations', JSON.stringify(recent.slice(0, 10)))
                            }
                            toast.success('Pickup location set! Select an airport above as your destination.')
                            setTimeout(() => {
                              const formElement = document.getElementById('booking-form')
                              if (formElement) {
                                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }
                            }, 300)
                          }
                        }}
                        className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all duration-200 text-left group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-sm">Enter Pickup Location</div>
                            <div className="text-xs text-gray-600 mb-1">Pickup: Manual Entry</div>
                            <div className="text-xs text-primary font-semibold">Enter your pickup location manually</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Click to enter pickup location</div>
                      </button>
                    </div>
                  </div>

                  {/* Airport Transfer Features */}
                  <div className="pt-4 border-t border-primary/20">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { icon: Shield, text: 'Safe & Secure' },
                        { icon: Clock, text: 'On-Time Guarantee' },
                        { icon: Car, text: 'Premium Vehicles' },
                        { icon: Star, text: '5-Star Service' }
                      ].map((feature, idx) => (
                        <div key={idx} className="text-center p-3 bg-white/50 rounded-lg border border-primary/20">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-2">
                            <feature.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs font-semibold text-gray-900">{feature.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smart Booking CTA */}
                  {(pickup && destination) && (
                    <div className="pt-4 border-t border-primary/20">
                      <button
                        onClick={() => {
                          const formElement = document.getElementById('booking-form')
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }
                          toast('💡 Select a vehicle and complete your booking!', { duration: 3000 })
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Car className="w-5 h-5" />
                        <span>Complete Airport Transfer Booking</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Scheduled Rides Section - Smart & Intelligent */}
              <Card className="mt-4 sm:mt-6 animate-fade-in border-2 border-primary/20">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                      <CalendarClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        Scheduled Rides
                      </h3>
                      <p className="text-sm text-gray-600">Book your ride in advance</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Schedule New Ride Button */}
                  <button
                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>{showScheduleForm ? 'Cancel Scheduling' : 'Book for Later'}</span>
                  </button>

                  {/* Schedule Form */}
                  {showScheduleForm && (
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 space-y-4 animate-fade-in">
                      <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">Pickup Location</label>
                        <Input
                          type="text"
                          placeholder="Enter pickup location"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          className="w-full"
                        />
                        {homeLocation && (
                          <button
                            onClick={() => setPickup(homeLocation)}
                            className="mt-2 text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
                          >
                            <Home className="w-3 h-3" />
                            Use Home
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">Destination</label>
                        <Input
                          type="text"
                          placeholder="Enter destination"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full"
                        />
                        {workLocation && (
                          <button
                            onClick={() => setDestination(workLocation)}
                            className="mt-2 text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
                          >
                            <Briefcase className="w-3 h-3" />
                            Use Work
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">Date & Time</label>
                        <Input
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                          value={datetime}
                          onChange={(e) => setDatetime(e.target.value)}
                          className="w-full"
                        />
                        {/* Smart Date Suggestions */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[
                            { label: 'Tomorrow 9 AM', value: () => {
                              const tomorrow = new Date()
                              tomorrow.setDate(tomorrow.getDate() + 1)
                              tomorrow.setHours(9, 0, 0, 0)
                              return tomorrow.toISOString().slice(0, 16)
                            }},
                            { label: 'Tomorrow 5 PM', value: () => {
                              const tomorrow = new Date()
                              tomorrow.setDate(tomorrow.getDate() + 1)
                              tomorrow.setHours(17, 0, 0, 0)
                              return tomorrow.toISOString().slice(0, 16)
                            }},
                            { label: 'Next Week', value: () => {
                              const nextWeek = new Date()
                              nextWeek.setDate(nextWeek.getDate() + 7)
                              nextWeek.setHours(9, 0, 0, 0)
                              return nextWeek.toISOString().slice(0, 16)
                            }}
                          ].map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => setDatetime(suggestion.value())}
                              className="px-3 py-1.5 bg-white border-2 border-primary/30 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
                            >
                              {suggestion.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">Vehicle Type</label>
                        {!selectedVehicle ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {vehicles.map((vehicle) => (
                              <button
                                key={vehicle.type}
                                onClick={() => {
                                  setSelectedVehicle(vehicle.type)
                                  // Calculate estimated fare
                                  const distance = estimatedDistance || Math.random() * 15 + 5
                                  const baseFare = 10
                                  const distanceFare = distance * vehicle.ratePerKm
                                  const timeFare = (distance * 2) * 0.5
                                  const total = baseFare + distanceFare + timeFare
                                  setEstimatedFare(parseFloat(total.toFixed(2)))
                                  setEstimatedDistance(distance)
                                  setEstimatedTime(Math.round(distance * 2))
                                }}
                                className="p-3 bg-white rounded-lg border-2 border-primary/20 hover:border-primary/50 hover:shadow-md transition-all duration-200 text-center group"
                              >
                                <div className="text-xs font-semibold text-gray-900 mb-1">{vehicle.name}</div>
                                <div className="text-xs text-primary font-bold">{formatCurrency(vehicle.ratePerKm)}/km</div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                                <Car className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{vehicles.find(v => v.type === selectedVehicle)?.name}</div>
                                <div className="text-xs text-primary font-semibold">
                                  {formatCurrency(vehicles.find(v => v.type === selectedVehicle)?.ratePerKm || 0)}/km
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedVehicle(null)}
                              className="px-3 py-1.5 bg-white border-2 border-primary/30 text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
                            >
                              Change
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={async () => {
                          if (!pickup || !destination || !datetime || !selectedVehicle) {
                            toast.error('Please fill all fields to schedule a ride')
                            return
                          }

                          const scheduleDate = new Date(datetime)
                          if (scheduleDate <= new Date()) {
                            toast.error('Please select a future date and time')
                            return
                          }

                          const vehicle = vehicles.find(v => v.type === selectedVehicle)
                          const distance = estimatedDistance || Math.random() * 15 + 5
                          const fare = estimatedFare > 0 ? estimatedFare : (distance * vehicle!.ratePerKm + 10)

                          const scheduledRide = {
                            id: `scheduled-${Date.now()}`,
                            pickup,
                            destination,
                            datetime,
                            date: datetime.split('T')[0],
                            time: datetime.split('T')[1],
                            vehicleType: selectedVehicle,
                            vehicleName: vehicle!.name,
                            price: fare,
                            distance: parseFloat(distance.toFixed(1)),
                            status: 'scheduled',
                            timestamp: new Date().toISOString()
                          }

                          // Save scheduled ride
                          if (typeof window !== 'undefined') {
                            const scheduled = JSON.parse(localStorage.getItem('scheduledRides') || '[]')
                            scheduled.push(scheduledRide)
                            localStorage.setItem('scheduledRides', JSON.stringify(scheduled))
                            
                            // Also add to trips
                            const trips = JSON.parse(localStorage.getItem('trips') || '[]')
                            trips.unshift({
                              id: scheduledRide.id,
                              route: `${pickup} to ${destination}`,
                              date: scheduledRide.date,
                              type: vehicle!.name,
                              price: fare,
                              status: 'Upcoming',
                            })
                            localStorage.setItem('trips', JSON.stringify(trips))

                            // Create notification
                            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
                            notifications.unshift({
                              id: `notif-${Date.now()}`,
                              type: 'ride_scheduled',
                              title: 'Ride Scheduled',
                              message: `Your ride from ${pickup} to ${destination} is scheduled for ${new Date(datetime).toLocaleString()}`,
                              timestamp: new Date().toISOString(),
                              read: false,
                            })
                            localStorage.setItem('notifications', JSON.stringify(notifications))
                          }

                          // Update state
                          setScheduledRides([...scheduledRides, scheduledRide].sort((a, b) => 
                            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                          ))

                          toast.success(`Ride scheduled for ${new Date(datetime).toLocaleString()}!`)
                          setShowScheduleForm(false)
                          
                          // Reset form
                          setPickup('')
                          setDestination('')
                          setDatetime('')
                          setSelectedVehicle(null)
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        <span>Schedule Ride</span>
                      </button>
                    </div>
                  )}

                  {/* Scheduled Rides List */}
                  {scheduledRides.length > 0 ? (
                    <div className="pt-4 border-t border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">Upcoming Scheduled Rides</h4>
                        <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                          {scheduledRides.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {scheduledRides.slice(0, 3).map((ride) => {
                          const rideDate = new Date(ride.datetime)
                          const isToday = rideDate.toDateString() === new Date().toDateString()
                          const isTomorrow = rideDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                          
                          return (
                            <div
                              key={ride.id}
                              className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-all duration-200"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-sm font-semibold text-gray-900 truncate">{ride.pickup}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm font-semibold text-gray-900 truncate">{ride.destination}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : rideDate.toLocaleDateString()} at {rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Car className="w-3 h-3" />
                                      <span>{ride.vehicleName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-primary">{formatCurrency(ride.price)}</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    // Remove scheduled ride
                                    const updated = scheduledRides.filter(r => r.id !== ride.id)
                                    setScheduledRides(updated)
                                    localStorage.setItem('scheduledRides', JSON.stringify(updated))
                                    toast.success('Scheduled ride cancelled')
                                  }}
                                  className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
                                  title="Cancel scheduled ride"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {scheduledRides.length > 3 && (
                        <button
                          onClick={() => {
                            toast('View all scheduled rides in Trip History', { duration: 3000 })
                          }}
                          className="w-full mt-3 text-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                        >
                          View All ({scheduledRides.length}) →
                        </button>
                      )}
                    </div>
                  ) : (
                    !showScheduleForm && (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="font-medium">No scheduled rides</p>
                        <p className="text-xs mt-1 text-gray-400">Schedule your ride in advance for convenience</p>
                      </div>
                    )
                  )}
                </div>
              </Card>

              {/* Quick Actions & Shortcuts Section */}
              <Card className="mt-4 sm:mt-6 animate-fade-in">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Quick Actions & Shortcuts
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">Quickly rebook your recent trips</p>
                </div>

                {recentTrips.length > 0 ? (
                  <div className="space-y-3">
                    {recentTrips.map((trip) => {
                      const routeParts = trip.route.split(' to ')
                      const pickupLocation = routeParts[0]?.trim() || ''
                      const destinationLocation = routeParts[1]?.trim() || ''
                      
                      return (
                        <div
                          key={trip.id}
                          className="group p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Trip Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-700 truncate">{pickupLocation}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm font-semibold text-gray-700 truncate">{destinationLocation}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Car className="w-3 h-3" />
                                      <span>{trip.type}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{formatDate(trip.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-primary">{formatCurrency(trip.price)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Ride Again Button */}
                            <button
                              onClick={() => handleQuickRebook(trip)}
                              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                              <ArrowRight className="w-4 h-4" />
                              <span>Ride Again</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-2">No recent trips yet</p>
                    <p className="text-gray-500 text-xs">Book a ride to see it here for quick rebooking</p>
                  </div>
                )}

                {/* View All Trips Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/trips">
                    <button className="w-full text-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                      View All Trip History →
                    </button>
                  </Link>
                </div>
              </Card>

              {/* Driver Information Section - Mobile Optimized */}
              {(pickup && destination && selectedVehicle) && (
                <Card className="mt-4 sm:mt-6 animate-fade-in overflow-hidden border-2 border-primary/20 shadow-lg">
                  {/* Header - Mobile Optimized with Rounded Corners */}
                  <div className="bg-gradient-to-r from-primary to-primary-dark px-4 py-3 sm:px-6 sm:py-4 rounded-t-2xl">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-center text-white">Your Assigned Driver</h3>
                  </div>
                  
                  <div className="p-4 sm:p-5 md:p-6">
                    {/* Driver Profile Card - Mobile First */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 border-2 border-gray-100 shadow-md">
                      <div className="flex flex-col items-center gap-4 sm:gap-5">
                        {/* Driver Photo - Mobile Optimized */}
                        <div className="relative flex-shrink-0">
                          <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-primary shadow-xl ring-4 ring-primary/20">
                      <img
                        src="https://img.freepik.com/premium-photo/photo-middle-aged-driver-man-sitting-yellow-taxi-driving-city-street-with-smile-holding-hands-steering-wheel_726520-4334.jpg"
                        alt="Driver"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600'
                        }}
                      />
                          </div>
                          {/* Online Status Badge - Mobile Optimized */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full border-2 sm:border-4 border-white shadow-xl flex items-center justify-center">
                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-full animate-pulse"></div>
                          </div>
                    </div>

                        {/* Driver Info - Mobile Centered */}
                        <div className="w-full text-center">
                          
                          {/* Rating Display - Mobile Optimized */}
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                                />
                          ))}
                        </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg sm:text-xl font-bold text-gray-900">4.8</span>
                              <span className="text-xs sm:text-sm text-gray-500">(127 rides)</span>
                            </div>
                          </div>

                          {/* Driver Stats - Status Only */}
                          <div className="flex justify-center mt-3 sm:mt-4">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                              <div className="text-xs sm:text-sm text-gray-500 mb-1.5 font-medium text-center">Status</div>
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-sm sm:text-base text-green-600">Online</span>
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>

                    {/* Action Buttons - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Button
                      variant="primary"
                        size="lg"
                        className="flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-4 text-sm sm:text-base font-semibold touch-manipulation min-h-[48px]"
                      onClick={() => window.location.href = 'tel:+1-800-555-1234'}
                    >
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Call Driver</span>
                    </Button>
                    <Button
                      variant="danger"
                        size="lg"
                        className="flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-4 text-sm sm:text-base font-semibold touch-manipulation min-h-[48px]"
                      onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this ride?')) {
                        setPickup('')
                        setDestination('')
                            setDatetime('')
                        setSelectedVehicle(null)
                        setShowVehicleInfo(false)
                            setEstimatedDistance(0)
                            setEstimatedFare(0)
                            setEstimatedTime(0)
                            setRating(0)
                            setFeedback('')
                            toast.success('Ride cancelled successfully')
                          }
                        }}
                      >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Cancel Ride</span>
                    </Button>
                  </div>

                    {/* Rating Section - Mobile Optimized */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary" />
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900">Rate Your Driver</h4>
                      </div>
                      
                      <div className="flex gap-1.5 sm:gap-2 justify-center mb-4 sm:mb-5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                            className={`transition-all duration-200 transform active:scale-90 touch-manipulation ${
                              star <= rating 
                                ? 'text-yellow-400 scale-110' 
                                : 'text-gray-300'
                            }`}
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${star <= rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>

                      {rating > 0 && (
                        <div className="mb-3 sm:mb-4 text-center">
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">
                            {rating === 5 && 'Excellent! ⭐⭐⭐⭐⭐'}
                            {rating === 4 && 'Great! ⭐⭐⭐⭐'}
                            {rating === 3 && 'Good! ⭐⭐⭐'}
                            {rating === 2 && 'Fair ⭐⭐'}
                            {rating === 1 && 'Poor ⭐'}
                          </p>
                        </div>
                      )}

                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your experience with this driver..."
                        rows={3}
                        className="w-full rounded-xl border-2 border-gray-300 px-3 sm:px-4 py-2.5 sm:py-3 mb-3 sm:mb-4 focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base resize-none transition-all touch-manipulation"
                      />
                      
                    <Button
                      variant="primary"
                        size="lg"
                        className="w-full font-semibold py-3.5 sm:py-4 text-sm sm:text-base touch-manipulation min-h-[48px]"
                      onClick={() => {
                        if (rating > 0) {
                            toast.success('Thank you for your feedback.')
                          if (typeof window !== 'undefined') {
                            const ratings = JSON.parse(localStorage.getItem('ratings') || '[]')
                            ratings.push({
                              rating,
                              feedback,
                              timestamp: new Date().toISOString(),
                            })
                            localStorage.setItem('ratings', JSON.stringify(ratings))
                          }
                          setRating(0)
                          setFeedback('')
                        } else {
                            toast.error('Please select a rating before submitting')
                        }
                      }}
                    >
                      Submit Feedback
                    </Button>
                    </div>
                  </div>
                </Card>
              )}
            </Card>

            {/* Testimonials Section */}
            <section className="py-12 sm:py-16 w-full mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center mb-8 sm:mb-12">
                  <div className="relative px-4 py-2 bg-cream rounded-xl border border-primary/20 shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 rounded-xl"></div>
                    <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                      What Our Customers Say
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { 
                      name: 'Jennifer Martinez', 
                      rating: 5, 
                      comment: 'Excellent service! The driver was professional and the ride was smooth. Highly recommend!', 
                      location: 'New York',
                      image: 'https://plus.unsplash.com/premium_photo-1763734966182-f32acb079b29?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    },
                    { 
                      name: 'David Kim', 
                      rating: 5, 
                      comment: 'Best taxi app I\'ve used. Fast, reliable, and the premium vehicles are worth every penny.', 
                      location: 'Los Angeles',
                      image: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    },
                    { 
                      name: 'Maria Garcia', 
                      rating: 5, 
                      comment: 'Outstanding experience from booking to arrival. The driver was punctual and courteous.', 
                      location: 'Chicago',
                      image: 'https://plus.unsplash.com/premium_photo-1664203068423-b558542273e3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    },
                  ].map((testimonial, idx) => (
                    <Card key={idx} className="p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                    </div>
                      <p className="text-gray-700 mb-4 text-sm leading-relaxed">"{testimonial.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20 shadow-md">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-xs text-gray-500">{testimonial.location}</div>
                        </div>
                      </div>
                  </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Call-to-Action Section */}
            <section className="py-12 sm:py-16 w-full mt-8">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-gradient-to-r from-primary via-primary-dark to-primary text-white p-8 sm:p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    </div>
                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-4">Ready to Ride?</h2>
                    <p className="text-lg sm:text-xl mb-8 text-white/90">Book your luxury ride in seconds</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/book">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold">
                          Book a Ride Now
                        </Button>
                      </Link>
                      <Link href="/trips">
                        <button className="w-full sm:w-auto px-8 py-4 text-base font-semibold border-2 border-white bg-white text-primary hover:bg-white/90 hover:border-white rounded-xl transition-all duration-200">
                          View Trip History
                        </button>
                      </Link>
                    </div>
                  </div>
                  </Card>
                    </div>
            </section>

            {/* App Demo Video Section */}
            <section className="py-8 sm:py-12 w-full mt-8 bg-gradient-to-br from-white via-cream-light to-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-block relative">
                    {/* Decorative background card */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl blur-lg opacity-60"></div>
                    <div className="relative bg-gradient-to-br from-white to-cream-light rounded-xl p-6 sm:p-8 border-2 border-primary/20 shadow-lg">
                      {/* Decorative top accent */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
                      
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif mb-3 bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent relative">
                        See How It Works
                        {/* Decorative underline */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                      </h2>
                      <p className="text-gray-700 text-sm sm:text-base lg:text-lg max-w-xl mx-auto font-medium">
                        Watch our mobile app in action
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="relative group w-full max-w-4xl">
                    {/* Decorative background elements */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl"></div>
                    
                    {/* Phone Frame */}
                    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 w-full">
                      {/* Phone Frame Header */}
                      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <div className="flex-1 text-center text-white text-sm font-semibold">Luxride</div>
                      </div>
                      {/* Video Container - Full Width */}
                      <div className="relative w-full aspect-video bg-black">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-contain"
                          controls
                          preload="metadata"
                        >
                          <source src="/app-demo.mp4" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        {/* Custom Play Button Overlay */}
                        {showVideoPlayButton && (
                          <div
                            className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group hover:bg-black/40 transition-all duration-300 z-10"
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.play()
                                setShowVideoPlayButton(false)
                              }
                            }}
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Download App Section */}
            <section className="py-12 sm:py-16 w-full mt-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Download Our Mobile App
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                      Get the full Luxride experience on your mobile device. Book rides, track drivers, and manage your trips on the go.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a 
                        href="https://apps.apple.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-2.24-1.05-3.38-1.59-4.1-2.72C6.1 15.5 5.8 14.25 6.1 13c.3-1.25 1.2-2.25 2.4-2.95.6-.35 1.3-.6 2-.85.4-.15.8-.3 1.2-.45.2-.08.4-.15.6-.2.1-.03.2-.05.3-.08.05-.01.1-.02.15-.03.05 0 .1-.01.15-.02.05 0 .1 0 .15.01.05.01.1.02.15.03.1.03.2.05.3.08.2.05.4.12.6.2.4.15.8.3 1.2.45.7.25 1.4.5 2 .85 1.2.7 2.1 1.7 2.4 2.95.3 1.25 0 2.5-.63 3.52-.72 1.13-1.86 1.67-4.1 2.72-1.16.48-2.15.94-3.24 1.44-1.03.48-2.1.55-3.08.4z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-xs">Download on the</div>
                          <div className="text-lg font-bold">App Store</div>
                        </div>
                      </a>
                      <a 
                        href="https://play.google.com/store/apps" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-xs">Get it on</div>
                          <div className="text-lg font-bold">Google Play</div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="relative w-full max-w-sm mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-3xl transform rotate-6 opacity-20"></div>
                      <div className="relative bg-white rounded-3xl p-4 shadow-2xl border-4 border-gray-200">
                        <div className="bg-gray-900 rounded-t-2xl p-2 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div className="flex-1 text-center text-white text-xs font-semibold">Luxride App</div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-b-2xl p-0 h-64 flex items-center justify-center overflow-hidden relative">
                          <Image
                            src="https://i.pinimg.com/1200x/35/1b/36/351b369c76dd4e2cbc855da4553a1a9d.jpg"
                            alt="Luxride App"
                            fill
                            className="object-cover rounded-b-2xl"
                            unoptimized
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-8 sm:py-12 w-full mt-8">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { icon: Shield, title: 'Verified Drivers', desc: 'Background checked' },
                    { icon: Car, title: '24/7 Available', desc: 'Always ready' },
                    { icon: Star, title: '5-Star Rated', desc: 'Top quality service' },
                    { icon: Zap, title: 'Fast Response', desc: 'Under 5 minutes' },
                  ].map((item, idx) => (
                    <Card key={idx} className="text-center p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base mb-1 text-gray-900">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                  </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Section - Mobile Optimized with Animated Counters */}
            <section 
              id="stats-section"
              className="py-12 sm:py-16 bg-gray-200 w-full mt-12 rounded-2xl mx-4 md:mx-auto max-w-7xl overflow-hidden relative"
            >
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-dark rounded-full blur-3xl"></div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {/* Happy Riders - Animated */}
                  <Card 
                    className="text-center hover:shadow-2xl active:scale-95 transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group w-full max-w-full touch-manipulation cursor-pointer"
                    onClick={() => {
                      // Tap to re-animate
                      setStatsVisible(false)
                      setAnimatedStats({ happyRiders: 0, drivers: 0, completedRides: 0, rating: 0 })
                      setTimeout(() => animateCounters(), 50)
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-full">
                      <div className="w-full h-48 sm:h-56 md:h-48 mx-auto mb-3 sm:mb-4 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl group-hover:border-primary transition-all duration-300 transform group-hover:scale-105">
                        <img
                          src="https://poloandtweed.com/wp-content/uploads/2021/04/Aafkes-Blog-Photos-47.png"
                          alt="Happy Rider"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200'
                          }}
                        />
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary mb-1 sm:mb-2 font-serif transition-all duration-300">
                        {statsVisible ? animatedStats.happyRiders.toLocaleString() : '0'}
                      </div>
                      <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Happy Riders</div>
                      {/* Progress Indicator */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-dark ease-out"
                          style={{ 
                            width: statsVisible ? '100%' : '0%',
                            transition: 'width 2s ease-out'
                          }}
                        ></div>
                      </div>
                      {/* Tap hint for mobile */}
                      <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to refresh
                      </div>
                    </div>
                  </Card>

                  {/* Professional Drivers - Animated */}
                  <Card 
                    className="text-center hover:shadow-2xl active:scale-95 transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group w-full max-w-full touch-manipulation cursor-pointer"
                    onClick={() => {
                      setStatsVisible(false)
                      setTimeout(() => setStatsVisible(true), 100)
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-full">
                      <div className="w-full h-48 sm:h-56 md:h-48 mx-auto mb-3 sm:mb-4 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-xl group-hover:border-primary transition-all duration-300 transform group-hover:scale-105">
                        <img
                          src="https://www.staffingattiffanies.com/wp-content/uploads/2021/01/happy-male-chauffeur-driving-car.png"
                          alt="Professional Driver"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200'
                          }}
                        />
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary mb-1 sm:mb-2 font-serif transition-all duration-300">
                        {statsVisible ? animatedStats.drivers.toLocaleString() : '0'}
                      </div>
                      <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Professional Drivers</div>
                      {/* Progress Indicator */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-dark ease-out"
                          style={{ 
                            width: statsVisible ? '100%' : '0%',
                            transition: 'width 2s ease-out'
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to refresh
                      </div>
                    </div>
                  </Card>

                  {/* Completed Rides - Animated */}
                  <Card 
                    className="text-center hover:shadow-2xl active:scale-95 transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group w-full max-w-full touch-manipulation cursor-pointer"
                    onClick={() => {
                      setStatsVisible(false)
                      setTimeout(() => setStatsVisible(true), 100)
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-full">
                      <div className="w-full h-48 sm:h-56 md:h-48 mx-auto mb-3 sm:mb-4 rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl group-hover:border-primary transition-all duration-300 transform group-hover:scale-105">
                        <img
                          src="https://cdn.bookingkit.de/vendor_images/976872a4e8c7ab01720767b270d92968/detail/TRANSFERT564.jpg"
                          alt="Completed Rides"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=200'
                          }}
                        />
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary mb-1 sm:mb-2 font-serif transition-all duration-300">
                        {statsVisible ? `${animatedStats.completedRides.toLocaleString()}+` : '0+'}
                      </div>
                      <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Completed Rides</div>
                      {/* Progress Indicator */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-dark ease-out"
                          style={{ 
                            width: statsVisible ? '100%' : '0%',
                            transition: 'width 2s ease-out'
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to refresh
                      </div>
                    </div>
                  </Card>

                  {/* Rating - Animated */}
                  <Card 
                    className="text-center hover:shadow-2xl active:scale-95 transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group w-full max-w-full touch-manipulation cursor-pointer"
                    onClick={() => {
                      setStatsVisible(false)
                      setTimeout(() => setStatsVisible(true), 100)
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-full">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg group-hover:border-primary transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-dark/10">
                        <Star className="w-8 h-8 sm:w-10 sm:h-10 fill-primary text-primary" />
                      </div>
                      <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary mb-1 sm:mb-2 font-serif flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300">
                        {statsVisible ? animatedStats.rating.toFixed(1) : '0.0'} <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-primary text-primary" />
                      </div>
                      <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Rating</div>
                      {/* Progress Indicator */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-dark ease-out"
                          style={{ 
                            width: statsVisible ? `${(animatedStats.rating / 5) * 100}%` : '0%',
                            transition: 'width 2s ease-out'
                          }}
                        ></div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to refresh
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
