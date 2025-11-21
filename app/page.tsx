'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, Clock, Star, ArrowRight, Car, Shield, Zap, Phone, X, TrendingUp, Users, Navigation, Sparkles } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { VehicleType, Booking } from '@/types'
import { formatCurrency } from '@/lib/utils'

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
    features: ['Extra Space', 'Luggage', 'Party'],
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
  const [showSuggestions, setShowSuggestions] = useState<'pickup' | 'destination' | null>(null)
  const [recommendedVehicle, setRecommendedVehicle] = useState<VehicleType | null>(null)
  const [isBooking, setIsBooking] = useState(false)

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

      // Auto-advance carousel
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % vehicles.length)
      }, 5000)
      return () => clearInterval(interval)
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
      
      // Calculate ETA based on estimated time
      // Driver ETA is a portion of total trip time (e.g., 20-30%)
      const driverETAValue = Math.max(1, Math.round(estimatedTime * 0.25))
      setDriverETA(driverETAValue)
    } else if (!pickup || !destination) {
      // Default values when no pickup/destination
      setDriverDistance(4.6)
      setDriverETA(8)
    }
  }, [pickup, destination, estimatedDistance, estimatedTime])

  useEffect(() => {
    // Simulate live driver tracking with smart updates (only when pickup/destination provided)
    if (pickup && destination && driverDistance > 0.1) {
      const interval = setInterval(() => {
        setDriverDistance((prev) => {
          const newDistance = Math.max(0.1, prev - (Math.random() * 0.2 + 0.05))
          return parseFloat(newDistance.toFixed(1))
        })
        setDriverETA((prev) => Math.max(1, prev - Math.floor(Math.random() * 1.5 + 0.5)))
      }, 3000)
      return () => clearInterval(interval)
    } else if (!pickup || !destination) {
      // Keep updating with default simulation when no input
      const interval = setInterval(() => {
        setDriverDistance((prev) => {
          const newDistance = Math.max(0.1, prev - (Math.random() * 0.2 + 0.05))
          return parseFloat(newDistance.toFixed(1))
        })
        setDriverETA((prev) => Math.max(1, prev - Math.floor(Math.random() * 1.5 + 0.5)))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [pickup, destination, driverDistance])

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

  // Auto-detect location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting your location...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setPickup(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
          toast.success('Location detected!')
        },
        (error) => {
          toast.error('Unable to access location. Please enter manually.')
        }
      )
    } else {
      toast.error('Geolocation not supported')
    }
  }

  const handleVehicleSelect = (vehicleType: VehicleType) => {
    setSelectedVehicle(vehicleType)
    setShowVehicleInfo(true)
    setRecommendedVehicle(null) // Clear recommendation after selection
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
      toast.error('Please fill in all fields and select a vehicle')
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
    toast.success('🚗 Ride booked successfully! Your driver will be notified.')
    
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
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-primary z-10 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" />
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
                      <MapPin className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Live Driver Tracking</h3>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm">
                  <span>Driver is <span className="font-bold text-primary">{driverDistance.toFixed(1)} km</span> away</span>
                  <span>ETA: <span className="font-bold text-primary">{driverETA} min</span></span>
                </div>

                {/* Tracking Map */}
                <div className="h-48 bg-gray-100 rounded-xl overflow-hidden relative mb-4 border border-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
                  {/* Road */}
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 transform -translate-y-1/2">
                    <div className="absolute top-0 left-0 h-1 bg-primary animate-pulse" style={{ width: `${100 - (driverDistance * 10)}%` }}></div>
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-primary/30" style={{ transform: `translateX(${100 - (driverDistance * 10)}%)` }}></div>
                  </div>
                  {/* User Marker */}
                  <div className="absolute top-1/2 right-[10%] w-7 h-7 bg-blue-500 rounded-full transform -translate-y-1/2 shadow-lg border-2 border-white flex items-center justify-center z-10">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  {/* Driver Marker */}
                  <div 
                    className="absolute top-1/2 w-7 h-7 bg-primary rounded-full transform -translate-y-1/2 shadow-lg border-2 border-white flex items-center justify-center z-10 transition-all duration-1000"
                    style={{ left: `${15 + (driverDistance * 2)}%` }}
                  >
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  {/* Pulse Effect */}
                  <div 
                    className="absolute top-1/2 w-10 h-10 bg-primary/30 rounded-full transform -translate-y-1/2 -translate-x-1/2 animate-ping"
                    style={{ left: `${15 + (driverDistance * 2)}%` }}
                  ></div>
                      <div className="absolute bottom-2 left-0 right-0 text-center text-xs bg-cream px-2 py-1 rounded mx-2">
                    {driverDistance < 0.5 ? 'Driver has arrived' : driverDistance < 1 ? 'Driver is very close' : 'Driver on the way to pickup'}
                  </div>
                </div>

                {/* Driver Details */}
                <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t">
                  <div>
                    <div className="font-bold text-primary text-lg">{driverInfo.name.split(' ')[0]}</div>
                    <div className="text-xs text-gray-600">Driver Name</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary text-lg">{driverInfo.vehicle}</div>
                    <div className="text-xs text-gray-600">Vehicle</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary text-lg">{driverInfo.licensePlate}</div>
                    <div className="text-xs text-gray-600">License Plate</div>
                  </div>
                </div>
              </Card>

            {/* Smart Image Carousel */}
            <div className="w-full max-w-[600px] h-[200px] md:h-[250px] mb-6 rounded-2xl overflow-hidden relative shadow-xl border border-gray-200 group">
              <div className="relative w-full h-full">
                <img
                  src={vehicles[carouselIndex].image}
                  alt={`Luxride Vehicle ${carouselIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Vehicle Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="font-bold text-lg mb-1">{vehicles[carouselIndex].name}</div>
                  <div className="text-sm opacity-90">{formatCurrency(vehicles[carouselIndex].ratePerKm)}/km</div>
                </div>
                
                {/* Carousel Controls */}
                <button
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  ←
                </button>
                <button
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % vehicles.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  →
                </button>
                
                {/* Carousel Dots */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {vehicles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === carouselIndex ? 'bg-primary w-8' : 'bg-cream-light/70 w-2 hover:bg-cream-light/90'
                      }`}
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
                      💡 Recommended: <span className="text-primary">{vehicles.find(v => v.type === recommendedVehicle)?.name}</span> based on your route
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicle Grid with Smart Sorting */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                      relative p-4 rounded-2xl transition-all duration-300 overflow-hidden group
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
                    <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      {/* Badge */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {vehicle.badge === 'Popular' && '⭐'}
                        {vehicle.badge === 'Premium' && '👑'}
                        {vehicle.badge === 'Adventure' && '🏔️'}
                        {vehicle.badge === 'Group' && '👥'}
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
                      <div className="text-primary font-bold text-lg">⭐</div>
                      <div className="text-xs text-gray-600 mt-1">Premium</div>
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

                <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Driver Information Section */}
              {(pickup && destination && selectedVehicle) && (
                <Card className="mt-6 text-center animate-fade-in">
                  <h3 className="text-xl font-bold mb-4 font-serif">Your Driver</h3>
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-primary shadow-lg relative">
                    <img
                      src="https://img.freepik.com/premium-photo/photo-middle-aged-driver-man-sitting-yellow-taxi-driving-city-street-with-smile-holding-hands-steering-wheel_726520-4334.jpg"
                      alt="Driver"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600'
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <a
                      href="tel:+1-800-555-1234"
                      className="block w-full py-3 font-medium btn-primary text-base flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                    >
                      <Phone className="w-5 h-5" />
                      Call Driver
                    </a>
                    <Button
                      variant="danger"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setPickup('')
                        setDestination('')
                        setSelectedVehicle(null)
                        setShowVehicleInfo(false)
                        toast.success('Ride cancelled')
                      }}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel Ride
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold font-serif mb-2">{driverInfo.name}</h4>
                    <p className="text-gray-600 text-sm mb-1">
                      Rating: <span className="text-primary font-semibold">★★★★★ 4.8</span>
                    </p>
                    <p className="text-gray-600 text-sm mb-1">Vehicle: {driverInfo.vehicle}</p>
                    <p className="text-gray-600 text-sm">License Plate: {driverInfo.licensePlate}</p>
                  </div>

                  {/* Rating Section */}
                  <div className="mt-6 p-4 bg-cream-light rounded-xl">
                    <h4 className="text-lg font-bold mb-3 flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                      Rate Your Driver
                    </h4>
                    <div className="flex gap-1 justify-center mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-all ${
                            star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-yellow-300 hover:scale-105'
                          }`}
                        >
                          <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Leave feedback..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2 mb-3 focus:ring-2 focus:ring-primary text-sm"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (rating > 0) {
                          toast.success('Thank you for your feedback! ⭐')
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
                          toast.error('Please select a rating')
                        }
                      }}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </Card>
              )}
            </Card>

            {/* Features Section */}
            <section className="py-12 w-full mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Compact heading with background design */}
                <div className="flex items-center justify-center mb-12">
                  <div className="relative px-4 py-2 bg-cream rounded-xl border border-primary/20 shadow-md">
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 rounded-xl"></div>
                    
                    {/* Text */}
                    <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                      Why Choose Luxride?
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Premium Vehicles</h3>
                    <p className="text-gray-600">
                      Travel in style with our luxury fleet of professionally maintained vehicles
                    </p>
                  </Card>

                  <Card className="text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
                    <p className="text-gray-600">
                      Your safety is our priority. All drivers are verified and background checked
                    </p>
                  </Card>

                  <Card className="text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Fast & Reliable</h3>
                    <p className="text-gray-600">
                      Quick response times and reliable service, whenever you need us
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-200 w-full mt-12 rounded-2xl mx-4 md:mx-auto max-w-7xl overflow-hidden relative">
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-dark rounded-full blur-3xl"></div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {/* Happy Riders */}
                  <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-full">
                      <div className="w-full h-48 sm:h-56 md:h-48 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl group-hover:border-primary transition-all duration-300 transform group-hover:scale-105">
                        <img
                          src="https://poloandtweed.com/wp-content/uploads/2021/04/Aafkes-Blog-Photos-47.png"
                          alt="Happy Rider"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200'
                          }}
                        />
                      </div>
                      <div className="text-5xl md:text-6xl font-extrabold text-primary mb-2 font-serif">500</div>
                      <div className="text-gray-700 font-semibold text-sm md:text-base">Happy Riders</div>
                    </div>
                  </Card>

                  {/* Professional Drivers */}
                  <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-full">
                      <div className="w-full h-48 sm:h-56 md:h-48 mx-auto mb-4 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-xl group-hover:border-primary transition-all duration-300 transform group-hover:scale-105">
                        <img
                          src="https://www.staffingattiffanies.com/wp-content/uploads/2021/01/happy-male-chauffeur-driving-car.png"
                          alt="Professional Driver"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200'
                          }}
                        />
                      </div>
                      <div className="text-5xl md:text-6xl font-extrabold text-primary mb-2 font-serif">30</div>
                      <div className="text-gray-700 font-semibold text-sm md:text-base">Professional Drivers</div>
                    </div>
                  </Card>

                  {/* Completed Rides */}
                  <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 w-full">
                      <div className="w-full h-48 sm:h-56 md:h-48 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl group-hover:border-primary transition-all duration-300 transform group-hover:scale-105">
                        <img
                          src="https://cdn.bookingkit.de/vendor_images/976872a4e8c7ab01720767b270d92968/detail/TRANSFERT564.jpg"
                          alt="Completed Rides"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=200'
                          }}
                        />
                      </div>
                      <div className="text-5xl md:text-6xl font-extrabold text-primary mb-2 font-serif">500+</div>
                      <div className="text-gray-700 font-semibold text-sm md:text-base">Completed Rides</div>
                    </div>
                  </Card>

                  {/* Rating */}
                  <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-2 border-primary/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg group-hover:border-primary transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-dark/10">
                        <Star className="w-10 h-10 fill-primary text-primary" />
                      </div>
                      <div className="text-5xl md:text-6xl font-extrabold text-primary mb-2 font-serif flex items-center justify-center gap-2">
                        4.9 <Star className="w-8 h-8 fill-primary text-primary" />
                      </div>
                      <div className="text-gray-700 font-semibold text-sm md:text-base">Rating</div>
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
