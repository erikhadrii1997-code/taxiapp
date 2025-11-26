'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp } from 'lucide-react'

interface SatisfactionMeterProps {
  className?: string
}

export default function SatisfactionMeter({ className = '' }: SatisfactionMeterProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [satisfaction, setSatisfaction] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const animationRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const startAnimation = () => {
    if (hasStarted && !isComplete) return
    
    setHasStarted(true)
    setIsAnimating(true)
    setIsComplete(false)
    setSatisfaction(0)

    const duration = 3000 // 3 seconds to show all numbers
    const targetValue = 99.9
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Linear progression - use exact value for smooth fill from the beginning
      const currentValue = progress * targetValue
      
      // Set the exact value so the circle fills smoothly from 0.0%
      setSatisfaction(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setSatisfaction(targetValue)
        setIsAnimating(false)
        setIsComplete(true)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Calculate circle dimensions
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (satisfaction / 100) * circumference

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center ${className}`}
      onClick={!isComplete ? startAnimation : undefined}
    >
      {/* Main Spinner Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] cursor-pointer">
        {/* SVG Circle Container */}
        <svg 
          className="transform -rotate-90 w-full h-full" 
          viewBox="0 0 200 200"
        >
          {/* Background track - subtle gray */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            opacity="0.3"
          />

          {/* Main progress circle - fills gradually from the beginning */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />


          {/* Gradient definitions */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4b5563" stopOpacity="1" />
              <stop offset="100%" stopColor="#4b5563" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Main Percentage Display */}
          <div className="text-center mb-2">
            <div className="flex items-baseline justify-center gap-1">
              <span 
                className="text-6xl sm:text-7xl font-light tracking-tight text-gray-900 tabular-nums"
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                }}
              >
                {Math.min(satisfaction, 99.9).toFixed(1)}
              </span>
              <span className="text-3xl sm:text-4xl font-light text-gray-600">%</span>
            </div>
          </div>

          {/* Label */}
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-medium tracking-wide uppercase" style={{ letterSpacing: '0.1em' }}>
              Satisfaction
            </span>
          </div>

          {/* Status Text */}
          <div className="mt-2">
            {!hasStarted ? (
              <span className="text-xs text-gray-400 font-medium">Click to measure</span>
            ) : isAnimating ? (
              <span className="text-xs text-gray-700 font-medium animate-pulse">Measuring...</span>
            ) : (
              <span className="text-xs text-green-600 font-medium">Complete</span>
            )}
          </div>
        </div>

        {/* Click indicator - subtle pulse when not started */}
        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 rounded-full bg-gray-600/40 animate-ping"></div>
          </div>
        )}
      </div>

    </div>
  )
}
