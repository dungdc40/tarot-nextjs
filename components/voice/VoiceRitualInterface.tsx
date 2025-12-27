'use client'

// Voice Ritual Interface - Ritual preparation screen for voice reading mode
// Adapted from text-based RitualInterface with voice guidance and automatic progression

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface VoiceRitualInterfaceProps {
  onComplete: () => void
  voiceInstruction?: string  // Optional custom instruction from voice agent
}

export function VoiceRitualInterface({ onComplete, voiceInstruction }: VoiceRitualInterfaceProps) {
  const [progress, setProgress] = useState(0)
  const [currentSecond, setCurrentSecond] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const animationRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  const hasCompletedRef = useRef(false)

  const RITUAL_DURATION = 3000 // 3 seconds

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

  // Start ritual automatically after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startRitual()
    }, 1000) // 1 second delay before starting

    return () => clearTimeout(timer)
  }, [])

  const updateProgress = () => {
    if (startTimeRef.current === null) return

    const elapsed = Date.now() - startTimeRef.current
    const newProgress = Math.min((elapsed / RITUAL_DURATION) * 100, 100)
    const newSecond = Math.min(Math.floor(elapsed / 1000) + 1, 3)

    setProgress(newProgress)
    setCurrentSecond(newSecond)

    if (newProgress >= 100 && !hasCompletedRef.current) {
      hasCompletedRef.current = true
      setIsActive(false)

      // Trigger haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      // Complete ritual after final moment
      setTimeout(() => {
        onCompleteRef.current()
      }, 500)
    } else {
      animationRef.current = requestAnimationFrame(updateProgress)
    }
  }

  const startRitual = () => {
    setIsActive(true)
    startTimeRef.current = Date.now()
    setProgress(0)
    setCurrentSecond(0)
    updateProgress()
  }

  const getInstructionText = () => {
    if (!isActive) {
      return 'Preparing for your reading...'
    }

    switch (currentSecond) {
      case 1:
        return 'Focus on your intention...'
      case 2:
        return 'Take a deep breath in...'
      case 3:
        return 'Exhale any doubt...'
      default:
        return 'Center your energy...'
    }
  }

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
            Preparing for your reading
          </p>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full text-center"
      >
        {/* Title */}
        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Got your concern!
        </h2>

        {/* Instructions */}
        <div className="mb-8 lg:px-6 text-sm lg:text-md text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            Before jumping into card picking, please take a moment to center yourself.
          </p>
          <p>
            Focus on your intention and the question you seek guidance on.
          </p>
          {voiceInstruction && (
            <p className="italic text-purple-600 dark:text-purple-400">
              "{voiceInstruction}"
            </p>
          )}
        </div>

        {/* Card Image with Automatic Progress */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            {/* Card Image Container */}
            <div
              className={`relative h-[340px] w-[204px] lg:h-[454px] lg:w-[272px] overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
                isActive
                  ? 'scale-95 shadow-purple-500/50 ring-4 ring-purple-500/50'
                  : 'hover:scale-105 hover:shadow-purple-500/30'
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
              {isActive && (
                <div className="absolute inset-0 animate-pulse bg-purple-500/10" />
              )}

              {/* Progress Overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500/80 to-transparent transition-all duration-100"
                style={{ height: `${progress}%` }}
              />

              {/* Countdown Display */}
              {isActive && currentSecond > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    key={currentSecond}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-24 w-24 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm"
                  >
                    <span className="text-5xl font-bold text-white">
                      {currentSecond}
                    </span>
                  </motion.div>
                </div>
              )}

              {/* Instruction Text Overlay (when not active) */}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">🧘‍♀️</div>
                    <p className="px-6 text-lg font-medium text-white">
                      Prepare yourself
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic instruction text */}
        <motion.p
          key={currentSecond}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-lg lg:text-xl text-purple-700 dark:text-purple-300 font-medium min-h-[2rem]"
        >
          {getInstructionText()}
        </motion.p>

        {/* Progress Bar */}
        <div className="mx-auto mb-6 h-3 w-64 overflow-hidden rounded-full bg-purple-200 dark:bg-purple-800">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Breathing guide */}
        <div className="mt-6 rounded-xl border border-purple-200 dark:border-purple-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">Voice Guidance:</strong>
            <br />
            Follow the countdown and breathe deeply.
            <br />
            Your voice assistant will guide you through the process.
          </p>
        </div>
      </motion.div>
    </div>
  )
}