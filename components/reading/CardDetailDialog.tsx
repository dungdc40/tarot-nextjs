'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import { getCardImagePath } from '@/lib/utils/cardImageUtils'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import { SelectableText } from './SelectableText'
import type { CardDraw, TarotCardData } from '@/types'
import { useEffect, useState } from 'react'

interface CardDetailDialogProps {
  card: CardDraw
  isOpen: boolean
  onClose: () => void
  responseId?: string
  onWhyRequest?: (expandedText: string) => Promise<void>
}

export function CardDetailDialog({ card, isOpen, onClose, responseId, onWhyRequest }: CardDetailDialogProps) {
  const [cardData, setCardData] = useState<TarotCardData | null>(null)

  useEffect(() => {
    const loadCardData = async () => {
      await riderWaiteDeckService.loadDeck()
      const data = riderWaiteDeckService.getCardData(card.cardId)
      setCardData(data)
    }
    if (isOpen) {
      loadCardData()
    }
  }, [card.cardId, isOpen])

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
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-background via-background/95 to-background/90 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-primary/20 bg-background/80 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  {/* Card Image Thumbnail */}
                  <div className="flex-shrink-0">
                    <div
                      className={`relative h-24 w-16 overflow-hidden rounded-lg border-2 border-primary/40 shadow-lg ${
                        card.reversed ? 'rotate-180' : ''
                      }`}
                    >
                      <Image
                        src={getCardImagePath(card.cardId)}
                        alt={card.name}
                        width={64}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Card Title & Info */}
                  <div className="flex-1 space-y-1">
                    <h2 className="text-xl font-bold text-foreground">{card.name}</h2>
                    <p className="text-sm font-medium text-primary">{card.label}</p>
                    {card.reversed && (
                      <span className="inline-block rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">
                        Reversed
                      </span>
                    )}
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
                  {/* Position Insight */}
                  {card.promptRole && (
                    <div>
                      <h3 className="mb-2 text-sm lg:text-base font-bold text-foreground">
                        Position Insight
                      </h3>
                      <p className="text-sm lg:text-base leading-relaxed text-foreground/80">{card.promptRole}</p>
                    </div>
                  )}

                  {/* Card Description */}
                  {cardData?.description && (
                    <div>
                      <h3 className="mb-2 text-sm lg:text-base font-bold text-foreground">Card Description</h3>
                      <p className="text-sm lg:text-base leading-relaxed text-foreground/80">{cardData.description}</p>
                    </div>
                  )}

                  {/* Reading Interpretation */}
                  {card.interpretation && (
                    <div>
                      <h3 className="mb-2 text-sm lg:text-base font-bold text-foreground">Interpretation</h3>
                      <SelectableText
                        text={card.interpretation}
                        responseId={responseId}
                        className="text-sm lg:text-base text-foreground/80"
                        onWhyRequest={onWhyRequest}
                      />
                    </div>
                  )}

                  {/* Keywords */}
                  {cardData?.keywords && (
                    <div>
                      <h3 className="mb-2 text-sm lg:text-base font-bold text-foreground">
                        {card.reversed ? 'Keywords (Reversed)' : 'Keywords (Upright)'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(card.reversed
                          ? cardData.keywords.reversed
                          : cardData.keywords.upright
                        ).map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-primary/20 px-3 py-1 text-xs lg:text-sm font-medium text-primary"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
