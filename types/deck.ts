// Deck and Card Types for Next.js Tarot App

// ===========================
// Tarot Card Data
// ===========================

export interface TarotCardData {
  name: string
  description: string
  keywords: TarotCardKeywords
  meanings: TarotCardMeanings
  categoryMeanings: TarotCardCategoryMeanings
  version: string
}

export interface TarotCardKeywords {
  upright: string[]
  reversed: string[]
}

export interface TarotCardMeanings {
  upright: string
  reversed: string
}

export interface TarotCardCategoryMeanings {
  love: TarotCardMeanings
  career: TarotCardMeanings
  finance: TarotCardMeanings
  health: TarotCardMeanings
  spiritual: TarotCardMeanings
}

// ===========================
// Deck Types
// ===========================

export interface Deck {
  id: string
  name: string
  description: string
  cardCount: number
}

// ===========================
// Card Category
// ===========================

export type CardCategory = 'all' | 'majorArcana' | 'wands' | 'cups' | 'swords' | 'pentacles'

export const CARD_CATEGORIES: Array<{ value: CardCategory; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'majorArcana', label: 'Major Arcana' },
  { value: 'wands', label: 'Wands' },
  { value: 'cups', label: 'Cups' },
  { value: 'swords', label: 'Swords' },
  { value: 'pentacles', label: 'Pentacles' },
]

// ===========================
// Helper Functions
// ===========================

export function filterCardsByCategory(cardIds: string[], category: CardCategory): string[] {
  if (category === 'all') return cardIds

  return cardIds.filter((cardId) => {
    switch (category) {
      case 'majorArcana':
        return !cardId.includes('WANDS') &&
               !cardId.includes('CUPS') &&
               !cardId.includes('SWORDS') &&
               !cardId.includes('PENTACLES')
      case 'wands':
        return cardId.includes('WANDS')
      case 'cups':
        return cardId.includes('CUPS')
      case 'swords':
        return cardId.includes('SWORDS')
      case 'pentacles':
        return cardId.includes('PENTACLES')
      default:
        return true
    }
  })
}
