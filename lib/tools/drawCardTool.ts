// draw_card Tool - Request user to draw a tarot card for a specific spread position
// Used by Spread Generation Agent and Followup Agent in voice reading mode

import { tool } from '@openai/agents'
import { z } from 'zod'
import { useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import { getVoiceSessionManager } from '@/lib/services/VoiceSessionManager'
import type { DrawCardToolResult } from '@/types'

/**
 * Tool definition for draw_card
 *
 * This tool is called by voice agents when they need the user to select a card.
 * It triggers the UI to show a card picker, waits for user selection,
 * and returns the selected card details back to the agent.
 *
 * Used by:
 * - SpreadGenerationAgent: For each position in the spread
 * - FollowupAgent: For clarification cards (1-3 max)
 */
export const drawCardTool = tool({
  name: 'draw_card',
  description: `Request the user to draw a tarot card for a specific spread position.

  This tool shows a card picker UI to the user and waits for them to select a card.
  The selected card is then revealed and returned to you with its ID, name, and orientation.

  Use this tool:
  - In Spread Generation: Call once for each position in the spread
  - In Follow-up: Only when a question truly requires new cards (1-3 max)

  Parameters:
  - positionLabel: The name of the position (e.g., "Past", "Present", "Future", "Outcome")
  - promptRole: A brief description of what this position represents in the reading

  Example usage:
  - Position: "Present Situation", Role: "What energies surround you right now"
  - Position: "Hidden Influence", Role: "Unseen factors affecting the situation"`,

  parameters: z.object({
    positionLabel: z.string().describe(
      'The name or label for this card position (e.g., "Past", "Present", "Clarification")'
    ),
    promptRole: z.string().describe(
      'A description of what this position represents in the reading context'
    ),
    cardNumber: z.number().describe(
      'The current card number being drawn (1-based index, e.g., 1, 2, 3). Starts at 1 and increases with each draw.'
    ),
    totalCards: z.number().describe(
      'The total number of cards to be drawn in this reading (e.g., 3 for a 3-card spread)'
    ),
  }),

  execute: async ({ positionLabel, promptRole, cardNumber, totalCards }): Promise<DrawCardToolResult> => {
    try {
      // Get the voice reading store
      const store = useVoiceReadingStore.getState()
      console.log(`drawCardTool is called with param:`, { positionLabel, promptRole, cardNumber, totalCards })
      // Request card draw from UI (returns a Promise)
      // This will:
      // 1. Set cardDrawRequest in store
      // 2. UI detects this and shows full-screen card picker
      // 3. User selects a card
      // 4. UI calls resolveCardDraw() with the selected card
      // 5. Promise resolves with the card data
      const card = await store.requestCardDraw(positionLabel, promptRole, cardNumber, totalCards)

      // Get the actual card name from the deck service
      const actualCardName = riderWaiteDeckService.getCardName(card.cardId)

      // Get current spread information to calculate position
      const { spread, drawnCards } = store
      const positionIndex = drawnCards.length
      const totalPositions = spread?.positions.length || 1

      // Show the card reveal animation immediately after selection
      // This creates a seamless flow from card selection to reveal
      store.showCardReveal({
        cardId: card.cardId,
        cardName: actualCardName,
        reversed: card.reversed,
        positionLabel,
        positionIndex,
        totalPositions,
        isVisible: true,
      })

      // If there are more cards to draw, schedule a prompt after 3 seconds
      if (cardNumber < totalCards) {
        setTimeout(() => {
          const sessionManager = getVoiceSessionManager()
          const session = sessionManager.getSession()

          if (session) {
            const nextCardNumber = cardNumber + 1
            const message = `Please SILENTLY call draw_card tool for card number ${nextCardNumber} if you haven't called it.`

            try {
              session.sendMessage(message)
              console.log(`Scheduled message sent for card ${nextCardNumber}:`, message)
            } catch (error) {
              console.error('Failed to send scheduled message:', error)
            }
          } else {
            console.warn('Session not available for scheduled message')
          }
        }, 3000)
      }

      return {
        cardId: card.cardId,
        cardName: actualCardName,
        reversed: card.reversed,
      }
    } catch (error) {
      // Return error information to agent
      // Agent should handle this gracefully (e.g., ask user to try again)
      throw new Error(
        `Failed to draw card for position "${positionLabel}". ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  },
})
