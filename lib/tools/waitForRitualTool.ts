// wait_for_ritual Tool - Wait for ritual preparation phase to complete
// Used by Spread Generation Agent before starting card selection

import { tool } from '@openai/agents'
import { z } from 'zod'
import { useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'
import type { WaitForRitualToolResult } from '@/types'

/**
 * Tool definition for wait_for_ritual
 *
 * This tool allows agents to wait for the ritual preparation phase to complete
 * before proceeding with card selection. The ritual is initiated by the
 * IntentAssessmentAgent using the start_ritual tool.
 *
 * The ritual involves the user holding a card for 3 seconds as a centering
 * practice before drawing cards. This tool waits until that phase is complete.
 *
 * Used by:
 * - SpreadGenerationAgent: At the start, before announcing the spread
 */
export const waitForRitualTool = tool({
  name: 'wait_for_ritual',
  description: `Wait for the ritual preparation phase to complete before card selection.
  This tool pauses agent execution until the user has completed the ritual
  centering practice.

  Call this tool:
  - At the START of SpreadGenerationAgent flow

  The tool will wait indefinitely until showRitual becomes false, which
  indicates the ritual phase is complete and card selection can begin.`,

  parameters: z.object({}), // No parameters needed

  execute: async (): Promise<WaitForRitualToolResult> => {
    try {
      // Get the voice reading store
      const store = useVoiceReadingStore.getState()
      console.log('[WaitForRitualTool] Checking ritual state:', {
        showRitual: store.showRitual,
      })

      // Early return if ritual is already complete
      if (!store.showRitual) {
        console.log('[WaitForRitualTool] Ritual already complete')
        return {
          success: true,
          message: 'Ritual phase already complete',
          wasAlreadyComplete: true,
        }
      }

      console.log('[WaitForRitualTool] Waiting for ritual to complete...')

      // Subscribe and wait for ritual completion
      return new Promise<WaitForRitualToolResult>((resolve) => {
        const unsubscribe = useVoiceReadingStore.subscribe((state) => {
          // Check if ritual phase is complete
          if (!state.showRitual) {
            // Clean up subscription
            unsubscribe()

            console.log('[WaitForRitualTool] Ritual phase completed')

            // Resolve the promise
            resolve({
              success: true,
              message: 'Ritual phase completed. Ready for card selection.',
              wasAlreadyComplete: false,
            })
          }
        })
      })
    } catch (error) {
      // Return error information to agent
      throw new Error(
        `Failed to wait for ritual completion. ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  },
})
