'use client'

import { useEffect, useRef } from 'react'
import { Car } from 'lucide-react'

interface TaxiAnimationProps {
  className?: string
}

export default function TaxiAnimation({ className = '' }: TaxiAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(() => {
        // Autoplay was prevented, user interaction required
      })
    }
  }, [])

  return (
    <div className={`relative w-full ${className} animate-fade-in`}>
      {/* Branded container with gradient border */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 md:p-4 shadow-xl border-2 md:border-[3px] border-primary/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:border-primary/40">
        {/* Decorative corner accents with animation - responsive sizing */}
        <div className="absolute top-0 left-0 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 border-t-2 md:border-t-[3px] border-l-2 md:border-l-[3px] border-primary/30 rounded-tl-2xl md:rounded-tl-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 border-t-2 md:border-t-[3px] border-r-2 md:border-r-[3px] border-primary/30 rounded-tr-2xl md:rounded-tr-3xl animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute bottom-0 left-0 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 border-b-2 md:border-b-[3px] border-l-2 md:border-l-[3px] border-primary/30 rounded-bl-2xl md:rounded-bl-3xl animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 border-b-2 md:border-b-[3px] border-r-2 md:border-r-[3px] border-primary/30 rounded-br-2xl md:rounded-br-3xl animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        
        {/* Video container */}
        <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            style={{
              filter: 'brightness(1.1) contrast(1.05)',
            }}
          >
            <source src="/taxi-animation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Taxi Icon - Professional placement in top-right corner */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-2xl border-2 border-white/30 backdrop-blur-sm">
                <Car className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
              </div>
              {/* Pulse ring effect */}
              <div className="absolute inset-0 bg-primary rounded-xl animate-ping opacity-30"></div>
              <div className="absolute -inset-1 bg-primary/20 rounded-xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Classic Taxi Roof Sign - Professional placement in top-left corner */}
          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-2xl border-2 border-yellow-300/50 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-xs md:text-sm tracking-wider">TAXI</span>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-400 rounded-lg animate-pulse opacity-30 blur-sm -z-10"></div>
            </div>
          </div>
        </div>
        
        {/* Branding badge - larger and more visible */}
        <div className="absolute -bottom-3 md:-bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary-dark text-white text-xs md:text-sm lg:text-base font-bold px-4 md:px-6 lg:px-8 py-1.5 md:py-2 rounded-full shadow-xl border-2 md:border-[3px] border-white/20 backdrop-blur-sm">
          <span className="flex items-center gap-2 md:gap-2.5">
            <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full animate-pulse"></span>
            <span>Your Ride is Coming</span>
          </span>
        </div>
      </div>
    </div>
  )
}

