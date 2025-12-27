'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { getCardImagePath, getCardBackImagePath } from '@/lib/utils/cardImageUtils'

interface VoiceCardRevealProps {
  cardId: string
  cardName: string
  reversed: boolean
  positionLabel: string
  positionIndex: number
  totalPositions: number
  onNext: () => void
  showNextButton?: boolean
  nextButtonText?: string
}

export function VoiceCardReveal({
  cardId,
  cardName,
  reversed,
  positionLabel,
  positionIndex,
  totalPositions,
  onNext,
  showNextButton = true,
  nextButtonText,
}: VoiceCardRevealProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Auto-flip after entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const isLastCard = positionIndex === totalPositions - 1

  return (
    <div className="fixed inset-0 flex min-h-screen flex-col items-center justify-center bg-background p-4 z-50">
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
            Revealing your card
          </p>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6 lg:gap-8"
      >
        {/* Progress indicator */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Card {positionIndex + 1} of {totalPositions}
          </p>
          <h2 className="mt-2 text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-200">
            {positionLabel}
          </h2>
        </div>

        {/* Card flip animation */}
        <div className="perspective-1000">
          <motion.div
            className="relative"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            {/* Card back */}
            <motion.div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
              }}
            >
              <div className="relative h-[340px] w-[204px] md:h-[454px] md:w-[272px] overflow-hidden rounded-lg border-2 border-purple-500/30 shadow-xl">
                <Image
                  src={getCardBackImagePath()}
                  alt="Card back"
                  width={272}
                  height={454}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Card front */}
            <motion.div
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="relative h-[340px] w-[204px] lg:h-[454px] lg:w-[272px] overflow-hidden rounded-lg border-2 border-purple-500/50 shadow-2xl">
                <Image
                  src={getCardImagePath(cardId)}
                  alt={cardName}
                  width={272}
                  height={454}
                  className={`h-full w-full object-cover ${
                    reversed ? 'rotate-180' : ''
                  }`}
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Card info */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-center"
          >
            <h3 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{cardName}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {reversed ? 'Reversed' : 'Upright'}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
              Listen for your voice assistant's interpretation
            </p>
          </motion.div>
        )}

        {/* Next button */}
        {isFlipped && showNextButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <button
              onClick={onNext}
              className="rounded-lg bg-purple-600 hover:bg-purple-700 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
            >
              {nextButtonText || (isLastCard ? 'Begin Reading' : 'Next Card')}
            </button>
          </motion.div>
        )}
      </motion.div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}