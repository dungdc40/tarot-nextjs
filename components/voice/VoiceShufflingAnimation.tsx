'use client'

// Voice Shuffling Animation - Card shuffling screen for voice reading mode
// Adapted from text-based ShufflingAnimation with voice session awareness

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface VoiceShufflingAnimationProps {
  onComplete: () => void
  duration?: number // Duration in milliseconds before completing
  voiceInstruction?: string // Optional custom voice instruction
}

export function VoiceShufflingAnimation({
  onComplete,
  duration = 3000,
  voiceInstruction,
}: VoiceShufflingAnimationProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [currentInstruction, setCurrentInstruction] = useState('Preparing the deck...')
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
      setCurrentInstruction('Shuffling the cards...')
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

  // Dynamic instruction updates based on progress
  useEffect(() => {
    if (!isVideoLoaded) return

    const instructionTimers = [
      setTimeout(() => setCurrentInstruction('The cards are speaking...'), duration * 0.3),
      setTimeout(() => setCurrentInstruction('Finding your message...'), duration * 0.6),
      setTimeout(() => setCurrentInstruction('Almost ready...'), duration * 0.8),
    ]

    return () => {
      instructionTimers.forEach(timer => clearTimeout(timer))
    }
  }, [isVideoLoaded, duration])

  // Duration timer - complete after specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        setCurrentInstruction('Ready to select your cards!')
        // Brief delay before completing for final message
        setTimeout(() => {
          onCompleteRef.current()
        }, 500)
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div className="fixed inset-0 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4 z-50">
      {/* Voice session indicator */}
      <div className="absolute top-4 right-4">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Voice session active
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Shuffling cards
          </p>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 lg:gap-8"
      >
        {/* Video Container - Fixed height to ensure text is visible */}
        <div className="relative h-[300px] w-full max-w-[240px] overflow-hidden rounded-2xl lg:h-[400px] lg:max-w-[320px]">
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
            <source src="/animations/shuffling.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Loading Overlay (shown while video loads) */}
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-lg text-white font-medium">
                  Loading shuffle animation...
                </p>
              </div>
            </div>
          )}

          {/* Shimmer effect overlay */}
          {isVideoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-pulse" />
          )}
        </div>

        {/* Dynamic instruction text */}
        <motion.div
          key={currentInstruction}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center max-w-md"
        >
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Shuffling the Cards
          </h3>
          <p className="text-lg lg:text-xl text-purple-700 dark:text-purple-300 font-medium">
            {currentInstruction}
          </p>
          {voiceInstruction && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
              "{voiceInstruction}"
            </p>
          )}
        </motion.div>

        {/* Progress indicator */}
        {isVideoLoaded && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-8 bg-purple-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Voice guidance message */}
        <div className="mt-6 rounded-xl border border-purple-200 dark:border-purple-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 max-w-md">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">Voice Guidance:</strong>
            <br />
            Listen to your voice assistant as the cards are shuffled.
            <br />
            Your personalized cards are being prepared.
          </p>
        </div>
      </motion.div>
    </div>
  )
}