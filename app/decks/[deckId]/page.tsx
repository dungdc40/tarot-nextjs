'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import { getCardImagePath } from '@/lib/utils/cardImageUtils'
import { filterCardsByCategory, CARD_CATEGORIES, type CardCategory } from '@/types/deck'

export default function DeckDetailPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.deckId as string

  const [isLoading, setIsLoading] = useState(true)
  const [allCardIds, setAllCardIds] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>('all')
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)

  // Load deck data
  useEffect(() => {
    async function loadDeck() {
      try {
        await riderWaiteDeckService.loadDeck()
        const cardIds = riderWaiteDeckService.getAllCardIds()
        setAllCardIds(cardIds)
      } catch (error) {
        console.error('Failed to load deck:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDeck()
  }, [])

  // Filter cards by category
  const filteredCardIds = filterCardsByCategory(allCardIds, selectedCategory)
  const selectedCardId = filteredCardIds[selectedCardIndex] || allCardIds[0]
  const selectedCard = !isLoading && selectedCardId ? riderWaiteDeckService.getCardData(selectedCardId) : null

  // Handle category change
  const handleCategoryChange = (category: CardCategory) => {
    setSelectedCategory(category)
    setSelectedCardIndex(0) // Reset to first card in new category
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔮</div>
          <p className="text-lg text-foreground/70">Loading deck...</p>
        </div>
      </div>
    )
  }

  if (deckId !== 'rider-waite') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Deck not found</h1>
          <Link href="/decks" className="text-primary hover:text-primary-light">
            ← Back to Decks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Neumorphic */}
      <header className="bg-surface-raised shadow-neu-raised">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/decks"
                className="rounded-neu bg-surface p-2.5 text-muted-foreground shadow-neu-raised-sm transition-all duration-200 hover:shadow-neu-inset-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="Back to decks"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Rider-Waite Tarot</h1>
                <p className="text-sm text-muted-foreground">{filteredCardIds.length} cards</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8">

      {/* Card Carousel */}
      <div className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">Browse Cards</h3>
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as CardCategory)}
            className="rounded-lg border border-primary/20 bg-background/60 px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {CARD_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-4">
            {filteredCardIds.map((cardId, index) => {
              const card = riderWaiteDeckService.getCardData(cardId)
              const isSelected = index === selectedCardIndex

              return (
                <button
                  key={cardId}
                  onClick={() => setSelectedCardIndex(index)}
                  className={`relative h-[120px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                    isSelected
                      ? 'scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <Image
                    src={getCardImagePath(cardId)}
                    alt={card?.name || cardId}
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content: Large Card Display */}
      {selectedCard && (
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-background/40 p-8 backdrop-blur-sm md:flex-row md:items-start md:gap-8">
          {/* Card Image */}
          <div className="mb-6 md:mb-0">
            <div className="relative h-[400px] w-[240px] overflow-hidden rounded-lg shadow-2xl">
              <Image
                src={getCardImagePath(selectedCardId)}
                alt={selectedCard.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Card Info */}
          <div className="flex-1">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{selectedCard.name}</h2>
            <p className="mb-6 text-foreground/80">{selectedCard.description}</p>

            {/* View Details Button */}
            <Link
              href={`/decks/${deckId}/cards/${selectedCardId}`}
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      )}

      {/* Card Position Indicator */}
      <div className="mb-8 text-center text-sm text-foreground/60">
        Card {selectedCardIndex + 1} of {filteredCardIds.length}
      </div>
      </div>
    </div>
  )
}
