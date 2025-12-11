'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getCardImagePath } from '@/lib/utils/cardImageUtils'
import type { TarotCardData } from '@/types'

interface CardDetailModalProps {
  isOpen: boolean
  onClose: () => void
  card: TarotCardData
  cardId: string
  initialReversed?: boolean
}

export function CardDetailModal({
  isOpen,
  onClose,
  card,
  cardId,
  initialReversed = false,
}: CardDetailModalProps) {
  const [orientation, setOrientation] = useState<'upright' | 'reversed'>(
    initialReversed ? 'reversed' : 'upright'
  )

  // Update orientation when initialReversed changes
  useEffect(() => {
    setOrientation(initialReversed ? 'reversed' : 'upright')
  }, [initialReversed])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const meanings = orientation === 'upright' ? card.meanings.upright : card.meanings.reversed
  const keywords = orientation === 'upright' ? card.keywords.upright : card.keywords.reversed

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-neu-xl bg-background p-6 md:p-8"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-sunken hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                {/* Left Column: Card Image - 30% on tablet+ */}
                <div className="w-full md:w-[30%]">
                  <div className="relative w-full overflow-hidden">
                    <Image
                      src={getCardImagePath(cardId)}
                      alt={card.name}
                      width={280}
                      height={480}
                      className={`h-auto w-full rounded-neu-lg ${
                        orientation === 'reversed' ? 'rotate-180' : ''
                      }`}
                      priority
                    />
                  </div>
                </div>

                {/* Right Column: Card Details - 70% on tablet+ */}
                <div className="flex-1 space-y-6">
                  {/* Card Name */}
                  <div>
                    <h2 id="modal-title" className="mb-2 font-serif text-3xl font-bold text-foreground">
                      {card.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {orientation === 'upright' ? 'Upright' : 'Reversed'}
                    </p>
                  </div>

                  {/* Orientation Toggle - Neumorphic */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrientation('upright')}
                      className={`neu-btn flex-1 rounded-neu-lg px-4 py-2.5 text-sm font-medium transition-all ${
                        orientation === 'upright'
                          ? 'bg-primary text-white shadow-neu-raised'
                          : 'text-foreground'
                      }`}
                      aria-pressed={orientation === 'upright'}
                    >
                      Upright
                    </button>
                    <button
                      onClick={() => setOrientation('reversed')}
                      className={`neu-btn flex-1 rounded-neu-lg px-4 py-2.5 text-sm font-medium transition-all ${
                        orientation === 'reversed'
                          ? 'bg-primary text-white shadow-neu-raised'
                          : 'text-foreground'
                      }`}
                      aria-pressed={orientation === 'reversed'}
                    >
                      Reversed
                    </button>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Description</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="neu-badge text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* General Meaning */}
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Meaning</h3>
                    <p className="text-sm text-muted-foreground">{meanings}</p>
                  </div>

                  {/* Category Meanings */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-foreground">
                      Specific Interpretations
                    </h3>
                    <div className="space-y-4">
                      {/* Love */}
                      <div className="neu-card rounded-neu p-3">
                        <h4 className="mb-1 text-sm font-semibold text-foreground">💕 Love & Relationships</h4>
                        <p className="text-xs text-muted-foreground">
                          {orientation === 'upright'
                            ? card.categoryMeanings.love.upright
                            : card.categoryMeanings.love.reversed}
                        </p>
                      </div>

                      {/* Career */}
                      <div className="neu-card rounded-neu p-3">
                        <h4 className="mb-1 text-sm font-semibold text-foreground">💼 Career & Work</h4>
                        <p className="text-xs text-muted-foreground">
                          {orientation === 'upright'
                            ? card.categoryMeanings.career.upright
                            : card.categoryMeanings.career.reversed}
                        </p>
                      </div>

                      {/* Finance */}
                      <div className="neu-card rounded-neu p-3">
                        <h4 className="mb-1 text-sm font-semibold text-foreground">💰 Finance & Money</h4>
                        <p className="text-xs text-muted-foreground">
                          {orientation === 'upright'
                            ? card.categoryMeanings.finance.upright
                            : card.categoryMeanings.finance.reversed}
                        </p>
                      </div>

                      {/* Health */}
                      <div className="neu-card rounded-neu p-3">
                        <h4 className="mb-1 text-sm font-semibold text-foreground">🏥 Health & Wellness</h4>
                        <p className="text-xs text-muted-foreground">
                          {orientation === 'upright'
                            ? card.categoryMeanings.health.upright
                            : card.categoryMeanings.health.reversed}
                        </p>
                      </div>

                      {/* Spiritual */}
                      <div className="neu-card rounded-neu p-3">
                        <h4 className="mb-1 text-sm font-semibold text-foreground">✨ Spiritual</h4>
                        <p className="text-xs text-muted-foreground">
                          {orientation === 'upright'
                            ? card.categoryMeanings.spiritual.upright
                            : card.categoryMeanings.spiritual.reversed}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
