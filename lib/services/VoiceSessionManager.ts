// Voice Session Manager - Manages OpenAI Realtime API voice sessions
// Handles agent lifecycle, handoffs, and event coordination

import { RealtimeSession } from '@openai/agents-realtime'
import { intentAgent } from '@/lib/agents/intentAgent'
import { spreadAgent } from '@/lib/agents/spreadAgent'
import { readingAgent } from '@/lib/agents/readingAgent'
import { followupAgent } from '@/lib/agents/followupAgent'
import { useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'
import type { VoiceAgentName } from '@/types'

/**
 * Voice Session Manager
 *
 * Manages the lifecycle of a voice reading session using OpenAI's Realtime API.
 * Coordinates between 4 specialized agents and handles state synchronization.
 */
export class VoiceSessionManager {
  private session: RealtimeSession | null = null
  private currentAgentName: VoiceAgentName = 'IntentAssessmentAgent'

  /**
   * Connect to voice session with ephemeral token
   */
  async connect(ephemeralToken: string): Promise<void> {
    try {
      // Set up agent handoffs
      // Each agent can hand off to the next in the flow
      // NOTE: intentAgent does NOT handoff to spreadAgent automatically
      // Instead, we handle the transition manually after ritual completion
      // NOTE: spreadAgent does NOT handoff to readingAgent automatically
      // Instead, UI handles the transition after all cards are drawn (batch mode)
      spreadAgent.handoffs = []  // No automatic handoffs - manual transition via updateAgent
      readingAgent.handoffs = [followupAgent]
      // followupAgent has no handoffs (stays active)

      // Create session starting with intent agent
      this.session = new RealtimeSession(intentAgent)

      // Update store
      const store = useVoiceReadingStore.getState()
      store.setConnectionStatus('connecting')
      store.startSession()

      // Connect with ephemeral token
      // Add timeout to connection attempt
      const connectPromise = this.session.connect({
        apiKey: ephemeralToken,
      })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      })

      await Promise.race([connectPromise, timeoutPromise])

      // Set up event listeners after connecting
      this.setupEventListeners()

      store.setConnectionStatus('connected')
      store.setCurrentAgent('IntentAssessmentAgent')

      // Send initial greeting message to start the conversation
      console.log('[VoiceSessionManager] Sending initial greeting message')
      this.session.sendMessage('Hi there')

    } catch (error) {

      const store = useVoiceReadingStore.getState()

      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to connect to voice session'

      if (error instanceof Error) {
        if (error.message.includes('WebSocket') || error.message.includes('wss://')) {
          errorMessage = 'OpenAI Realtime API WebSocket connection failed. This may be due to:\n' +
                        '1. API key does not have Realtime API access\n' +
                        '2. OpenAI Realtime API service issues (check status.openai.com)\n' +
                        '3. Network connectivity issues\n' +
                        'Please try again later or contact support.'
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Invalid API key or insufficient permissions for Realtime API'
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Access to Realtime API is forbidden. Check your API key permissions.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Connection to OpenAI Realtime API timed out. Please check your network connection.'
        } else {
          errorMessage = error.message
        }
      }

      store.setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Disconnect from voice session
   */
  async disconnect(): Promise<void> {
    if (!this.session) {
      return
    }

    try {
      this.session.close()
      this.session = null

      const store = useVoiceReadingStore.getState()
      store.setConnectionStatus('disconnected')
    } catch (error) {
      throw error
    }
  }

  /**
   * Handle transition from IntentAgent to SpreadAgent
   * This is called when the IntentAgent completes its work
   * and we need to wait for the ritual before proceeding
   */
  private async handleIntentToSpreadTransition(): Promise<void> {
    if (!this.session) {
      console.error('[VoiceSessionManager] Cannot transition: no active session')
      return
    }

    try {
      console.log('[VoiceSessionManager] IntentAgent completed. Starting transition to SpreadAgent...')

      // Step 1: Mute the session while we wait for ritual
      console.log('[VoiceSessionManager] Muting session for ritual phase')
      this.session.mute(true)

      const store = useVoiceReadingStore.getState()

      // Step 2: Wait for ritual phase to complete
      console.log('[VoiceSessionManager] Waiting for ritual phase to complete...')
      await this.waitForRitualCompletion()

      // Step 3: Manually update to SpreadAgent
      console.log('[VoiceSessionManager] Ritual complete. Updating to SpreadAgent...')
      await this.session.updateAgent(spreadAgent)

      // Update current agent state
      this.currentAgentName = 'SpreadGenerationAgent'
      store.setCurrentAgent('SpreadGenerationAgent')

      console.log('[VoiceSessionManager] Successfully transitioned to SpreadAgent')
    } catch (error) {
      console.error('[VoiceSessionManager] Failed to transition to SpreadAgent:', error)
      const store = useVoiceReadingStore.getState()
      store.setError('Failed to transition to spread generation phase')
    }
  }

  /**
   * Wait for ritual preparation phase to complete
   * Similar logic to waitForRitualTool but used internally by VoiceSessionManager
   */
  private async waitForRitualCompletion(): Promise<void> {
    const store = useVoiceReadingStore.getState()

    // Early return if ritual is already complete
    if (!store.showRitual) {
      console.log('[VoiceSessionManager] Ritual already complete')
      return
    }

    // Subscribe and wait for ritual completion
    return new Promise<void>((resolve) => {
      const unsubscribe = useVoiceReadingStore.subscribe((state) => {
        // Check if ritual phase is complete
        if (!state.showRitual) {
          // Clean up subscription
          unsubscribe()
          console.log('[VoiceSessionManager] Ritual phase completed')
          resolve()
        }
      })
    })
  }

  /**
   * Back to main reading UI
   * Clear all overlay UIs to show the main voice interface with transcript
   */
  private backToMainReadingUi(): void {
    console.log('[VoiceSessionManager] Returning to main reading UI')

    const store = useVoiceReadingStore.getState()

    // Clear all overlay states to show main voice interface
    // This ensures the transcript and main controls are visible during reading

    // Use existing store methods where available
    if (store.showShuffling) {
      store.completeShuffling() // Sets showShuffling: false
    }

    // Clear other overlay states
    if (store.showRitual) {
      store.completeRitual() // Sets showRitual: false, showShuffling: true
      store.completeShuffling() // Then clear shuffling
    }

    // Clear card-related overlays
    if (store.cardReveal) {
      store.hideCardReveal()
    }

    // Note: We keep currentlyDisplayedCard so user can see which card is being discussed
    // Note: We don't clear cardDrawRequest here as it should already be null by this point

    // Unmute session (was muted during IntentToSpread transition)
    if (this.session) {
      console.log('[VoiceSessionManager] Unmuting session for reading phase')
      this.session.mute(false)
    }
  }

  /**
   * Set up event listeners for session events
   */
  private setupEventListeners(): void {
    if (!this.session) {
      return
    }

    // Listen for agent handoff events
    this.session.on('agent_handoff', (context, fromAgent, toAgent) => {
      console.log(`[VoiceSessionManager] Agent handoff: ${fromAgent.name} → ${toAgent.name}`)

      // NOTE: SpreadAgent → ReadingAgent transition is now handled manually via transitionToReadingWithCards()
      // No automatic handoff handling needed for that transition

      // Update current agent state
      if (toAgent.name) {
        this.currentAgentName = toAgent.name as VoiceAgentName
        const store = useVoiceReadingStore.getState()
        store.setCurrentAgent(toAgent.name as VoiceAgentName)
      }
    })
    
    // Listen for error events
    this.session.on('error', (errorEvent) => {
      console.error('[VoiceSessionManager] Session error occurred')
      console.error('[VoiceSessionManager] Error type:', errorEvent.type)
      console.error('[VoiceSessionManager] Error details:', errorEvent.error)

      const store = useVoiceReadingStore.getState()

      // Update store with error message
      const errorMessage = errorEvent.error instanceof Error
        ? errorEvent.error.message
        : 'An error occurred during the voice session'

      store.setError(errorMessage)
    })
  }

  /**
   * Transition to ReadingAgent with drawn cards
   * Called by UI when all cards have been drawn and revealed (batch mode)
   */
  async transitionToReadingWithCards(drawnCards: import('@/types').CardDraw[]): Promise<void> {
    if (!this.session) {
      console.error('[VoiceSessionManager] No active session')
      return
    }

    try {
      console.log('[VoiceSessionManager] Transitioning to ReadingAgent with cards:', drawnCards)

      // Clear any overlay UI states
      this.backToMainReadingUi()

      // Update to ReadingAgent
      await this.session.updateAgent(readingAgent)
      this.currentAgentName = 'ReadingAgent'

      const store = useVoiceReadingStore.getState()
      store.setCurrentAgent('ReadingAgent')

      // Format card details for message
      const cardSummary = drawnCards.map((card, idx) =>
        `${idx + 1}. cardId: ${card.cardId}, label: ${card.label}, cardName: ${card.name}, ${card.reversed ? 'Reversed' : 'Upright'}`
      ).join('\n')

      // Send message to ReadingAgent with full card details
      const message = `All cards have been drawn. Here are the cards for this reading:\n\n${cardSummary}\n\nPlease begin interpreting each card.`

      this.session.sendMessage(message)

      console.log('[VoiceSessionManager] Successfully transitioned to ReadingAgent')
    } catch (error) {
      console.error('[VoiceSessionManager] Failed to transition to ReadingAgent:', error)
      const store = useVoiceReadingStore.getState()
      store.setError('Failed to transition to reading phase')
    }
  }

  /**
   * Get the current session
   */
  getSession(): RealtimeSession | null {
    return this.session
  }

  /**
   * Check if session is connected
   */
  isConnected(): boolean {
    return this.session !== null && useVoiceReadingStore.getState().connectionStatus === 'connected'
  }

  /**
   * Get current agent name
   */
  getCurrentAgent(): VoiceAgentName {
    return this.currentAgentName
  }

  /**
   * Trigger the transition from IntentAgent to SpreadAgent
   * This can be called externally when the IntentAgent indicates it's ready
   * (e.g., via a tool call or completion signal)
   */
  async triggerIntentToSpreadTransition(): Promise<void> {
    if (this.currentAgentName !== 'IntentAssessmentAgent') {
      console.warn('[VoiceSessionManager] Cannot trigger transition: not currently in IntentAgent')
      return
    }

    await this.handleIntentToSpreadTransition()
  }
}

// Singleton instance
let sessionManagerInstance: VoiceSessionManager | null = null

/**
 * Get or create the voice session manager instance
 */
export function getVoiceSessionManager(): VoiceSessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new VoiceSessionManager()
  }
  return sessionManagerInstance
}
