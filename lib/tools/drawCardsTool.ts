// draw_cards Tool - Request user to draw multiple tarot cards (batch mode)
// Used by Spread Generation Agent in voice reading mode

import { tool } from '@openai/agents'
import { z } from 'zod'
import { useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'
import type { DrawCardsToolResult, SpreadSelection } from '@/types'

/**
 * Tool definition for draw_cards (batch mode)
 *
 * This tool is called by voice agents when they need the user to select multiple cards.
 * It sets up the spread and initializes the card drawing flow, then returns immediately.
 * The UI handles the card-by-card drawing with user progression controls.
 *
 * Used by:
 * - SpreadGenerationAgent: For all positions in the spread
 *
 * Flow:
 * 1. Agent calls draw_cards with array of card positions
 * 2. Tool creates spread and initializes drawing (currentCardDrawIndex = 0)
 * 3. Tool returns immediately
 * 4. UI shows CardPicker for each card
 * 5. User draws cards one by one with "Next Card" button
 * 6. After last card, UI triggers transition to ReadingAgent
 */
export const drawCardsTool = tool({
  name: 'draw_cards',
  description: `Request the user to draw multiple tarot cards for a spread (batch mode).

  This tool sets up a complete spread and returns immediately without waiting.
  The UI will guide the user through drawing each card one by one.

  Use this tool:
  - In Spread Generation: Call ONCE with the complete list of all card positions

  Parameters:
  - cards: Array of card positions, each with:
    - positionLabel: The name of the position (e.g., "Past", "Present", "Future")
    - promptRole: A brief description of what this position represents

  Example usage:
  draw_cards({
    cards: [
      { positionLabel: "Past", promptRole: "What brought you here" },
      { positionLabel: "Present", promptRole: "Your current energy" },
      { positionLabel: "Future", promptRole: "Where this leads" }
    ]
  })

  After calling this tool:
  - Do NOT speak until the reading phase begins
  `,

  parameters: z.object({
    cards: z.array(z.object({
      positionLabel: z.string().describe(
        'The name or label for this card position (e.g., "Past", "Present", "Outcome")'
      ),
      promptRole: z.string().describe(
        'A description of what this position represents in the reading context'
      ),
    })).min(1).max(10).describe('Array of card positions to draw in order (1-10 cards)'),
  }),

  execute: async ({ cards }): Promise<DrawCardsToolResult> => {
    try {
      console.log(`[drawCardsTool] Called with ${cards.length} cards:`, cards)
      // Get the voice reading store
      const store = useVoiceReadingStore.getState()


      // Create spread structure from cards (reusing existing SpreadSelection type)
      const spread: SpreadSelection = {
        spreadType: 'Voice Reading Spread',
        spreadDescription: `${cards.length}-card spread for voice reading`,
        positions: cards.map((card: { positionLabel: string; promptRole: string }, index: number) => ({
          cardId: '',  // Empty placeholder - will be filled when user selects card
          name: '',    // Empty placeholder - will be filled when user selects card
          reversed: false,  // Default value - will be set when user selects card
          drawIndex: index,
          label: card.positionLabel,
          promptRole: card.promptRole,
        }))
      }

      // Set the spread (reusing existing state)
      store.setSpread(spread)

      // Initialize card drawing (sets currentCardDrawIndex = 0)
      store.startCardDrawing()

      console.log(`[drawCardsTool] Spread created with ${spread.positions.length} positions`)
      console.log('[drawCardsTool] Card drawing flow initialized')

      // Return immediately (don't wait for user)
      return {
        status: 'started',
        totalCards: cards.length,
        message: `Card drawing session started for ${cards.length} cards`
      }
    } catch (error) {
      // Return error information to agent
      throw new Error(
        `Failed to start card drawing session. ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  },
})
