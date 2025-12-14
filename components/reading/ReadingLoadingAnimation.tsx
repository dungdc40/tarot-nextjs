'use client'

import { useEffect, useRef, useState } from 'react'

interface ReadingLoadingAnimationProps {
  onComplete?: () => void
  duration?: number
}

export function ReadingLoadingAnimation({
  onComplete,
  duration,
}: ReadingLoadingAnimationProps) {
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

  // Duration timer - complete after specified duration (optional)
  useEffect(() => {
    if (!duration || !onComplete) return

    const timer = setTimeout(() => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        onCompleteRef.current?.()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <div className="flex pt-8 lg:pt-12 min-h-screen justify-center overflow-hidden bg-background p-4">
      {/* Container for video and text */}
      <div className="flex flex-col items-center gap-6">
        {/* Video Container - Fixed height on mobile to ensure text is visible */}
        <div className="relative h-[500px] w-full max-w-[300px] overflow-hidden rounded-2xl md:h-[600px] md:max-w-[380px]">
          {/* Video Background */}
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/animations/reading_loading.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Loading Overlay (shown while video loads) */}
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-lg text-foreground/80">Loading reading...</p>
              </div>
            </div>
          )}
        </div>

        {/* Text below video */}
        {isVideoLoaded && (
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              Interpreting your cards...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
