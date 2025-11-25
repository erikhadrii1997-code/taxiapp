'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Car, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Footer from '@/components/layout/Footer'

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'rider' | 'driver'>('rider')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    // Simulate signup
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Get all existing users
        const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]')
        
        // Check if email already exists
        const emailExists = existingUsers.some((u: any) => u.email === email)
        if (emailExists) {
          toast.error('An account with this email already exists')
          setIsLoading(false)
          return
        }

        // Create new user with all information including password
        const userData = {
          id: `user-${Date.now()}`,
          name,
          email,
          phone: phone || '',
          password, // Store password
          userType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          photo: null,
        }

        // Add to all users list
        existingUsers.push(userData)
        localStorage.setItem('allUsers', JSON.stringify(existingUsers))

        // Save current user
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('userType', userType)

        // If driver, also save to driverProfile
        if (userType === 'driver') {
          const driverProfile = {
            firstName: name.split(' ')[0] || name,
            lastName: name.split(' ').slice(1).join(' ') || '',
            fullName: name,
            email,
            phone: phone || '',
            driverId: `DR-${Date.now().toString().slice(-4)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          localStorage.setItem('driverProfile', JSON.stringify(driverProfile))
        }
      }
      
      toast.success(`Account created successfully! Welcome, ${name}`)
      
      if (userType === 'driver') {
        router.push('/driver')
      } else {
        router.push('/')
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
                Create Account
              </h1>
            </div>
            <p className="text-gray-600">Join Luxride today</p>
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
                Rider
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
                Driver
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-5 h-5" />}
              required
            />

            <Input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
              autoComplete="email"
            />

            <Input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-5 h-5" />}
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
              autoComplete="new-password"
              minLength={1}
            />

            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
              autoComplete="new-password"
              minLength={1}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-6"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

