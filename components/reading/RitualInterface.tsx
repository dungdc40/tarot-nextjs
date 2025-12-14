'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface RitualInterfaceProps {
  onComplete: () => void
}

export function RitualInterface({ onComplete }: RitualInterfaceProps) {
  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const animationRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  const hasCompletedRef = useRef(false)

  const HOLD_DURATION = 3000 // 3 seconds

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const updateProgress = () => {
    if (startTimeRef.current === null) return

    const elapsed = Date.now() - startTimeRef.current
    const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100)

    setProgress(newProgress)

    if (newProgress >= 100 && !hasCompletedRef.current) {
      hasCompletedRef.current = true
      setIsHolding(false)

      // Trigger haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      onCompleteRef.current()
    } else {
      animationRef.current = requestAnimationFrame(updateProgress)
    }
  }

  const handleStart = () => {
    setIsHolding(true)
    startTimeRef.current = Date.now()
    setProgress(0)
    updateProgress()
  }

  const handleEnd = () => {
    if (progress < 100) {
      setIsHolding(false)
      setProgress(0)
      startTimeRef.current = null
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }

  const currentSecond = Math.floor(progress / 33.33) + 1

  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-background to-background/80 p-4 lg:p-8">
      <div className="max-w-lg text-center">
        {/* Title */}
        <h2 className="mb-3 text-3xl font-bold text-foreground">
          Got your concern!
        </h2>

        {/* Instructions */}
        <p className="mb-6 lg:px-6 text-sm lg:text-md text-foreground/70">
          Before jumping into card picking. Please take a moment to center yourself. Focus on your intention and the
          question you seek guidance on.
        </p>

        {/* Card Image with Hold Interaction */}
        <div className="relative mb-8 flex justify-center">
          <button
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            className="group relative focus:outline-none"
          >
            {/* Card Image Container */}
            <div
              className={`relative h-[300px] w-[180px] lg:h-[400px] lg:w-[240px] overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
                isHolding
                  ? 'scale-95 shadow-primary/50 ring-4 ring-primary/50'
                  : 'hover:scale-105 hover:shadow-primary/30'
              }`}
            >
              {/* Card Back Image */}
              <Image
                src="/images/cards/background.png"
                alt="Tarot Card Back"
                fill
                className="object-contain"
                priority
              />

              {/* Pulse Animation Overlay */}
              {isHolding && (
                <div className="absolute inset-0 animate-pulse bg-primary/10" />
              )}

              {/* Progress Overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent transition-all duration-100"
                style={{ height: `${progress}%` }}
              />

              {/* Countdown Display */}
              {isHolding && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="text-5xl font-bold text-white">
                      {currentSecond}
                    </span>
                  </div>
                </div>
              )}

              {/* Instruction Text Overlay (when not holding) */}
              {!isHolding && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">✋</div>
                    <p className="px-6 text-lg font-medium text-white">
                      Press & Hold
                    </p>
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Progress text */}
        <p className="mb-4 text-sm lg:text-base text-foreground/60">
          {isHolding
            ? `Hold steady... ${currentSecond}/3`
            : 'Hold the card for 3 seconds to begin'}
        </p>

        {/* Progress Bar */}
        <div className="mx-auto mb-6 h-2 w-64 overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Breathing guide */}
        <div className="mt-6 rounded-xl border border-primary/20 bg-background/60 p-6 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-foreground/70">
            <strong className="text-foreground">Tip:</strong> Take three deep breaths while holding.
            <br />
            Inhale clarity, exhale doubt.
          </p>
        </div>
      </div>
    </div>
  )
}
