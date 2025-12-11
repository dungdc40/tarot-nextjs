import Link from 'next/link'
import { Layers, ChevronRight, ArrowLeft } from 'lucide-react'

export default function DecksPage() {
  // For now, we only have the Rider-Waite deck
  // In the future, this could fetch from a database or API
  const decks = [
    {
      id: 'rider-waite',
      name: 'Rider-Waite Tarot',
      description:
        'The most popular tarot deck in the world. Created by Arthur Edward Waite and illustrated by Pamela Colman Smith in 1909.',
      cardCount: 78,
    },
  ]

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
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="neu-card-interactive group cursor-pointer"
                aria-label={`View ${deck.name} - ${deck.cardCount} cards`}
              >
                {/* Deck Icon - Neumorphic inset */}
                <div
                  className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-neu bg-surface-sunken shadow-neu-inset-sm"
                  aria-hidden="true"
                >
                  <Layers className="h-8 w-8 text-primary" />
                </div>

                {/* Deck Info */}
                <h3 className="mb-2 font-serif text-2xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                  {deck.name}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {deck.description}
                </p>

                {/* Card Count Badge - Neumorphic */}
                <div className="flex items-center justify-between">
                  <span className="neu-badge text-primary">
                    {deck.cardCount} Cards
                  </span>

                  {/* Hover Arrow */}
                  <ChevronRight
                    className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
