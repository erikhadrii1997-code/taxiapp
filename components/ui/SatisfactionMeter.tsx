'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp, CheckCircle2 } from 'lucide-react'

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

    const duration = 3200 // 3.2 seconds for professional pacing
    const targetValue = 99.9
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Subtle easing for professional feel - starts fast, slows at end
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = easeOutCubic * targetValue
      
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

  // Calculate circle dimensions with precision
  const radius = 92
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (satisfaction / 100) * circumference

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center ${className}`}
      onClick={!isComplete ? startAnimation : undefined}
    >
      {/* Main Spinner Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] cursor-pointer group">
        {/* SVG Circle Container */}
        <svg 
          className="transform -rotate-90 w-full h-full" 
          viewBox="0 0 200 200"
          style={{ 
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.04))',
          }}
        >
          {/* Outer subtle track */}
          <circle
            cx="100"
            cy="100"
            r={radius + 2}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="2"
            opacity="0.5"
          />

          {/* Background track - refined */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="9"
            opacity="0.25"
          />

          {/* Main progress circle - fills gradually from the beginning */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="9.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4b5563" stopOpacity="1" />
              <stop offset="50%" stopColor="#4b5563" stopOpacity="1" />
              <stop offset="100%" stopColor="#4b5563" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content - Enhanced Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Main Percentage Display - Refined */}
          <div className="text-center mb-3">
            <div className="flex items-baseline justify-center gap-0.5">
              <span 
                className="text-6xl sm:text-7xl font-extralight tracking-tighter text-gray-900 tabular-nums"
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 200,
                  letterSpacing: '-0.04em',
                  lineHeight: '1',
                }}
              >
                {Math.min(satisfaction, 99.9).toFixed(1)}
              </span>
              <span 
                className="text-3xl sm:text-4xl font-extralight text-gray-500"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 200,
                  letterSpacing: '-0.02em',
                }}
              >
                %
              </span>
            </div>
          </div>

          {/* Label - Professional */}
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-gray-700" strokeWidth={2} />
            ) : (
              <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
            )}
            <span 
              className="text-xs sm:text-sm font-normal tracking-widest uppercase text-gray-600"
              style={{ 
                letterSpacing: '0.15em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 500,
              }}
            >
              Satisfaction Rate
            </span>
          </div>

          {/* Status Text - Refined */}
          <div className="mt-1">
            {!hasStarted ? (
              <span 
                className="text-xs font-normal text-gray-400"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '0.025em',
                }}
              >
                Click to measure
              </span>
            ) : isAnimating ? (
              <span 
                className="text-xs font-normal text-gray-600"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '0.025em',
                }}
              >
                Measuring...
              </span>
            ) : (
              <span 
                className="text-xs font-normal text-gray-900"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '0.025em',
                }}
              >
                Complete
              </span>
            )}
          </div>
        </div>

        {/* Click indicator - refined pulse when not started */}
        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400/50 animate-ping"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-gray-400/30"></div>
            </div>
          </div>
        )}

        {/* Subtle hover effect */}
        {!hasStarted && (
          <div className="absolute inset-0 rounded-full bg-gray-50/0 group-hover:bg-gray-50/30 transition-all duration-300 pointer-events-none"></div>
        )}
      </div>
    </div>
  )
}
