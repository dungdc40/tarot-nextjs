// Voice Reading Store - Manages voice-based tarot reading flow
// Uses Zustand for state management with OpenAI Realtime API

import { create } from 'zustand'
import type {
  VoiceReadingState,
  VoiceAgentName,
  VoiceConnectionStatus,
  TranscriptMessage,
  CardDrawRequest,
  DrawnCard,
  CardDisplayRequest,
  CardRevealState,
  VoiceIntentData,
} from '@/types'
import type { CardDraw, SpreadSelection } from '@/types'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'

interface VoiceReadingStore extends VoiceReadingState {
  // Connection actions
  setConnectionStatus: (status: VoiceConnectionStatus) => void
  setSessionId: (sessionId: string | null) => void
  setError: (error: string | null) => void

  // Agent actions
  setCurrentAgent: (agentName: VoiceAgentName) => void

  // Reading data actions
  setIntentData: (data: Partial<VoiceIntentData>) => void
  setSpread: (spread: SpreadSelection) => void
  addDrawnCard: (card: CardDraw) => void

  // Deck management actions
  initializeDeck: () => Promise<void>
  removeCardFromDeck: (cardId: string) => void

  // Audio state actions
  setListening: (isListening: boolean) => void
  setSpeaking: (isSpeaking: boolean) => void
  setMuted: (isMuted: boolean) => void

  // Transcript actions
  addTranscriptMessage: (message: TranscriptMessage) => void
  toggleTranscript: () => void
  clearTranscript: () => void

  // Card interaction actions (Promise-based for tool execution)
  requestCardDraw: (positionLabel: string, promptRole: string, cardNumber: number, totalCards: number) => Promise<DrawnCard>
  resolveCardDraw: (card: DrawnCard) => void
  rejectCardDraw: (error: Error) => void
  showCard: (cardId: string, reversed: boolean) => Promise<void>

  // Card reveal actions
  showCardReveal: (revealData: CardRevealState) => void
  hideCardReveal: () => void

  // Ritual phase actions
  startRitual: () => void
  completeRitual: () => void
  completeShuffling: () => void

  // Card drawing flow actions (batch mode)
  startCardDrawing: () => void
  advanceCardDrawing: () => void
  completeCardDrawing: () => void
  getCurrentCardPosition: () => {
    positionLabel: string
    promptRole: string
    cardNumber: number
    totalCards: number
  } | null

  // Session actions
  startSession: () => void
  updateSessionDuration: (duration: number) => void
  reset: () => void
}

const initialState: VoiceReadingState = {
  connectionStatus: 'disconnected',
  sessionId: null,
  error: null,
  currentAgentName: 'IntentAssessmentAgent',
  intentData: {},
  spread: null,
  drawnCards: [],
  shuffledDeck: [],
  audioState: {
    isListening: false,
    isSpeaking: false,
    isMuted: false,
  },
  transcriptMessages: [],
  showTranscript: false,
  cardDrawRequest: null,
  currentlyDisplayedCard: null,
  cardReveal: null,
  showRitual: false,
  showShuffling: false,
  currentCardDrawIndex: -1,  // -1 = not started
  sessionStartTime: null,
  sessionDuration: 0,
}

