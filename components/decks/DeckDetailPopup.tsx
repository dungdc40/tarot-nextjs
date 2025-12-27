'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeckDetailPopupProps {
  isOpen: boolean
  onClose: () => void
  deckId: string
  deckName: string
  deckDescription: string
  cardCount: number
}

export function DeckDetailPopup({
  isOpen,
  onClose,
  deckId,
  deckName,
  deckDescription,
  cardCount,
}: DeckDetailPopupProps) {
  const router = useRouter()

  const handleViewCards = () => {
    router.push(`/decks/${deckId}`)
  }

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
                <div className="flex items-start justify-between">
                  {/* Deck Title */}
                  <div className="flex-1 space-y-1">
                    <h2 className="text-xl font-bold text-foreground">{deckName}</h2>
                    <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                      {cardCount} Cards
                    </span>
                  </div>

                  {/* Close Button - Top Right */}
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
                  {/* Deck Description with floating image */}
                  <div>
                    <h3 className="mb-4 text-sm lg:text-base font-bold text-foreground">About This Deck</h3>

                    {/* Floating Image */}
                    <div className="float-left mr-4 mb-4">
                      <div className="relative h-48 w-32 overflow-hidden rounded-lg border-2 border-primary/40 shadow-lg">
                        <Image
                          src="/images/cards/major_arcana/RW-00-FOOL.png"
                          alt="The Fool Card"
                          width={128}
                          height={192}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="text-sm lg:text-base leading-relaxed text-foreground/80 space-y-4">
                      <p>{deckDescription}</p>

                      {deckId === 'rider-waite' && (
                        <>
                          <p>
                            The deck contains 78 cards and is famous for being the first tarot deck to fully
                            illustrate all Minor Arcana cards, not just the Major Arcana. Each card features
                            rich, story-like imagery filled with symbolic details, making meanings easier to
                            understand and intuitively interpret.
                          </p>
                          <p>
                            The Rider-Waite deck is ideal for beginners learning tarot, as well as experienced
                            readers who value clarity, symbolism, and a strong traditional foundation. It is
                            widely considered the standard reference deck for modern tarot reading and education.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t border-primary/20 bg-background/80 p-4 backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleViewCards}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/90"
                  >
                    View Cards
                  </button>
                  <button
                    onClick={onClose}
                    className="neu-btn rounded-neu-lg px-6 py-3 text-base font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
