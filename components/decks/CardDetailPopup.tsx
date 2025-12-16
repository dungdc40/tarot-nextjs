'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import { getCardImagePath } from '@/lib/utils/cardImageUtils'
import type { TarotCardData } from '@/types'
import { useState } from 'react'

interface CardDetailPopupProps {
  card: TarotCardData | null
  cardId: string
  isOpen: boolean
  onClose: () => void
}

export function CardDetailPopup({ card, cardId, isOpen, onClose }: CardDetailPopupProps) {
  const [orientation, setOrientation] = useState<'upright' | 'reversed'>('upright')

  if (!card) return null

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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-background via-background/95 to-background/90 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-primary/20 bg-background/80 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  {/* Card Image Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="relative h-24 w-16 overflow-hidden rounded-lg border-2 border-primary/40 shadow-lg">
                      <Image
                        src={getCardImagePath(cardId)}
                        alt={card.name}
                        width={64}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Card Title */}
                  <div className="flex-1 space-y-1">
                    <h2 className="text-xl font-bold text-foreground">{card.name}</h2>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 pb-8" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                <div className="space-y-6">
                  {/* Orientation Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrientation('upright')}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm lg:text-base font-medium transition-colors ${
                        orientation === 'upright'
                          ? 'bg-primary text-white'
                          : 'bg-background/60 text-foreground/70 hover:bg-background/80'
                      }`}
                    >
                      Upright
                    </button>
                    <button
                      onClick={() => setOrientation('reversed')}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm lg:text-base font-medium transition-colors ${
                        orientation === 'reversed'
                          ? 'bg-primary text-white'
                          : 'bg-background/60 text-foreground/70 hover:bg-background/80'
                      }`}
                    >
                      Reversed
                    </button>
                  </div>

                  {/* Card Description */}
                  <div>
                    <h3 className="mb-2 text-sm lg:text-base font-bold text-foreground">Description</h3>
                    <p className="text-sm lg:text-base leading-relaxed text-foreground/80">{card.description}</p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h3 className="mb-2 text-sm lg:text-base font-bold text-foreground">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-primary/20 px-3 py-1 text-xs lg:text-sm font-medium text-primary"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* General Meaning */}
                  <div>
                    <h3 className="mb-2 text-sm lg:text-base font-bold text-foreground">Meaning</h3>
                    <p className="text-sm lg:text-base leading-relaxed text-foreground/80">{meanings}</p>
                  </div>

                  {/* Category Meanings */}
                  <div>
                    <h3 className="mb-4 text-sm lg:text-base font-bold text-foreground">
                      Specific Interpretations
                    </h3>
                    <div className="space-y-4">
                      {/* Love */}
                      <div>
                        <h4 className="mb-1 text-sm lg:text-base font-semibold text-foreground">💕 Love & Relationships</h4>
                        <p className="text-xs lg:text-sm text-foreground/70">
                          {orientation === 'upright'
                            ? card.categoryMeanings.love.upright
                            : card.categoryMeanings.love.reversed}
                        </p>
                      </div>

                      {/* Career */}
                      <div>
                        <h4 className="mb-1 text-sm lg:text-base font-semibold text-foreground">💼 Career & Work</h4>
                        <p className="text-xs lg:text-sm text-foreground/70">
                          {orientation === 'upright'
                            ? card.categoryMeanings.career.upright
                            : card.categoryMeanings.career.reversed}
                        </p>
                      </div>

                      {/* Finance */}
                      <div>
                        <h4 className="mb-1 text-sm lg:text-base font-semibold text-foreground">💰 Finance & Money</h4>
                        <p className="text-xs lg:text-sm text-foreground/70">
                          {orientation === 'upright'
                            ? card.categoryMeanings.finance.upright
                            : card.categoryMeanings.finance.reversed}
                        </p>
                      </div>

                      {/* Health */}
                      <div>
                        <h4 className="mb-1 text-sm lg:text-base font-semibold text-foreground">🏥 Health & Wellness</h4>
                        <p className="text-xs lg:text-sm text-foreground/70">
                          {orientation === 'upright'
                            ? card.categoryMeanings.health.upright
                            : card.categoryMeanings.health.reversed}
                        </p>
                      </div>

                      {/* Spiritual */}
                      <div>
                        <h4 className="mb-1 text-sm lg:text-base font-semibold text-foreground">✨ Spiritual</h4>
                        <p className="text-xs lg:text-sm text-foreground/70">
                          {orientation === 'upright'
                            ? card.categoryMeanings.spiritual.upright
                            : card.categoryMeanings.spiritual.reversed}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t border-primary/20 bg-background/80 p-4 backdrop-blur-sm">
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
