// show_card Tool - Display a tarot card on screen before interpreting it
// Used by Reading Agent and Followup Agent in voice reading mode

import { tool } from '@openai/agents'
import { z } from 'zod'
import { useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'
import type { ShowCardToolResult } from '@/types'

/**
 * Tool definition for show_card
 *
 * This tool is called by voice agents when they want to display a card
 * on screen before speaking its interpretation. It provides a visual
 * element synchronized with the spoken reading.
 *
 * Used by:
 * - ReadingAgent: Before interpreting each card in the spread
 * - FollowupAgent: Before interpreting newly drawn clarification cards
 */
export const showCardTool = tool({
  name: 'show_card',
  description: `Display a tarot card on the screen before interpreting it.

  This tool shows the specified card visually to the user

  Use this tool:
  - Reading Phase: Call before interpreting each card in the spread
  - Follow-up Phase: Call before interpreting any newly drawn clarification cards

  The tool ensures your spoken interpretation is synchronized with the
  visual card display, creating a cohesive reading experience.

  Parameters:
  - cardId: The unique identifier for the card (e.g., "the-fool", "the-magician")
  - reversed: Whether the card is in reversed (upside down) position`,

  parameters: z.object({
    cardId: z.string().describe(
      'The unique identifier for the card to display (e.g., "the-fool", "ten-of-cups")'
    ),
    reversed: z.boolean().describe(
      'Whether the card is reversed (upside down) in the reading'
    ),
  }),

  execute: async ({ cardId, reversed }): Promise<ShowCardToolResult> => {
    console.log('[ShowCardTool] Displaying card:', { cardId, reversed })

    try {
      // Get the voice reading store
      const store = useVoiceReadingStore.getState()
      console.log('[ShowCardTool] Card displayed successfully:', cardId)

      // Show the card on screen
      // This will:
      // 1. Set currentlyDisplayedCard in store
      // 2. UI detects this and displays the card
      // 3. Wait for display animation to complete (e.g., 500ms)
      // 4. Promise resolves
      await store.showCard(cardId, reversed)


      return {
        success: true,
        cardId,
        reversed,
      }
    } catch (error) {
      console.error('[ShowCardTool] Error displaying card:', error)

      // Return error information to agent
      // Agent should handle this gracefully (e.g., skip card display or retry)
      throw new Error(
        `Failed to display card "${cardId}". ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  },
})
