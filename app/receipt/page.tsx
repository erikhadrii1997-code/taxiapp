'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Printer, Download, MapPin, Calendar, Car, DollarSign, Star, Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Booking } from '@/types'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/map/BookingMap'), {
  ssr: false,
})

function ReceiptContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookingId = searchParams.get('id')
      if (bookingId) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        const found = bookings.find((b: Booking) => b.id === bookingId)
        if (found) {
          setBooking(found)
        } else {
          // Try trips
          const trips = JSON.parse(localStorage.getItem('trips') || '[]')
          const trip = trips.find((t: any) => t.id === bookingId)
          if (trip) {
            setBooking({
              id: trip.id,
              pickup: trip.route.split(' to ')[0],
              destination: trip.route.split(' to ')[1] || trip.route,
              date: trip.date,
              time: '',
              datetime: trip.date,
              vehicleType: trip.type.toLowerCase().replace(' ', '-') as any,
              vehicleName: trip.type,
              price: trip.price,
              status: trip.status.toLowerCase() as any,
              timestamp: trip.date,
            })
          }
        }
      }
    }
  }, [searchParams])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!booking) return
    
    const content = `
LUXRIDE RECEIPT
==============================

Booking ID: ${booking.id}
Date: ${formatDateTime(booking.datetime || booking.timestamp)}
Status: ${booking.status.toUpperCase()}

PICKUP LOCATION
${booking.pickup}

DESTINATION
${booking.destination}

VEHICLE
${booking.vehicleName}

FARE BREAKDOWN
Base Fare: $10.00
Distance: ${booking.distance || 0} km
Time: ${booking.duration || 0} min
--------------------------------
TOTAL: ${formatCurrency(booking.price)}

Payment Method: Cash/Card
Driver: ${booking.driver || 'Assigned Driver'}

Thank you for choosing Luxride!
    `
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `luxride-receipt-${booking.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRate = (stars: number) => {
    setRating(stars)
    // Save rating
    if (booking && typeof window !== 'undefined') {
      const ratings = JSON.parse(localStorage.getItem('ratings') || '[]')
      ratings.push({
        bookingId: booking.id,
        rating: stars,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('ratings', JSON.stringify(ratings))
    }
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
              <p className="text-gray-600 mb-6">The receipt you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/trips')} variant="primary">
                View Trips
              </Button>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 print:bg-white">
      <Navbar />
      
      <main className="pt-20 pb-12 print:pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="print:shadow-none">
            {/* Receipt Header */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary-dark/10 border-b-2 border-primary/20 rounded-t-2xl p-8 mb-6 print:bg-gray-900">
              <div className="text-center">
                <h1 className="text-4xl font-bold font-serif mb-2 bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">Luxride</h1>
                <p className="text-primary-dark font-medium">Premium Transportation</p>
              </div>
            </div>

            {/* Booking Info */}
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-bold text-lg">{booking.id}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold">{formatDateTime(booking.datetime || booking.timestamp)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-semibold">{booking.vehicleName}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Route</p>
                  <p className="font-semibold">{booking.pickup}</p>
                  <div className="flex items-center gap-2 my-2">
                    <div className="w-4 h-8 border-l-2 border-primary"></div>
                  </div>
                  <p className="font-semibold">{booking.destination}</p>
                </div>
              </div>
            </div>

            {/* Map with Stylish Design */}
            <div className="mb-6 relative">
              {/* Decorative background layers */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Outer decorative ring */}
                <div className="absolute w-full h-96 border-4 border-primary/20 rounded-full"></div>
                {/* Middle decorative ring */}
                <div className="absolute w-[95%] h-[91%] border-2 border-primary/30 rounded-full"></div>
                {/* Inner decorative ring */}
                <div className="absolute w-[90%] h-[86%] border border-primary/40 rounded-full"></div>
              </div>
              
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-full h-96 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 rounded-full blur-xl"></div>
              </div>
              
              {/* Map container with enhanced styling */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="relative h-96 w-full overflow-hidden border-4 border-primary/30 shadow-2xl" style={{ borderRadius: '50%' }}>
                  {/* Inner shadow for depth */}
                  <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)' }}></div>
                  <MapComponent pickup={booking.pickup} dropoff={booking.destination} />
                </div>
              </div>
              
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/20 to-transparent rounded-tr-full pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/20 to-transparent rounded-tl-full pointer-events-none"></div>
            </div>

            {/* Fare Breakdown */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Fare Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-semibold">$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-semibold">{booking.distance?.toFixed(1) || '0.0'} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{booking.duration || 0} min</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(booking.price)}</span>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            {booking.status === 'completed' && (
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-lg font-bold mb-4">Rate Your Ride</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className={`transition-all duration-200 ${
                        star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-green-600 font-semibold flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Thank you for your feedback!
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 print:hidden">
              <Button onClick={handlePrint} variant="primary" className="flex-1">
                <Printer className="mr-2 w-5 h-5" />
                Print Receipt
              </Button>
              <Button onClick={handleDownload} variant="secondary" className="flex-1">
                <Download className="mr-2 w-5 h-5" />
                Download
              </Button>
            </div>
          </Card>

          <div className="mt-6 text-center print:hidden">
            <button 
              onClick={() => router.push('/trips')} 
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Back to Trips
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Loading Receipt...</h1>
              <p className="text-gray-600">Please wait while we load your receipt.</p>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  )
}