export const useVoiceReadingStore = create<VoiceReadingStore>((set, get) => ({
  ...initialState,

  // Connection actions
  setConnectionStatus: (connectionStatus) => {
    set({ connectionStatus })
  },

  setSessionId: (sessionId) => {
    set({ sessionId })
  },

  setError: (error) => {
    set({ error })
    if (error) {
      set({ connectionStatus: 'error' })
    }
  },

  // Agent actions
  setCurrentAgent: (currentAgentName) => {
    set({ currentAgentName })
  },

  // Reading data actions
  setIntentData: (data) => {
    set((state) => ({
      intentData: { ...state.intentData, ...data },
    }))
  },

  setSpread: (spread) => {
    set({ spread })
  },

  addDrawnCard: (card) => {
    set((state) => ({
      drawnCards: [...state.drawnCards, card],
    }))
  },

  // Deck management actions
  initializeDeck: async () => {
    try {
      // Load deck data first (required before shuffling)
      await riderWaiteDeckService.loadDeck()

      const seed = Date.now().toString()
      const shuffled = riderWaiteDeckService.shuffleDeck(seed)
      set({ shuffledDeck: shuffled })
    } catch (error) {
      set({ error: 'Failed to initialize deck. Please refresh the page.' })
    }
  },

  removeCardFromDeck: (cardId) => {
    const { shuffledDeck } = get()
    const updatedDeck = shuffledDeck.filter((id) => id !== cardId)
    set({ shuffledDeck: updatedDeck })
  },

  // Audio state actions
  setListening: (isListening) => {
    set((state) => ({
      audioState: { ...state.audioState, isListening },
    }))
  },

  setSpeaking: (isSpeaking) => {
    set((state) => ({
      audioState: { ...state.audioState, isSpeaking },
    }))
  },

  setMuted: (isMuted) => {
    set((state) => ({
      audioState: { ...state.audioState, isMuted },
    }))
  },

  // Transcript actions
  addTranscriptMessage: (message) => {
    set((state) => ({
      transcriptMessages: [...state.transcriptMessages, message],
    }))
  },

  toggleTranscript: () => {
    set((state) => ({
      showTranscript: !state.showTranscript,
    }))
  },

  clearTranscript: () => {
    set({ transcriptMessages: [] })
  },

  // Card interaction actions
  requestCardDraw: (positionLabel, promptRole, cardNumber, totalCards) => {
    return new Promise<DrawnCard>((resolve, reject) => {
      // Set a timeout to prevent indefinite waiting
      const timeoutId = setTimeout(() => {
        const { cardDrawRequest } = get()
        if (cardDrawRequest) {
          cardDrawRequest.reject(new Error('Card selection timed out. Please try again.'))
          set({ cardDrawRequest: null })
        }
      }, 120000) // 2 minute timeout

      set({
        cardDrawRequest: {
          positionLabel,
          promptRole,
          cardNumber,
          totalCards,
          resolve: (card: DrawnCard) => {
            clearTimeout(timeoutId)
            resolve(card)
          },
          reject: (error: Error) => {
            clearTimeout(timeoutId)
            reject(error)
          },
        },
      })
    })
  },

  resolveCardDraw: (card) => {
    const { cardDrawRequest } = get()
    if (cardDrawRequest) {
      // Remove the card from the deck
      get().removeCardFromDeck(card.cardId)

      // Resolve the promise
      cardDrawRequest.resolve(card)
      set({ cardDrawRequest: null })
    }
  },

  rejectCardDraw: (error) => {
    const { cardDrawRequest } = get()
    if (cardDrawRequest) {
      cardDrawRequest.reject(error)
      set({ cardDrawRequest: null })
    }
  },

  showCard: async (cardId, reversed) => {
    try {
      // Validate card ID format (basic check)
      if (!cardId || typeof cardId !== 'string') {
        throw new Error(`Invalid card ID: ${cardId}`)
      }

      // Set the card to display
      set({
        currentlyDisplayedCard: { cardId, reversed },
      })

      // Wait for display animation (e.g., 500ms)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      throw error
    }
  },

  // Session actions
  startSession: () => {
    set({
      sessionStartTime: new Date(),
      sessionDuration: 0,
      connectionStatus: 'connecting',
      error: null,
    })
  },

  updateSessionDuration: (sessionDuration) => {
    set({ sessionDuration })
  },

  // Card reveal actions
  showCardReveal: (revealData) => {
    set({ cardReveal: { ...revealData, isVisible: true } })
  },

  hideCardReveal: () => {
    set({ cardReveal: null })
  },

  // Ritual phase actions
  startRitual: () => {
    set({ showRitual: true, showShuffling: false })
  },

  completeRitual: () => {
    set({ showRitual: false, showShuffling: true })
  },

  completeShuffling: () => {
    set({ showShuffling: false })
  },

  // Card drawing flow actions
  startCardDrawing: () => {
    set({ currentCardDrawIndex: 0 })
  },

  advanceCardDrawing: () => {
    set((state) => ({
      currentCardDrawIndex: state.currentCardDrawIndex + 1
    }))
  },

  completeCardDrawing: () => {
    set({ currentCardDrawIndex: -1 })
  },

  getCurrentCardPosition: () => {
    const state = get()
    const { spread, currentCardDrawIndex } = state

    // Check if we're in a valid card drawing state
    if (!spread || currentCardDrawIndex < 0 || currentCardDrawIndex >= spread.positions.length) {
      return null
    }

    const position = spread.positions[currentCardDrawIndex]

    return {
      positionLabel: position.label,
      promptRole: position.promptRole,
      cardNumber: currentCardDrawIndex + 1,  // 1-based for display
      totalCards: spread.positions.length
    }
  },

  reset: () => {
    set(initialState)
  },
}))

// Selectors for derived state

/**
 * Get the current card draw request (if any)
 */
export const useCardDrawRequest = () => {
  return useVoiceReadingStore((state) => state.cardDrawRequest)
}

/**
 * Get the currently displayed card (if any)
 */
export const useCurrentlyDisplayedCard = () => {
  return useVoiceReadingStore((state) => state.currentlyDisplayedCard)
}

/**
 * Get connection status
 */
export const useVoiceConnectionStatus = () => {
  return useVoiceReadingStore((state) => state.connectionStatus)
}

/**
 * Get current agent name
 */
export const useCurrentAgent = () => {
  return useVoiceReadingStore((state) => state.currentAgentName)
}

/**
 * Get audio state
 */
export const useVoiceAudioState = () => {
  return useVoiceReadingStore((state) => state.audioState)
}

/**
 * Get transcript visibility
 */
export const useShowTranscript = () => {
  return useVoiceReadingStore((state) => state.showTranscript)
}

/**
 * Get all transcript messages
 */
export const useTranscriptMessages = () => {
  return useVoiceReadingStore((state) => state.transcriptMessages)
}

/**
 * Get session duration in minutes (formatted)
 */
export const useSessionDurationFormatted = () => {
  return useVoiceReadingStore((state) => {
    const minutes = Math.floor(state.sessionDuration / 60)
    const seconds = state.sessionDuration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })
}

/**
 * Check if session is approaching max duration
 */
export const useIsApproachingMaxDuration = (maxDuration: number) => {
  return useVoiceReadingStore((state) => {
    const warningThreshold = maxDuration * 0.8 // 80% of max
    return state.sessionDuration >= warningThreshold
  })
}

/**
 * Get current card reveal state (if any)
 */
export const useCardReveal = () => {
  return useVoiceReadingStore((state) => state.cardReveal)
}

/**
 * Get shuffled deck
 */
export const useShuffledDeck = () => {
  return useVoiceReadingStore((state) => state.shuffledDeck)
}

/**
 * Get ritual phase state
 */
export const useShowRitual = () => {
  return useVoiceReadingStore((state) => state.showRitual)
}

/**
 * Get shuffling phase state
 */
export const useShowShuffling = () => {
  return useVoiceReadingStore((state) => state.showShuffling)
}
