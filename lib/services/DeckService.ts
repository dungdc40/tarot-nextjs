import { TarotCardData, CardDraw } from '@/types'

/**
 * Abstract service interface for tarot deck operations and data access.
 *
 * This service combines both deck-specific data (card names, meanings, etc.)
 * and deck-agnostic operations (shuffling, reversal determination).
 *
 * Implementations should:
 * - Load deck data from their respective sources (JSON, API, etc.)
 * - Provide card metadata (names, meanings, keywords, etc.)
 * - Return all card IDs in the correct order for the deck
 * - Optionally override shuffling/reversal logic if needed
 */
export abstract class DeckService {
  // ==================== Abstract Methods (must implement) ====================

  /**
   * Loads the deck data from its source (JSON file, API, etc.).
   * Should be called once during app initialization.
   */
  abstract loadDeck(): Promise<void>

  /**
   * Returns the complete card data for a given card ID.
   * Returns null if the card is not found.
   */
  abstract getCardData(cardId: string): TarotCardData | null

  /**
   * Returns the display name for a card (e.g., "The Fool", "Ace of Wands").
   */
  abstract getCardName(cardId: string): string

  /**
   * Returns all card IDs in this deck, in the correct order.
   * For Rider-Waite: Major Arcana (0-21) → Wands → Cups → Swords → Pentacles
   */
  abstract getAllCardIds(): string[]

  /**
   * Returns the unique identifier for this deck (e.g., "rider-waite", "thoth").
   */
  abstract getDeckId(): string

  /**
   * Returns the human-readable name of this deck (e.g., "Rider-Waite Tarot").
   */
  abstract getDeckName(): string

  // ==================== Default Implementations (can override) ====================

  /**
   * Creates a deterministic shuffle of the deck using a seed.
   *
   * The same seed will always produce the same card order, which is essential
   * for reproducible tarot readings. Uses a seeded random number generator.
   *
   * Override this method if your deck requires a different shuffling algorithm.
   */
  shuffleDeck(seed: string): string[] {
    const random = this.createSeededRandom(seed)
    const deck = [...this.getAllCardIds()]

    // Fisher-Yates shuffle with seeded random
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }

    return deck
  }

  /**
   * Determines if a card should be reversed based on deterministic hashing.
   *
   * Uses a hash of the seed + cardId + drawIndex to determine reversal state.
   * This ensures:
   * - The same card in the same position always has the same orientation
   * - Roughly 50% of cards are reversed (hash % 2 == 0)
   * - Results are reproducible for a given reading session
   *
   * Override this method if your deck has different reversal rules
   * (e.g., some decks don't support reversals, or use different algorithms).
   */
  isCardReversed(seed: string, cardId: string, drawIndex: number): boolean {
    const hash = this.simpleHash(seed + cardId + drawIndex.toString())
    return hash % 2 === 0
  }

  /**
   * Creates a CardDraw instance from card selection parameters.
   *
   * This is a convenience method that combines:
   * - Card name lookup via getCardName()
   * - Reversal determination via isCardReversed()
   * - All provided parameters
   *
   * Used when a user selects a card during a reading.
   */
  createCardDraw({
    cardId,
    seed,
    drawIndex,
    label,
    promptRole,
    interpretation = '',
  }: {
    cardId: string
    seed: string
    drawIndex: number
    label: string
    promptRole: string
    interpretation?: string
  }): CardDraw {
    const reversed = this.isCardReversed(seed, cardId, drawIndex)
    const cardData = this.getCardData(cardId)
    const generalMeaning = cardData
      ? reversed
        ? cardData.meanings.reversed
        : cardData.meanings.upright
      : ''

    return {
      cardId,
      name: this.getCardName(cardId),
      reversed,
      drawIndex,
      label,
      promptRole,
      interpretation,
      generalMeaning,
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Creates a seeded random number generator.
   * Returns a function that generates random numbers between 0 and 1.
   */
  private createSeededRandom(seed: string): () => number {
    let hash = this.simpleHash(seed)

    return () => {
      // Mulberry32 algorithm
      hash = (hash + 0x6d2b79f5) | 0
      let t = Math.imul(hash ^ (hash >>> 15), 1 | hash)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  /**
   * Simple hash function for strings.
   * Returns a 32-bit integer hash.
   */
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}
