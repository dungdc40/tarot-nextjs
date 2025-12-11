// Deck Store - Manages deck browsing and card exploration
// Uses Zustand for state management

import { create } from 'zustand'
import type { Deck, TarotCardData, CardCategory } from '@/types'
import { filterCardsByCategory } from '@/types'

interface DeckStore {
  // State
  selectedDeck: Deck | null
  deckData: Record<string, TarotCardData> | null // cardId -> TarotCardData
  selectedCardIndex: number | null
  selectedCategory: CardCategory
  filteredCardIds: string[]
  isLoading: boolean

  // Actions
  setDeck: (deck: Deck, deckData: Record<string, TarotCardData>) => void
  setSelectedCardIndex: (index: number | null) => void
  setCategory: (category: CardCategory) => void
  nextCard: () => void
  previousCard: () => void
  clearSelection: () => void
}

const ALL_CARD_IDS = [
  // Major Arcana (0-21)
  'RW-00-FOOL',
  'RW-01-MAGICIAN',
  'RW-02-HIGH_PRIESTESS',
  'RW-03-EMPRESS',
  'RW-04-EMPEROR',
  'RW-05-HIEROPHANT',
  'RW-06-LOVERS',
  'RW-07-CHARIOT',
  'RW-08-STRENGTH',
  'RW-09-HERMIT',
  'RW-10-WHEEL_OF_FORTUNE',
  'RW-11-JUSTICE',
  'RW-12-HANGED_MAN',
  'RW-13-DEATH',
  'RW-14-TEMPERANCE',
  'RW-15-DEVIL',
  'RW-16-TOWER',
  'RW-17-STAR',
  'RW-18-MOON',
  'RW-19-SUN',
  'RW-20-JUDGEMENT',
  'RW-21-WORLD',
  // Wands (22-35)
  'RW-22-ACE_OF_WANDS',
  'RW-23-TWO_OF_WANDS',
  'RW-24-THREE_OF_WANDS',
  'RW-25-FOUR_OF_WANDS',
  'RW-26-FIVE_OF_WANDS',
  'RW-27-SIX_OF_WANDS',
  'RW-28-SEVEN_OF_WANDS',
  'RW-29-EIGHT_OF_WANDS',
  'RW-30-NINE_OF_WANDS',
  'RW-31-TEN_OF_WANDS',
  'RW-32-PAGE_OF_WANDS',
  'RW-33-KNIGHT_OF_WANDS',
  'RW-34-QUEEN_OF_WANDS',
  'RW-35-KING_OF_WANDS',
  // Cups (36-49)
  'RW-36-ACE_OF_CUPS',
  'RW-37-TWO_OF_CUPS',
  'RW-38-THREE_OF_CUPS',
  'RW-39-FOUR_OF_CUPS',
  'RW-40-FIVE_OF_CUPS',
  'RW-41-SIX_OF_CUPS',
  'RW-42-SEVEN_OF_CUPS',
  'RW-43-EIGHT_OF_CUPS',
  'RW-44-NINE_OF_CUPS',
  'RW-45-TEN_OF_CUPS',
  'RW-46-PAGE_OF_CUPS',
  'RW-47-KNIGHT_OF_CUPS',
  'RW-48-QUEEN_OF_CUPS',
  'RW-49-KING_OF_CUPS',
  // Swords (50-63)
  'RW-50-ACE_OF_SWORDS',
  'RW-51-TWO_OF_SWORDS',
  'RW-52-THREE_OF_SWORDS',
  'RW-53-FOUR_OF_SWORDS',
  'RW-54-FIVE_OF_SWORDS',
  'RW-55-SIX_OF_SWORDS',
  'RW-56-SEVEN_OF_SWORDS',
  'RW-57-EIGHT_OF_SWORDS',
  'RW-58-NINE_OF_SWORDS',
  'RW-59-TEN_OF_SWORDS',
  'RW-60-PAGE_OF_SWORDS',
  'RW-61-KNIGHT_OF_SWORDS',
  'RW-62-QUEEN_OF_SWORDS',
  'RW-63-KING_OF_SWORDS',
  // Pentacles (64-77)
  'RW-64-ACE_OF_PENTACLES',
  'RW-65-TWO_OF_PENTACLES',
  'RW-66-THREE_OF_PENTACLES',
  'RW-67-FOUR_OF_PENTACLES',
  'RW-68-FIVE_OF_PENTACLES',
  'RW-69-SIX_OF_PENTACLES',
  'RW-70-SEVEN_OF_PENTACLES',
  'RW-71-EIGHT_OF_PENTACLES',
  'RW-72-NINE_OF_PENTACLES',
  'RW-73-TEN_OF_PENTACLES',
  'RW-74-PAGE_OF_PENTACLES',
  'RW-75-KNIGHT_OF_PENTACLES',
  'RW-76-QUEEN_OF_PENTACLES',
  'RW-77-KING_OF_PENTACLES',
]

export const useDeckStore = create<DeckStore>((set, get) => ({
  // Initial state
  selectedDeck: null,
  deckData: null,
  selectedCardIndex: null,
  selectedCategory: 'all',
  filteredCardIds: ALL_CARD_IDS,
  isLoading: false,

  setDeck: (deck, deckData) => {
    set({
      selectedDeck: deck,
      deckData,
      filteredCardIds: ALL_CARD_IDS,
      selectedCategory: 'all',
      selectedCardIndex: null,
    })
  },

  setSelectedCardIndex: (index) => {
    set({ selectedCardIndex: index })
  },

  setCategory: (category) => {
    const filtered = filterCardsByCategory(ALL_CARD_IDS, category)
    set({
      selectedCategory: category,
      filteredCardIds: filtered,
      selectedCardIndex: filtered.length > 0 ? 0 : null,
    })
  },

  nextCard: () => {
    const { selectedCardIndex, filteredCardIds } = get()
    if (selectedCardIndex === null || filteredCardIds.length === 0) return

    const nextIndex = (selectedCardIndex + 1) % filteredCardIds.length
    set({ selectedCardIndex: nextIndex })
  },

  previousCard: () => {
    const { selectedCardIndex, filteredCardIds } = get()
    if (selectedCardIndex === null || filteredCardIds.length === 0) return

    const prevIndex =
      selectedCardIndex === 0 ? filteredCardIds.length - 1 : selectedCardIndex - 1
    set({ selectedCardIndex: prevIndex })
  },

  clearSelection: () => {
    set({ selectedCardIndex: null })
  },
}))

// Selectors for derived state
export const useSelectedCard = () => {
  return useDeckStore((state) => {
    if (
      state.selectedCardIndex === null ||
      !state.deckData ||
      state.filteredCardIds.length === 0
    ) {
      return null
    }

    const cardId = state.filteredCardIds[state.selectedCardIndex]
    return {
      cardId,
      data: state.deckData[cardId],
    }
  })
}

export const useCardById = (cardId: string) => {
  return useDeckStore((state) => {
    if (!state.deckData) return null
    return state.deckData[cardId]
  })
}

export const useFilteredCards = () => {
  return useDeckStore((state) => {
    if (!state.deckData) return []
    return state.filteredCardIds.map((cardId) => ({
      cardId,
      data: state.deckData![cardId],
    }))
  })
}
