'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { DeckDetailPopup } from '@/components/decks/DeckDetailPopup'

export default function DecksPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<{
    id: string
    name: string
    description: string
    cardCount: number
  } | null>(null)
  // For now, we only have the Rider-Waite deck
  // In the future, this could fetch from a database or API
  const decks = [
    {
      id: 'rider-waite',
      name: 'Rider-Waite Tarot',
      description:
        'The Rider-Waite Tarot (also known as Rider-Waite-Smith) was first published in 1909. It was created by Arthur Edward Waite, who designed the symbolic system, and illustrated by Pamela Colman Smith, whose artwork brought the cards to life.',
      cardCount: 78,
    },
  ]

  const handleDeckClick = (deck: typeof decks[0]) => {
    setSelectedDeck(deck)
    setIsPopupOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Neumorphic */}
      <header className="bg-surface-raised shadow-neu-raised">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-neu bg-surface p-2.5 text-muted-foreground shadow-neu-raised-sm transition-all duration-200 hover:shadow-neu-inset-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Explore Tarot Decks</h1>
              <p className="text-sm text-muted-foreground">
                Browse and learn about the mystical symbolism of tarot cards
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8">

        {/* Decks Grid */}
        <section aria-labelledby="decks-heading" className="mt-8">
          <h2 id="decks-heading" className="sr-only">Available Tarot Decks</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => handleDeckClick(deck)}
                className="neu-card-interactive group cursor-pointer text-left"
                aria-label={`View ${deck.name} - ${deck.cardCount} cards`}
              >
                {/* Deck Title - Full Width */}
                <h3 className="mb-3 font-serif text-2xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                  {deck.name}
                </h3>

                {/* The Fool Card Image - Float Left from Description */}
                <div
                  className="float-left mr-4 mb-2 h-28 w-[70px] overflow-hidden rounded-lg shadow-neu-inset-sm"
                  aria-hidden="true"
                >
                  <Image
                    src="/images/cards/major_arcana/RW-00-FOOL.png"
                    alt="The Fool Card"
                    width={70}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Deck Description */}
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {deck.description}
                </p>

                {/* Card Count Badge - Neumorphic */}
                <div className="clear-left flex items-center justify-between">
                  <span className="neu-badge text-primary">
                    {deck.cardCount} Cards
                  </span>

                  {/* Hover Arrow */}
                  <ChevronRight
                    className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Deck Detail Popup */}
      {selectedDeck && (
        <DeckDetailPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          deckId={selectedDeck.id}
          deckName={selectedDeck.name}
          deckDescription={selectedDeck.description}
          cardCount={selectedDeck.cardCount}
        />
      )}
    </div>
  )
}
