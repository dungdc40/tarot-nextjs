import { create } from 'zustand'
import type {
  ReadingFlowState,
  ChatSession,
  ChatMessage,
  SpreadSelection,
  CardDraw,
} from '@/types'

/**
 * Reading Flow Store
 *
 * Manages the state machine for the tarot reading flow:
 * 1. Intent collection (chat with user)
 * 2. Ritual preparation (3-second hold)
 * 3. Shuffling animation
 * 4. Card picking (carousel selection)
 * 5. Card revealing (flip animation)
 * 6. Reading display (AI interpretation)
 * 7. Follow-ups (clarifications)
 */

interface ReadingStore {
  // State Machine
  state: ReadingFlowState

  // Session Data
  session: ChatSession | null
  spread: SpreadSelection | null
  shuffledDeck: string[]
  clarificationCards: CardDraw[] // Pending clarification cards to draw
  selectedClarificationCards: CardDraw[] // Completed clarification cards

  // UI State
  isLoading: boolean
  error: string | null

  // Actions
  setState: (state: ReadingFlowState) => void
  startReading: () => void
  addMessage: (message: ChatMessage) => void
  setIntention: (intention: string, topic?: string, hiddenConcern?: string) => void
  setSpread: (spread: SpreadSelection) => void
  setShuffledDeck: (deck: string[]) => void
  selectCard: (cardId: string, positionIndex: number) => void
  revealCard: (cardId: string, positionIndex: number) => void
  completeReading: () => void
  setClarificationCards: (cards: CardDraw[]) => void
  selectClarificationCard: (cardId: string, positionIndex: number) => void
  completeClarificationPicking: () => void
  reset: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useReadingStore = create<ReadingStore>((set, get) => ({
  // Initial state
  state: { type: 'idle' },
  session: null,
  spread: null,
  shuffledDeck: [],
  clarificationCards: [],
  selectedClarificationCards: [],
  isLoading: false,
  error: null,

  // State transitions
  setState: (state) => set({ state }),

  // Start a new reading session
  startReading: () => {
    const deckSeed = Date.now().toString()
    const session: ChatSession = {
      intention: '',
      deckSeed,
      messages: [],
      selectedCards: new Map<number, string>(), // Initialize the Map
      createdAt: new Date(),
    }

    set({
      state: { type: 'intentCollecting' },
      session,
      spread: null,
      shuffledDeck: [],
      error: null,
    })
  },

  // Add a chat message
  addMessage: (message) => {
    const { session } = get()
    if (!session) return

    set({
      session: {
        ...session,
        messages: [...session.messages, message],
      },
    })
  },

  // Set the user's intention
  setIntention: (intention, topic, hiddenConcern) => {
    const { session } = get()
    if (!session) return

    set({
      session: {
        ...session,
        intention,
        topic,
        hiddenConcern,
      },
    })
  },

  // Set the spread configuration
  setSpread: (spread) => {
    set({ spread })
  },

  // Set the shuffled deck
  setShuffledDeck: (deck) => {
    set({ shuffledDeck: deck })
  },

  // Select a card for a position
  selectCard: (cardId, positionIndex) => {
    const { session } = get()
    if (!session) return

    // Create a new Map with the selected card added
    const updatedSelectedCards = new Map(session.selectedCards)
    updatedSelectedCards.set(positionIndex, cardId)

    set({
      session: {
        ...session,
        selectedCards: updatedSelectedCards,
      },
    })
  },

  // Reveal a card (transition from picking to revealing)
  revealCard: (cardId, positionIndex) => {
    set({
      state: {
        type: 'cardRevealing',
        cardId,
        currentPositionIndex: positionIndex,
      },
    })
  },

  // Complete the reading
  completeReading: () => {
    set({
      state: { type: 'reading' },
    })
  },

  // Set clarification cards that need to be drawn
  setClarificationCards: (cards) => {
    set({
      clarificationCards: cards,
      selectedClarificationCards: [],
    })
  },

  // Select a clarification card
  selectClarificationCard: (cardId, positionIndex) => {
    const { clarificationCards, selectedClarificationCards } = get()
    if (!clarificationCards[positionIndex]) return

    // Create CardDraw with the selected cardId
    const selectedCard: CardDraw = {
      ...clarificationCards[positionIndex],
      cardId,
    }

    const updatedSelectedCards = [...selectedClarificationCards, selectedCard]

    set({
      selectedClarificationCards: updatedSelectedCards,
    })
  },

  // Complete clarification card picking
  completeClarificationPicking: () => {
    set({
      state: { type: 'clarificationProcessing' },
    })
  },

  // Reset the entire reading
  reset: () => {
    set({
      state: { type: 'idle' },
      session: null,
      spread: null,
      shuffledDeck: [],
      clarificationCards: [],
      selectedClarificationCards: [],
      isLoading: false,
      error: null,
    })
  },

  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  // Set error state
  setError: (error) => {
    set({ error })
  },
}))
