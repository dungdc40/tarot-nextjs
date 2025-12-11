'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { CardPicker } from '@/components/reading/CardPicker'
import { CardRevealScreen } from '@/components/reading/CardRevealScreen'
import { CardDetailModal } from '@/components/quick-draw/CardDetailModal'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import type { TarotCardData } from '@/types'

type QuickDrawState = 'picking' | 'revealing'

export default function QuickDrawPage() {
  const router = useRouter()
  const [state, setState] = useState<QuickDrawState>('picking')
  const [shuffledDeck, setShuffledDeck] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<{
    cardId: string
    cardName: string
    reversed: boolean
  } | null>(null)
  const [seed, setSeed] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardData, setCardData] = useState<TarotCardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load deck and shuffle on mount
  useEffect(() => {
    async function initializeDeck() {
      try {
        await riderWaiteDeckService.loadDeck()
        const newSeed = Date.now().toString()
        setSeed(newSeed)
        const shuffled = riderWaiteDeckService.shuffleDeck(newSeed)
        setShuffledDeck(shuffled)
      } catch (error) {
        console.error('Failed to load deck:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeDeck()
  }, [])

  const handleCardSelected = (cardId: string) => {
    const cardName = riderWaiteDeckService.getCardName(cardId)
    const reversed = riderWaiteDeckService.isCardReversed(seed, cardId, 0)
    const data = riderWaiteDeckService.getCardData(cardId)

    setSelectedCard({ cardId, cardName, reversed })
    setCardData(data)
    setState('revealing')
  }

  const handleNextCard = () => {
    if (selectedCard) {
      // Remove selected card from deck
      const updatedDeck = shuffledDeck.filter((id) => id !== selectedCard.cardId)
      setShuffledDeck(updatedDeck)

      // Reset state
      setSelectedCard(null)
      setCardData(null)
      setState('picking')
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleShowMeaning = () => {
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔮</div>
          <p className="text-lg text-muted-foreground">Shuffling the deck...</p>
        </div>
      </div>
    )
  }

  if (shuffledDeck.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">
            No cards remaining
          </h2>
          <p className="mb-6 text-muted-foreground">
            You've drawn all the cards from the deck!
          </p>
          <button
            onClick={handleBackToHome}
            className="neu-btn-primary rounded-neu-lg px-6 py-3 text-lg font-semibold"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Back Button - Only show in picking state */}
      {state === 'picking' && (
        <div className="absolute left-6 top-6 z-10">
          <button
            onClick={handleBackToHome}
            className="neu-btn inline-flex items-center gap-2 rounded-neu-lg px-4 py-2.5 text-sm font-semibold"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      {state === 'picking' && (
        <CardPicker
          shuffledDeck={shuffledDeck}
          positionLabel="Draw a Card"
          positionIndex={0}
          totalPositions={1}
          onCardSelected={handleCardSelected}
        />
      )}

      {state === 'revealing' && selectedCard && (
        <CardRevealScreen
          cardId={selectedCard.cardId}
          cardName={selectedCard.cardName}
          reversed={selectedCard.reversed}
          positionLabel="Your Card"
          positionIndex={0}
          totalPositions={1}
          onNext={handleNextCard}
          showNextButton={false}
          customButtons={
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleShowMeaning}
                className="neu-btn-primary inline-flex items-center gap-2 rounded-neu-lg px-6 py-3 text-base font-semibold"
              >
                <Sparkles className="h-5 w-5" />
                <span>View Meaning</span>
              </button>
              <button
                onClick={handleNextCard}
                className="neu-btn rounded-neu-lg px-6 py-3 text-base font-semibold"
              >
                Next Card
              </button>
            </div>
          }
        />
      )}

      {/* Card Detail Modal */}
      {cardData && selectedCard && (
        <CardDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          card={cardData}
          cardId={selectedCard.cardId}
          initialReversed={selectedCard.reversed}
        />
      )}
    </div>
  )
}
