'use client'

import { useEffect, useRef, useState } from 'react'

interface ShufflingAnimationProps {
  onComplete: () => void
  duration?: number // Duration in milliseconds before completing
}

export function ShufflingAnimation({
  onComplete,
  duration = 3000,
}: ShufflingAnimationProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCompleteRef = useRef(onComplete)
  const hasCompletedRef = useRef(false)

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Handle video loaded event
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsVideoLoaded(true)
      // Try to play the video
      video.play().catch((err) => {
        console.error('Failed to autoplay video:', err)
      })
    }

    video.addEventListener('loadeddata', handleLoadedData)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [])

  // Duration timer - complete after specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        onCompleteRef.current()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Container for video and text */}
      <div className="flex flex-col items-center">
        {/* Video Container - Fullscreen on mobile, centered box on tablet+ */}
        <div className="relative h-screen w-full md:h-auto md:w-[300px] md:rounded-2xl md:overflow-hidden md:shadow-2xl">
          {/* Video Background */}
          <video
            ref={videoRef}
            className="h-full w-full object-cover md:object-contain"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/animations/shuffling.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Loading Overlay (shown while video loads) */}
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-lg text-foreground/80">Loading shuffle animation...</p>
              </div>
            </div>
          )}
        </div>

        {/* Text below video */}
        {isVideoLoaded && (
          <div className="mt-[15px] text-center">
            <p className="text-lg font-medium text-foreground">
              Shuffling the cards...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
