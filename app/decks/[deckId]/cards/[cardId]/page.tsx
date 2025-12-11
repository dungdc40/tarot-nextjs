'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import { getCardImagePath } from '@/lib/utils/cardImageUtils'
import type { TarotCardData } from '@/types'

export default function CardDetailPage() {
  const params = useParams()
  const deckId = params.deckId as string
  const cardId = params.cardId as string

  const [isLoading, setIsLoading] = useState(true)
  const [card, setCard] = useState<TarotCardData | null>(null)
  const [orientation, setOrientation] = useState<'upright' | 'reversed'>('upright')

  // Load card data
  useEffect(() => {
    async function loadCard() {
      try {
        await riderWaiteDeckService.loadDeck()
        const cardData = riderWaiteDeckService.getCardData(cardId)
        setCard(cardData)
      } catch (error) {
        console.error('Failed to load card:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCard()
  }, [cardId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔮</div>
          <p className="text-lg text-foreground/70">Loading card...</p>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Card not found</h1>
          <Link
            href={`/decks/${deckId}`}
            className="text-primary hover:text-primary-light"
          >
            ← Back to Deck
          </Link>
        </div>
      </div>
    )
  }

  const meanings = orientation === 'upright' ? card.meanings.upright : card.meanings.reversed
  const keywords = orientation === 'upright' ? card.keywords.upright : card.keywords.reversed

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/decks/${deckId}`}
          className="inline-flex items-center text-primary hover:text-primary-light transition-colors"
        >
          ← Back to Deck
        </Link>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Left Column: Card Image - 30% on tablet+ */}
        <div className="w-full md:w-[30%]">
          <div className="relative w-full rounded-lg shadow-2xl">
            <Image
              src={getCardImagePath(cardId)}
              alt={card.name}
              width={280}
              height={480}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
        </div>

        {/* Right Column: Card Details - 70% on tablet+ */}
        <div className="flex-1 space-y-6">
          {/* Card Name */}
          <div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">{card.name}</h1>
          </div>

          {/* Orientation Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setOrientation('upright')}
              className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                orientation === 'upright'
                  ? 'bg-primary text-white'
                  : 'bg-background/60 text-foreground/70 hover:bg-background/80'
              }`}
            >
              Upright
            </button>
            <button
              onClick={() => setOrientation('reversed')}
              className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                orientation === 'reversed'
                  ? 'bg-primary text-white'
                  : 'bg-background/60 text-foreground/70 hover:bg-background/80'
              }`}
            >
              Reversed
            </button>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Description</h2>
            <p className="text-foreground/80">{card.description}</p>
          </div>

          {/* Keywords */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* General Meaning */}
          <div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Meaning</h2>
            <p className="text-foreground/80">{meanings}</p>
          </div>

          {/* Category Meanings */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Specific Interpretations
            </h2>
            <div className="space-y-4">
              {/* Love */}
              <div>
                <h3 className="mb-1 font-semibold text-foreground">💕 Love & Relationships</h3>
                <p className="text-sm text-foreground/70">
                  {orientation === 'upright'
                    ? card.categoryMeanings.love.upright
                    : card.categoryMeanings.love.reversed}
                </p>
              </div>

              {/* Career */}
              <div>
                <h3 className="mb-1 font-semibold text-foreground">💼 Career & Work</h3>
                <p className="text-sm text-foreground/70">
                  {orientation === 'upright'
                    ? card.categoryMeanings.career.upright
                    : card.categoryMeanings.career.reversed}
                </p>
              </div>

              {/* Finance */}
              <div>
                <h3 className="mb-1 font-semibold text-foreground">💰 Finance & Money</h3>
                <p className="text-sm text-foreground/70">
                  {orientation === 'upright'
                    ? card.categoryMeanings.finance.upright
                    : card.categoryMeanings.finance.reversed}
                </p>
              </div>

              {/* Health */}
              <div>
                <h3 className="mb-1 font-semibold text-foreground">🏥 Health & Wellness</h3>
                <p className="text-sm text-foreground/70">
                  {orientation === 'upright'
                    ? card.categoryMeanings.health.upright
                    : card.categoryMeanings.health.reversed}
                </p>
              </div>

              {/* Spiritual */}
              <div>
                <h3 className="mb-1 font-semibold text-foreground">✨ Spiritual</h3>
                <p className="text-sm text-foreground/70">
                  {orientation === 'upright'
                    ? card.categoryMeanings.spiritual.upright
                    : card.categoryMeanings.spiritual.reversed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
