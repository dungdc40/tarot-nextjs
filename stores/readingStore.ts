// Reading Store - Manages the AI-powered tarot reading flow
// Uses Zustand for state management with 14-state FSM

import { create } from 'zustand'
import type {
  ChatSession,
  ChatMessage,
  ReadingFlowState,
  CardDraw,
  SpreadSelection,
  IntentAssessment,
} from '@/types'

interface ReadingStore {
  // State
  session: ChatSession | null
  flowState: ReadingFlowState
  spreadSelection: SpreadSelection | null
  selectedCards: Map<number, string> // positionIndex -> cardId
  shuffledDeck: string[] // Shuffled card IDs
  isLoading: boolean
  error: string | null

  // Actions
  startReading: () => void
  setFlowState: (state: ReadingFlowState) => void
  setSession: (session: ChatSession) => void
  addMessage: (message: ChatMessage) => void
  updateLastMessage: (data: ChatMessage['data']) => void
  setSpreadSelection: (spread: SpreadSelection) => void
  selectCard: (positionIndex: number, cardId: string) => void
  setShuffledDeck: (deck: string[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetReading: () => void
  closeReading: () => void
}

const initialState = {
  session: null,
  flowState: { type: 'idle' } as ReadingFlowState,
  spreadSelection: null,
  selectedCards: new Map(),
  shuffledDeck: [] as string[],
  isLoading: false,
  error: null,
}

export const useReadingStore = create<ReadingStore>((set, get) => ({
  ...initialState,

  startReading: () => {
    const newSession: ChatSession = {
      intention: '',
      deckSeed: Math.random().toString(36).substring(2, 15),
      messages: [],
      selectedCards: new Map(),
      createdAt: new Date(),
    }

    set({
      session: newSession,
      flowState: { type: 'intentCollecting' },
      selectedCards: new Map(),
      error: null,
    })
  },

  setFlowState: (flowState) => {
    set({ flowState })
  },

  setSession: (session) => {
    set({ session })
  },

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

  updateLastMessage: (data) => {
    const { session } = get()
    if (!session || session.messages.length === 0) return

    const messages = [...session.messages]
    const lastMessage = messages[messages.length - 1]
    messages[messages.length - 1] = {
      ...lastMessage,
      data,
    }

    set({
      session: {
        ...session,
        messages,
      },
    })
  },

  setSpreadSelection: (spreadSelection) => {
    set({ spreadSelection })
  },

  selectCard: (positionIndex, cardId) => {
    const { selectedCards, session } = get()
    const newSelectedCards = new Map(selectedCards)
    newSelectedCards.set(positionIndex, cardId)

    // Update both store and session
    set({
      selectedCards: newSelectedCards,
      session: session ? {
        ...session,
        selectedCards: newSelectedCards,
      } : session,
    })
  },

  setShuffledDeck: (shuffledDeck) => {
    set({ shuffledDeck })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  setError: (error) => {
    set({ error })
  },

  resetReading: () => {
    set(initialState)
  },

  closeReading: () => {
    set({
      flowState: { type: 'closed' },
    })
  },
}))

// Selectors for derived state
export const useCurrentMessage = () => {
  return useReadingStore((state) => {
    if (!state.session) return null
    return state.session.messages[state.session.messages.length - 1]
  })
}

export const useCardDraws = () => {
  return useReadingStore((state) => {
    if (!state.session) return []
    return state.session.messages
      .map((msg) => msg.data)
      .filter((data): data is CardDraw =>
        typeof data === 'object' && 'cardId' in data && 'name' in data
      )
  })
}

export const useReadingComplete = () => {
  return useReadingStore((state) => {
    return state.flowState.type === 'followUps' || state.flowState.type === 'closed'
  })
}
