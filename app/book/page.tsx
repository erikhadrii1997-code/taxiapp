'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MapPin, Calendar, ChevronRight, ChevronLeft, Check, Car } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { VehicleType, Vehicle } from '@/types'
import { formatCurrency } from '@/lib/utils'

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map/BookingMap'), {
  ssr: false,
})

const vehicles: Vehicle[] = [
  {
    type: 'standard',
    name: 'Standard Sedan',
    ratePerKm: 2.5,
    capacity: 4,
    image: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    type: 'premium',
    name: 'Premium SUV',
    ratePerKm: 3.5,
    capacity: 6,
    image: 'https://images.pexels.com/photos/3764988/pexels-photo-3764988.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    type: 'luxury',
    name: 'Luxury Van',
    ratePerKm: 4.0,
    capacity: 8,
    image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    type: 'xl',
    name: 'XL Executive',
    ratePerKm: 5.0,
    capacity: 10,
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
]

export default function BookPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [datetime, setDatetime] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null)
  const [estimatedDistance, setEstimatedDistance] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  useEffect(() => {
    // Set default datetime to 1 hour from now
    const now = new Date()
    now.setHours(now.getHours() + 1)
    setDatetime(now.toISOString().slice(0, 16))
  }, [])

  const calculateEstimate = () => {
    if (!selectedVehicle || !pickup || !dropoff) return

    const vehicle = vehicles.find(v => v.type === selectedVehicle)
    if (!vehicle) return

    // Mock distance and time calculation
    const distance = Math.random() * 20 + 5 // 5-25 km
    const time = Math.round(distance * 2) // ~2 min per km

    const baseFare = 10
    const distanceCost = distance * vehicle.ratePerKm
    const timeCost = time * 0.5
    const total = baseFare + distanceCost + timeCost

    setEstimatedDistance(distance)
    setEstimatedTime(time)
    setEstimatedPrice(total)
  }

  useEffect(() => {
    if (pickup && dropoff && selectedVehicle) {
      calculateEstimate()
    }
  }, [pickup, dropoff, selectedVehicle])

  const handleNext = () => {
    if (currentStep === 1) {
      if (!pickup || !dropoff || !datetime) {
        toast.error('Please fill in all fields')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!selectedVehicle) {
        toast.error('Please select a vehicle')
        return
      }
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleBook = () => {
    if (!selectedVehicle || !pickup || !dropoff || !datetime) {
      toast.error('Please complete all steps')
      return
    }

    const vehicle = vehicles.find(v => v.type === selectedVehicle)
    const booking = {
      id: `booking-${Date.now()}`,
      pickup,
      destination: dropoff,
      date: datetime.split('T')[0],
      time: datetime.split('T')[1],
      datetime,
      vehicleType: selectedVehicle!,
      vehicleName: vehicle?.name || '',
      price: estimatedPrice,
      status: 'requested' as const,
      timestamp: new Date().toISOString(),
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
      bookings.unshift(booking)
      localStorage.setItem('bookings', JSON.stringify(bookings))

      const trips = JSON.parse(localStorage.getItem('trips') || '[]')
      trips.unshift({
        id: booking.id,
        route: `${pickup} to ${dropoff}`,
        date: booking.date,
        type: vehicle?.name || '',
        price: estimatedPrice,
        status: 'Upcoming',
      })
      localStorage.setItem('trips', JSON.stringify(trips))

      // Create notification for inbox
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'booking_confirmed',
        title: 'Ride Booked Successfully',
        message: `Your ride from ${pickup} to ${dropoff} has been booked. ${vehicle?.name || 'Vehicle'} will pick you up.`,
        timestamp: new Date().toISOString(),
        read: false,
        booking: booking,
      }
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      notifications.unshift(notification)
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }

    toast.success('Ride booked successfully!')
    router.push('/trips')
  }

  const selectedVehicleData = vehicles.find(v => v.type === selectedVehicle)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Car className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Book Your Ride
                </h1>
              </div>
              <p className="text-gray-600">Choose your perfect vehicle and get on the road</p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center flex-1 ${step < 3 ? 'mr-2' : ''}`}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                        currentStep === step
                          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                          : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step ? <Check className="w-6 h-6" /> : step}
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-600">
                      {step === 1 ? 'Location' : step === 2 ? 'Vehicle' : 'Confirm'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Location */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <Input
                  placeholder="Pickup Location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  icon={<MapPin className="w-5 h-5" />}
                />

                <Input
                  placeholder="Dropoff Location"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  icon={<MapPin className="w-5 h-5" />}
                />

                <Input
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  icon={<Calendar className="w-5 h-5" />}
                />

                <div className="flex justify-end">
                  <Button onClick={handleNext} variant="primary">
                    Next
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold font-serif mb-4">Select Vehicle</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.type}
                      onClick={() => setSelectedVehicle(vehicle.type)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedVehicle === vehicle.type
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-xl font-bold mb-2">{vehicle.name}</h3>
                      <p className="text-gray-600">
                        {formatCurrency(vehicle.ratePerKm)}/km • {vehicle.capacity} seats
                      </p>
                      {selectedVehicle === vehicle.type && (
                        <div className="mt-4 text-primary font-semibold flex items-center">
                          <Check className="w-5 h-5 mr-2" />
                          Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button onClick={handleBack} variant="secondary">
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button onClick={handleNext} variant="primary">
                    Next
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold font-serif mb-4">Confirm Your Booking</h2>

                {/* Map */}
                <div className="h-64 w-full rounded-xl overflow-hidden mb-6">
                  <MapComponent pickup={pickup} dropoff={dropoff} />
                </div>

                {/* Booking Details */}
                <Card>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Pickup:</span>
                      <span className="text-gray-900">{pickup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Dropoff:</span>
                      <span className="text-gray-900">{dropoff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Date & Time:</span>
                      <span className="text-gray-900">
                        {new Date(datetime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Vehicle:</span>
                      <span className="text-gray-900">{selectedVehicleData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Distance:</span>
                      <span className="text-gray-900">{estimatedDistance.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Est. Time:</span>
                      <span className="text-gray-900">{estimatedTime} min</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(estimatedPrice)}</span>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-between">
                  <Button onClick={handleBack} variant="secondary">
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button onClick={handleBook} variant="primary" size="lg">
                    Book Now
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

