'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getCardImagePath } from '@/lib/utils/cardImageUtils'
import { CardDetailDialog } from './CardDetailDialog'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import type { CardDraw, TarotCardData } from '@/types'

interface CardMessageProps {
  card: CardDraw
  index: number
  responseId?: string
  onWhyRequest?: (expandedText: string) => Promise<void>
}

export function CardMessage({ card, index, responseId, onWhyRequest }: CardMessageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cardData, setCardData] = useState<TarotCardData | null>(null)

  useEffect(() => {
    const loadCardData = async () => {
      await riderWaiteDeckService.loadDeck()
      const data = riderWaiteDeckService.getCardData(card.cardId)
      console.log('card data')
      console.log(data)
      setCardData(data)
    }
    loadCardData()
  }, [card.cardId])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="mb-4 overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm"
      >
        <div className="flex gap-4 p-4">
          {/* Card Image Thumbnail */}
          <div className="flex-shrink-0">
            <div
              className={`relative h-32 w-20 overflow-hidden rounded border border-primary/30 shadow-lg ${
                card.reversed ? 'rotate-180' : ''
              }`}
            >
              <Image
                src={getCardImagePath(card.cardId)}
                alt={card.name}
                width={80}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Card Info */}
          <div className="flex-1 space-y-3">
            {/* Card Header */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground">{card.name}</h4>
                {card.reversed && (
                  <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">
                    Reversed
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-primary">{card.label}</p>
            </div>

            {/* Position Insight - Only thing shown */}
            {card.promptRole && (
              <div>
                <h5 className="mb-1 text-xs font-bold text-foreground/80">Position Insight</h5>
                <p className="text-sm leading-relaxed text-foreground/70">{card.promptRole}</p>
              </div>
            )}

            {/* See Full Details Button */}
            <button
              onClick={() => setIsDialogOpen(true)}
              className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              See full details →
            </button>
          </div>
        </div>
      </motion.div>

      {/* Card Detail Dialog */}
      <CardDetailDialog
        card={card}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        responseId={responseId}
        onWhyRequest={onWhyRequest}
      />
    </>
  )
}
