'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Car, DollarSign } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trip } from '@/types'

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTrips = localStorage.getItem('trips')
      if (storedTrips) {
        setTrips(JSON.parse(storedTrips))
      }
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-300'
      case 'upcoming':
        return 'bg-red-50 text-red-700 border-red-300'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-300'
      case 'in-progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact heading with background design */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative px-4 py-3 bg-cream rounded-xl border border-primary/20 shadow-md">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 rounded-xl"></div>
              
              {/* Text */}
              <div className="relative z-10 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent mb-1">
                  Trip History
                </h1>
                <p className="text-gray-600 text-sm md:text-base">View your past and upcoming rides</p>
              </div>
            </div>
          </div>

          {trips.length === 0 ? (
            <Card className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No trips yet</h2>
              <p className="text-gray-600">Book your first ride to see it here</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-xl transition-shadow duration-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold">{trip.route}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(trip.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-6 h-6" />
                          <span>{trip.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(trip.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {trip.status.toLowerCase() === 'upcoming' ? (
                        <span
                          className="
                            inline-flex items-center justify-center
                            px-4 py-2 rounded-xl text-sm font-semibold
                            bg-gradient-to-r from-red-600 to-red-700 text-white
                            shadow-md hover:shadow-lg hover:-translate-y-0.5
                            transition-all duration-200
                          "
                        >
                          {trip.status}
                        </span>
                      ) : (
                        <span
                          className={`
                            px-5 py-2.5 rounded-xl text-sm font-semibold
                            shadow-sm border transition-all duration-200
                            ${getStatusColor(trip.status)}
                          `}
                        >
                          {trip.status}
                        </span>
                      )}
                      <Link href={`/receipt?id=${trip.id}`}>
                        <Button variant="primary" size="sm">
                          View Receipt
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

