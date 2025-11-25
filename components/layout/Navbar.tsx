'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, Menu, X, Home, History, Inbox, User, LogOut, CalendarPlus, LogIn, UserPlus } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const updateAuthState = () => {
      if (typeof window !== 'undefined') {
        const storedUserType = localStorage.getItem('userType')
        const userData = localStorage.getItem('user')
        setUserType(storedUserType)
        setIsLoggedIn(!!userData)
      }
    }

    // Initial load
    updateAuthState()

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', updateAuthState)

    // Also check on focus (when user returns to tab)
    window.addEventListener('focus', updateAuthState)

    return () => {
      window.removeEventListener('storage', updateAuthState)
      window.removeEventListener('focus', updateAuthState)
    }
  }, [])

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/book', label: 'Book Ride', icon: CalendarPlus },
    { href: '/trips', label: 'Trip History', icon: History },
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/driver', label: 'Driver', icon: Car },
    { href: '/login', label: 'Login', icon: LogIn },
    { href: '/signup', label: 'Sign Up', icon: UserPlus },
  ]

  const isActive = (href: string) => {
    if (href === '/driver') {
      return pathname === '/driver' || pathname.startsWith('/driver/')
    }
    return pathname === href
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-lg border-b-2 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center text-white shadow-lg">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-serif text-gray-900">Luxride</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 ml-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {isLoggedIn && (
              <Link
                href="/login"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('user')
                    localStorage.removeItem('userType')
                    setIsLoggedIn(false)
                    setUserType(null)
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {isLoggedIn && (
              <Link
                href="/login"
                onClick={() => {
                  setIsOpen(false)
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('user')
                    localStorage.removeItem('userType')
                    setIsLoggedIn(false)
                    setUserType(null)
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

