'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import { Notification } from '@/types'
import { formatDateTime } from '@/lib/utils'

export default function InboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load notifications from localStorage
      const stored = localStorage.getItem('notifications')
      if (stored) {
        setNotifications(JSON.parse(stored))
      }
    }
  }, [])

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(updated))
    }
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(updated))
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                    Inbox
                  </h1>
                  {unreadCount > 0 && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {unreadCount}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
          </div>

          {notifications.length === 0 ? (
            <Card className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No notifications</h2>
              <p className="text-gray-600">You're all caught up!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${
                    !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-3 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-7 h-7" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <X className="w-7 h-7" />
                      </button>
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

