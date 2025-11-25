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
      {/* Premium outer glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary-dark to-primary rounded-3xl opacity-20 blur-xl animate-pulse"></div>
      
      {/* Branded container with premium design */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-white via-cream-light to-white p-4 md:p-5 shadow-2xl border-2 md:border-[3px] border-primary/30 backdrop-blur-md hover:shadow-[0_20px_60px_rgba(212,175,55,0.3)] transition-all duration-500 hover:border-primary/60 hover:scale-[1.01]">
        {/* Premium decorative frame with multiple layers */}
        <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-primary-dark/5 pointer-events-none"></div>
        <div className="absolute inset-[2px] md:inset-[3px] rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/90 to-cream-light/90 pointer-events-none"></div>
        
        {/* Elegant corner accents with premium styling */}
        <div className="absolute top-0 left-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
          <div className="absolute top-0 left-0 w-full h-full border-t-[3px] md:border-t-[4px] border-l-[3px] md:border-l-[4px] border-primary/40 rounded-tl-2xl md:rounded-tl-3xl"></div>
          <div className="absolute top-1 left-1 md:top-2 md:left-2 w-3 h-3 md:w-4 md:h-4 bg-primary/20 rounded-tl-lg animate-pulse"></div>
        </div>
        <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
          <div className="absolute top-0 right-0 w-full h-full border-t-[3px] md:border-t-[4px] border-r-[3px] md:border-r-[4px] border-primary/40 rounded-tr-2xl md:rounded-tr-3xl" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-1 right-1 md:top-2 md:right-2 w-3 h-3 md:w-4 md:h-4 bg-primary/20 rounded-tr-lg animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
          <div className="absolute bottom-0 left-0 w-full h-full border-b-[3px] md:border-b-[4px] border-l-[3px] md:border-l-[4px] border-primary/40 rounded-bl-2xl md:rounded-bl-3xl" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 w-3 h-3 md:w-4 md:h-4 bg-primary/20 rounded-bl-lg animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20">
          <div className="absolute bottom-0 right-0 w-full h-full border-b-[3px] md:border-b-[4px] border-r-[3px] md:border-r-[4px] border-primary/40 rounded-br-2xl md:rounded-br-3xl" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-3 h-3 md:w-4 md:h-4 bg-primary/20 rounded-br-lg animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        </div>
        
        {/* Premium video container with sophisticated styling */}
        <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-video shadow-inner border border-primary/20">
          {/* Elegant inner border */}
          <div className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-primary/10 pointer-events-none z-10"></div>
          
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            style={{
              filter: 'brightness(1.15) contrast(1.1) saturate(1.1)',
            }}
          >
            <source src="/taxi-animation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Premium overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/8 via-transparent to-transparent pointer-events-none z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/5 pointer-events-none z-10"></div>
          
          {/* Sophisticated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-10"></div>
          
          {/* Premium Taxi Icon - Enhanced design */}
          <div className="absolute top-4 right-4 md:top-5 md:right-5 z-20">
            <div className="relative group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary via-primary-dark to-primary-dark rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/40 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                <Car className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
              </div>
              {/* Multi-layer pulse effects */}
              <div className="absolute inset-0 bg-primary rounded-2xl animate-ping opacity-20"></div>
              <div className="absolute -inset-1 bg-primary/30 rounded-2xl animate-pulse blur-sm"></div>
              <div className="absolute -inset-2 bg-primary/10 rounded-2xl"></div>
            </div>
          </div>
          
          {/* Premium Taxi Roof Sign - Enhanced styling */}
          <div className="absolute top-4 left-4 md:top-5 md:left-5 z-20">
            <div className="relative group">
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 shadow-2xl border-2 border-yellow-300/60 backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg tracking-wider drop-shadow-lg">TAXI</span>
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
              {/* Enhanced glow effects */}
              <div className="absolute inset-0 bg-yellow-400 rounded-xl animate-pulse opacity-40 blur-lg -z-10"></div>
              <div className="absolute -inset-1 bg-yellow-300/30 rounded-xl blur-md"></div>
            </div>
          </div>
        </div>
        
        {/* Premium Branding Badge - Enhanced design */}
        <div className="absolute -bottom-4 md:-bottom-5 left-1/2 transform -translate-x-1/2 z-30">
          <div className="relative">
            <div className="bg-gradient-to-r from-primary via-primary-dark to-primary text-white text-xs md:text-sm lg:text-base font-bold px-5 md:px-7 lg:px-9 py-2 md:py-2.5 rounded-full shadow-2xl border-2 md:border-[3px] border-white/30 backdrop-blur-md">
              <span className="flex items-center gap-2.5 md:gap-3">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-pulse shadow-lg"></span>
                <span className="drop-shadow-md">Your Ride is Coming</span>
              </span>
            </div>
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse opacity-30 blur-xl -z-10"></div>
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
