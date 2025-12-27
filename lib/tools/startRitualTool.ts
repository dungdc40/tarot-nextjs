// start_ritual Tool - Initiate the ritual preparation and card shuffling phase
// Used by Intent Assessment Agent in voice reading mode

import { tool } from '@openai/agents'
import { z } from 'zod'
import { useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'
import { getVoiceSessionManager } from '@/lib/services/VoiceSessionManager'
import type { StartRitualToolResult } from '@/lib/types/voice'

/**
 * Tool definition for start_ritual
 *
 * This tool is called by the Intent Assessment Agent when the user's intent is clear
 * and it's time to begin the ritual preparation phase before card selection.
 *
 * Flow:
 * 1. Shows the ritual interface (press & hold card animation)
 * 2. After ritual completes, shows shuffling animation
 * 3. After shuffling completes, proceeds to spread generation
 *
 * Used by:
 * - IntentAssessmentAgent: Once intent is clear and ready to start reading
 */
export const startRitualTool = tool({
  name: 'start_ritual',
  description: `Initiate the ritual preparation phase before card selection.

  This tool begins the ceremonial process of preparing for the reading:
  - Shows a ritual interface where the user centers themselves
  - Plays a card shuffling animation
  - Prepares the deck for card selection

  Call this tool when:
  - The user's intent is clear and they're ready to begin
  - You've finished collecting information about their question
  - It's time to transition from conversation to the reading ritual

  The tool will handle the complete ritual and shuffling sequence automatically.
  After completion, the flow continues to spread generation.`,

  parameters: z.object({}),

  execute: async (): Promise<StartRitualToolResult> => {
    try {
      // Get the voice reading store
      const store = useVoiceReadingStore.getState()

      // Start the ritual phase
      // This will trigger the UI to show the ritual interface
      store.startRitual()

      // Trigger the transition from IntentAgent to SpreadAgent
      // This will:
      // 1. Mute the session
      // 2. Wait for ritual completion
      // 3. Update to SpreadAgent
      const sessionManager = getVoiceSessionManager()
      await sessionManager.triggerIntentToSpreadTransition()

      return {
        success: true,
        message: 'Ritual phase started. User is ready for the spread now',
      }
    } catch (error) {
      // Return error information to agent
      throw new Error(
        `Failed to start ritual phase. ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  },
})
