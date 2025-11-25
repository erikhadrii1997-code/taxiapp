'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Car, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Footer from '@/components/layout/Footer'

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'rider' | 'driver'>('rider')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    // Simulate login - check against stored users
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Get all users from storage
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]')
        
        // Find user by email/phone and password
        const foundUser = allUsers.find((u: any) => 
          (u.email === email || u.phone === email) && 
          u.password === password && 
          u.userType === userType
        )

        if (foundUser) {
          // Update login time and save current user
          const userData = {
            ...foundUser,
            loginTime: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          }

          // Update in allUsers array
          const updatedUsers = allUsers.map((u: any) => 
            u.id === foundUser.id ? userData : u
          )
          localStorage.setItem('allUsers', JSON.stringify(updatedUsers))

          // Save current user session
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('userType', userType)

          toast.success(`${userType === 'driver' ? 'Driver' : 'Rider'} login successful!`)
          
          if (userType === 'driver') {
            router.push('/driver')
          } else {
            router.push('/')
          }
        } else {
          toast.error('Invalid email or password')
        }
      }
      
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md animate-fade-in relative overflow-hidden bg-cream p-0">
          {/* Car Photo Section at Top */}
          <div className="relative -mx-6 -mt-6 mb-0">
            <div className="w-full h-48 rounded-t-xl overflow-hidden">
              <img
                src="https://cdn.motor1.com/images/mgl/G33erV/s1/mercedes-maybach-haute-voiture-concept-al-design-essentials-iv.webp"
                alt="Luxury Vehicle"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=600'
                }}
              />
            </div>
          </div>

          {/* Content Section with Solid Background */}
          <div className="bg-cream px-6 pb-6 pt-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center text-white shadow-lg">
                <Car className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-bold font-serif bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Welcome Back
              </h1>
            </div>
            <p className="text-gray-600">Sign in to your Luxride account</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setUserType('rider')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  userType === 'rider'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
                Rider Login
              </button>
              <button
                type="button"
                onClick={() => setUserType('driver')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  userType === 'driver'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Car className="w-4 h-4" />
                Driver Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="Email or Phone Number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link href="#" className="text-sm text-primary hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

