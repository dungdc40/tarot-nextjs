'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { getCardImagePath, getCardBackImagePath } from '@/lib/utils/cardImageUtils'

interface CardRevealScreenProps {
  cardId: string
  cardName: string
  reversed: boolean
  positionLabel: string
  positionIndex: number
  totalPositions: number
  onNext: () => void
  showNextButton?: boolean
  customButtons?: React.ReactNode
  nextButtonText?: string
}

export function CardRevealScreen({
  cardId,
  cardName,
  reversed,
  positionLabel,
  positionIndex,
  totalPositions,
  onNext,
  showNextButton = true,
  customButtons,
  nextButtonText,
}: CardRevealScreenProps) {
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-8"
      >
        {/* Progress indicator */}
        <div className="text-center">
          <p className="text-sm text-foreground/60">
            Card {positionIndex + 1} of {totalPositions}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-primary">
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
              <div className="relative h-[454px] w-[272px] overflow-hidden rounded-lg border-2 border-primary/30 shadow-xl">
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
              <div className="relative h-[454px] w-[272px] overflow-hidden rounded-lg border-2 border-primary/50 shadow-2xl">
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
            <h3 className="text-2xl font-bold text-foreground">{cardName}</h3>
            <p className="mt-1 text-sm text-foreground/60">
              {reversed ? 'Reversed' : 'Upright'}
            </p>
          </motion.div>
        )}

        {/* Custom buttons or default Next button */}
        {isFlipped && (customButtons || showNextButton) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            {customButtons || (
              <button
                onClick={onNext}
                className="rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl active:scale-95"
              >
                {nextButtonText || (isLastCard ? 'Get Reading' : 'Next Card')}
              </button>
            )}
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
