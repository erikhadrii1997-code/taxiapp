'use client'

import { useEffect, useState } from 'react'
import { User as UserIcon, Mail, Phone, Camera, Car } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        setName(parsed.name || '')
        setEmail(parsed.email || '')
        setPhone(parsed.phone || '')
        // Load photo if it exists
        if (parsed.photo) {
          setPhoto(parsed.photo)
        }
      }
    }
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
        toast.success('Photo uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      const updatedUser = {
        ...(user || {}),
        id: user?.id || `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        photo: photo || user?.photo || null,
        updatedAt: new Date().toISOString(),
      }
      
      // Update in allUsers array
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]')
      const userIndex = allUsers.findIndex((u: any) => u.id === updatedUser.id)
      
      if (userIndex !== -1) {
        allUsers[userIndex] = { ...allUsers[userIndex], ...updatedUser }
      } else {
        // If user doesn't exist in allUsers, add them
        allUsers.push(updatedUser)
      }
      localStorage.setItem('allUsers', JSON.stringify(allUsers))
      
      // Save current user session
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update the user state to reflect saved changes
      setUser(updatedUser)
      
      toast.success('Profile updated successfully')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact heading with background design */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative px-4 py-3 bg-cream rounded-xl border border-primary/20 shadow-md">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 rounded-xl"></div>
              
              {/* Text */}
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Car className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                    Profile
                  </h1>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Manage your account information</p>
              </div>
            </div>
          </div>

          <Card>
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {(photo || user?.photo) ? (
                    <img src={photo || user?.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold mt-4">{name || user?.name || 'User'}</h2>
              <p className="text-gray-600">{email || user?.email || ''}</p>
            </div>

            <div className="space-y-6">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon className="w-5 h-5" />}
                placeholder="Enter your full name"
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                placeholder="Enter your email"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-5 h-5" />}
                placeholder="Enter your phone number"
              />

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} variant="primary" size="lg">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

