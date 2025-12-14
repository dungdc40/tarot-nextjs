import { DeckService } from './DeckService'
import { TarotCardData } from '@/types'

/**
 * Rider-Waite Tarot deck implementation.
 *
 * This service loads and provides access to the classic Rider-Waite deck
 * from the rider_waite.json file. It implements all required DeckService
 * methods and inherits standard shuffling/reversal logic.
 */
export class RiderWaiteDeckService extends DeckService {
  private static deckData: Record<string, any> | null = null
  private static loadPromise: Promise<void> | null = null
  private static orderedCardIds: string[] | null = null

  getDeckId(): string {
    return 'rider-waite'
  }

  getDeckName(): string {
    return 'Rider-Waite Tarot'
  }

  /**
   * Load and parse the rider_waite.json file
   */
  async loadDeck(): Promise<void> {
    // Return early if already loaded
    if (RiderWaiteDeckService.deckData !== null) {
      return
    }

    // If currently loading, wait for existing load to complete
    if (RiderWaiteDeckService.loadPromise !== null) {
      return RiderWaiteDeckService.loadPromise
    }

    // Start loading
    RiderWaiteDeckService.loadPromise = (async () => {
      try {
        const response = await fetch('/data/rider_waite.json')
        if (!response.ok) {
          throw new Error(`Failed to load deck data: ${response.statusText}`)
        }

        RiderWaiteDeckService.deckData = await response.json()

        // Pre-compute ordered card IDs
        RiderWaiteDeckService.orderedCardIds = this.computeOrderedCardIds()
      } finally {
        RiderWaiteDeckService.loadPromise = null
      }
    })()

    return RiderWaiteDeckService.loadPromise
  }

  /**
   * Get card data by card ID
   */
  getCardData(cardId: string): TarotCardData | null {
    if (RiderWaiteDeckService.deckData === null) {
      throw new Error('Deck data not loaded. Call loadDeck() first.')
    }

    const cardJson = RiderWaiteDeckService.deckData[cardId]
    if (!cardJson) return null

    // Transform snake_case JSON fields to camelCase TypeScript interface
    return {
      name: cardJson.name,
      description: cardJson.description,
      keywords: cardJson.keywords,
      meanings: cardJson.meanings,
      categoryMeanings: cardJson.category_meanings, // Transform snake_case to camelCase
      version: cardJson.version,
    } as TarotCardData
  }

  /**
   * Get card name from JSON
   */
  getCardName(cardId: string): string {
    const cardData = this.getCardData(cardId)
    return cardData?.name ?? cardId
  }

  /**
   * Get all card IDs in the correct order:
   * Major Arcana (RW-00 to RW-21) → Wands → Cups → Swords → Pentacles
   */
  getAllCardIds(): string[] {
    if (RiderWaiteDeckService.deckData === null) {
      throw new Error('Deck data not loaded. Call loadDeck() first.')
    }

    // Return pre-computed ordered list
    return RiderWaiteDeckService.orderedCardIds ?? []
  }

  /**
   * Compute ordered card IDs from JSON keys
   * Order: Major Arcana → Wands → Cups → Swords → Pentacles
   */
  private computeOrderedCardIds(): string[] {
    if (RiderWaiteDeckService.deckData === null) return []

    const allKeys = Object.keys(RiderWaiteDeckService.deckData)

    // Categorize cards
    const majorArcana: string[] = []
    const wands: string[] = []
    const cups: string[] = []
    const swords: string[] = []
    const pentacles: string[] = []

    for (const key of allKeys) {
      if (key.includes('WANDS')) {
        wands.push(key)
      } else if (key.includes('CUPS')) {
        cups.push(key)
      } else if (key.includes('SWORDS')) {
        swords.push(key)
      } else if (key.includes('PENTACLES')) {
        pentacles.push(key)
      } else {
        // Major Arcana (RW-00 to RW-21)
        majorArcana.push(key)
      }
    }

    // Sort each category
    majorArcana.sort(this.compareMajorArcana)
    wands.sort(this.compareMinorArcana)
    cups.sort(this.compareMinorArcana)
    swords.sort(this.compareMinorArcana)
    pentacles.sort(this.compareMinorArcana)

    // Combine in order
    return [...majorArcana, ...wands, ...cups, ...swords, ...pentacles]
  }

  /**
   * Compare function for Major Arcana cards (RW-00-FOOL to RW-21-WORLD)
   */
  private compareMajorArcana(a: string, b: string): number {
    // Extract number from card ID (e.g., "RW-00-FOOL" → 0)
    const numA = parseInt(a.split('-')[1], 10)
    const numB = parseInt(b.split('-')[1], 10)
    const orderA = isNaN(numA) ? 999 : numA
    const orderB = isNaN(numB) ? 999 : numB
    return orderA - orderB
  }

  /**
   * Compare function for Minor Arcana cards
   * Order: ACE → 02-10 → PAGE → KNIGHT → QUEEN → KING
   */
  private compareMinorArcana(a: string, b: string): number {
    const rankOrder: Record<string, number> = {
      ACE: 1,
      '02': 2,
      '03': 3,
      '04': 4,
      '05': 5,
      '06': 6,
      '07': 7,
      '08': 8,
      '09': 9,
      '10': 10,
      PAGE: 11,
      KNIGHT: 12,
      QUEEN: 13,
      KING: 14,
    }

    // Extract rank from card ID (e.g., "RW-ACE-WANDS" → "ACE")
    const rankA = a.split('-')[1]
    const rankB = b.split('-')[1]

    const orderA = rankOrder[rankA] ?? 999
    const orderB = rankOrder[rankB] ?? 999

    return orderA - orderB
  }

  /**
   * Check if deck data is loaded
   */
  get isLoaded(): boolean {
    return RiderWaiteDeckService.deckData !== null
  }
}

// Create singleton instance
export const riderWaiteDeckService = new RiderWaiteDeckService()
