'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { getCardBackImagePath } from '@/lib/utils/cardImageUtils'

interface CardPickerProps {
  shuffledDeck: string[]
  positionLabel: string
  positionIndex: number
  totalPositions: number
  onCardSelected: (cardId: string) => void
  // Optional props for voice mode
  showVoiceIndicator?: boolean   // Show "Voice session active" badge
  onCancel?: () => void          // Cancel/close callback
  promptRole?: string            // Additional context (e.g., "The card representing your past")
}

export function CardPicker({
  shuffledDeck,
  positionLabel,
  positionIndex,
  totalPositions,
  onCardSelected,
  showVoiceIndicator,
  onCancel,
  promptRole,
}: CardPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)
  const [sliderValue, setSliderValue] = useState(50)
  const [isMobile, setIsMobile] = useState(false)

  // Total cards in deck (not hardcoded)
  const totalCards = shuffledDeck.length

  // Card dimensions
  const cardWidth = isMobile ? 120 : 160

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll to center on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollPosition = (container.scrollWidth - container.clientWidth) / 2
      container.scrollLeft = scrollPosition
      setSliderValue(50) // Start at center
    }
  }, [cardWidth])

  // Update slider when user scrolls manually
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth
      const currentScroll = container.scrollLeft
      const percentage = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 50
      setSliderValue(percentage)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const distance = Math.abs(x - startX)

    // Only mark as dragged if moved more than 5px
    if (distance > 5) {
      setHasDragged(true)
    }

    const walk = (x - startX) * 2 // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Reset hasDragged after a short delay to allow click handler to check it
    setTimeout(() => setHasDragged(false), 100)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setTimeout(() => setHasDragged(false), 100)
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const distance = Math.abs(x - startX)

    // Only mark as dragged if moved more than 5px
    if (distance > 5) {
      setHasDragged(true)
    }

    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTimeout(() => setHasDragged(false), 100)
  }

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    // Prevent default browser scroll-into-view behavior
    e.preventDefault()

    // Don't select if user was dragging (moved more than 5px)
    if (hasDragged) return

    setSelectedIndex(index)
  }

  // Keyboard navigation for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedIndex(index)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      const prevButton = document.querySelector(`[data-card-index="${index - 1}"]`) as HTMLElement
      prevButton?.focus()
    } else if (e.key === 'ArrowRight' && index < totalCards - 1) {
      e.preventDefault()
      const nextButton = document.querySelector(`[data-card-index="${index + 1}"]`) as HTMLElement
      nextButton?.focus()
    }
  }, [totalCards])

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onCardSelected(shuffledDeck[selectedIndex])
    }
  }

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setSliderValue(value)

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const maxScroll = container.scrollWidth - container.clientWidth
      const scrollPosition = (value / 100) * maxScroll
      container.scrollLeft = scrollPosition
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center bg-background p-4 overflow-y-auto relative"
      role="region"
      aria-label="Card selection interface"
    >
      {/* Voice session indicator */}
      {showVoiceIndicator && (
        <div className="absolute top-4 right-4 z-10">
          <div className="neu-badge flex items-center space-x-2 px-3 py-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Voice active</span>
          </div>
        </div>
      )}

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 z-10 neu-btn rounded-full p-2 hover:scale-105 transition-transform"
          aria-label="Cancel card selection"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="w-full max-w-6xl py-4">
        {/* Header */}
        <div className="mb-4 lg:mb-8 text-center">
          <h2 className="mb-2 font-serif text-2xl font-bold text-foreground md:text-3xl">
            Choose Your Card
          </h2>
          {/* Prompt role (voice mode context) */}
          {promptRole && (
            <p className="mb-2 text-base text-muted-foreground/80 md:text-lg font-light italic">
              {promptRole}
            </p>
          )}
          <p className="mb-1 text-base text-muted-foreground md:text-lg">
            Position {positionIndex + 1} of {totalPositions}
          </p>
          <p className="text-sm font-medium text-primary md:text-base">
            {positionLabel}
          </p>
        </div>

        {/* Card Count - Neumorphic badge */}
        <div className="mb-4 text-center">
          <span className="neu-badge text-muted-foreground">
            {totalCards} card{totalCards !== 1 ? 's' : ''} remaining in deck
          </span>
        </div>

        {/* Horizontal Scrollable Card Carousel */}
        <div className="relative mb-2 lg:mb-8" role="listbox" aria-label="Tarot cards to choose from">
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="hide-scrollbar overflow-x-auto pb-12 lg:pb-16 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Cards Container with Overlap */}
            <div className="relative flex" style={{ paddingLeft: '50%', paddingRight: '50%' }}>
              {shuffledDeck.map((cardId, index) => {
                const isSelected = selectedIndex === index
                const overlap = 0.7 // 70% overlap

                return (
                  <button
                    key={`${cardId}-${index}`}
                    data-card-index={index}
                    onClick={(e) => handleCardClick(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onMouseDown={(e) => e.preventDefault()}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`Card ${index + 1}${isSelected ? ', selected' : ''}`}
                    className="relative flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 group"
                    style={{
                      width: `${cardWidth}px`,
                      marginLeft: index === 0 ? '0' : `${-cardWidth * overlap}px`,
                      zIndex: isSelected ? 100 : totalCards - index,
                    }}
                  >
                    {/* Card Container - Neumorphic */}
                    <div
                      className="relative transition-all duration-200 ease-neu"
                      data-selected={isSelected ? 'true' : 'false'}
                      style={{
                        transform: isSelected
                          ? 'scale(1.02) translateY(-4px)'
                          : 'scale(1) translateY(0)',
                        transformOrigin: 'center center',
                      }}
                    >
                      {/* Card Image */}
                      <div
                        className={`relative h-[210px] w-[120px] md:h-[280px] md:w-40 rounded-neu-lg transition-all duration-200 ease-neu ${
                          isSelected
                            ? ''
                            : 'opacity-90 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={getCardBackImagePath()}
                          alt=""
                          fill
                          className="object-cover rounded-neu-lg pointer-events-none"
                          sizes="(max-width: 768px) 120px, 160px"
                          draggable={false}
                          aria-hidden="true"
                        />

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-neu-lg">
                            <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary">
                              <Check className="h-6 w-6 md:h-8 md:w-8 text-white" aria-hidden="true" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Number Badge */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-sm font-bold transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-surface-raised text-foreground'
                        }`}
                        style={{
                          zIndex: 1000,
                          bottom: '-35px'
                        }}
                        aria-hidden="true"
                      >
                        {index + 1}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scroll Gradient Indicators */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
        </div>

        {/* Slider Control - Neumorphic inset */}
        <div className="mb-2 px-8">
          <label htmlFor="deck-slider" className="sr-only">
            Scroll through the deck
          </label>
          <div className="rounded-full bg-surface-sunken p-1 shadow-neu-inset-sm">
            <input
              id="deck-slider"
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderValue)}
              aria-label="Deck position slider"
              className="w-full h-3 rounded-full appearance-none cursor-pointer slider bg-transparent"
              style={{
                background: `linear-gradient(to right, rgb(74, 124, 111) 0%, rgb(74, 124, 111) ${sliderValue}%, transparent ${sliderValue}%, transparent 100%)`
              }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 lg:mb-8 text-center">
          <p className="text-sm text-muted-foreground">
            Scroll through the deck and click on a card to select it
          </p>
        </div>

        {/* Selection Confirmation - Neumorphic */}
        <div
          className={`mb-4 lg:mb-8 text-center transition-all duration-300 ${
            selectedIndex !== null ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-live="polite"
        >
          <p className="mb-4 text-muted-foreground text-sm lg:text-base">
            Card {selectedIndex !== null ? selectedIndex + 1 : ''} selected
            <span className="sr-only">
              {selectedIndex !== null ? `. ${totalCards - positionIndex - 1} cards will remain after this pick` : ''}
            </span>
          </p>
          <button
            onClick={handleConfirm}
            disabled={selectedIndex === null}
            aria-label={selectedIndex !== null ? `Confirm selection of card ${selectedIndex + 1}` : 'Select a card first'}
            className="neu-btn-primary rounded-neu-lg px-8 py-3 text-base lg:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </button>
        </div>

        {/* Progress Indicator - Neumorphic */}
        {totalPositions > 1 && (
          <div className="lg:mt-8" role="progressbar" aria-valuenow={positionIndex + 1} aria-valuemin={1} aria-valuemax={totalPositions} aria-label="Card selection progress">
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPositions }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 lg:h-2.5 lg:w-10 rounded-full transition-all duration-200 ${
                    i < positionIndex
                      ? 'bg-primary shadow-neu-raised-sm'
                      : i === positionIndex
                      ? 'bg-primary/70 shadow-neu-raised-sm scale-110'
                      : 'bg-surface-sunken shadow-neu-inset-sm'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="sr-only">
              Selecting card {positionIndex + 1} of {totalPositions}
            </p>
          </div>
        )}
      </div>

      {/* Hide scrollbar and style slider CSS */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Card hover effect - only apply if not selected */
        .group:hover > div:not([data-selected='true']) {
          transform: scale(1.03) translateY(-6px) !important;
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .group:hover > div:not([data-selected='true']) {
            transform: none !important;
          }
        }

        /* Slider styling - Neumorphic thumb */
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(145deg, #F5F0EB, #E0DBD5);
          cursor: pointer;
          box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.8);
          border: none;
          transition: transform 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider::-webkit-slider-thumb:focus {
          box-shadow: 0 0 0 3px rgba(74, 124, 111, 0.4), 3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.8);
        }

        .slider::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(145deg, #F5F0EB, #E0DBD5);
          cursor: pointer;
          border: none;
          box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.8);
          transition: transform 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .slider::-webkit-slider-track {
          height: 12px;
          border-radius: 12px;
        }

        .slider::-moz-range-track {
          height: 12px;
          border-radius: 12px;
          background: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .slider::-webkit-slider-thumb:hover,
          .slider::-moz-range-thumb:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}
