import { z } from 'zod'
import type { PromptDefinition } from '@/lib/types/prompts'
import type { IntentAssessment } from '@/types'

/**
 * Zod schema for intent assessment response validation.
 * Matches the updated schema with required fields and anyOf patterns.
 */
export const IntentAssessmentSchema = z.object({
  intentStatus: z.enum(['clear', 'unclear']),
  assistantMessage: z.string().min(1),
  intentSummary: z.string().min(1).nullable(),
  hiddenConcern: z.string().min(1).nullable(),
  topic: z.string().max(50).min(1).nullable(),
  timeframe: z.string().nullable(),
})

/**
 * Intent Assessment Prompt Definition
 *
 * This prompt guides the AI to assess whether a user's intention for a tarot reading
 * is clear enough to proceed. If unclear, it asks clarifying questions.
 *
 * Used by: /api/ai/assess-intent
 */
export const INTENT_PROMPT: PromptDefinition<IntentAssessment> = {
  systemPrompt: `You are a professional Tarot reader.
Your task is to determine whether the user’s question or intention is clear enough to begin a tarot reading.

If the question is too vague, contradictory, or incomplete, ask one short clarifying question.

before writing your final JSON,  reason step by step internally about:

1. Surface Intent
What the user literally appears to be asking.
2. Deeper Concern
The emotional, spiritual, or practical issue beneath the surface.
(Examples: fear, uncertainty, desire for clarity, relational insecurity, career dissatisfaction, need for reassurance.)
3. User Need
What the querent actually hopes to gain from the reading.
(Clarity? Guidance? Decision support? Emotional validation? Understanding of patterns?)`,

  jsonSchema: {
    type: 'object' as const,
    properties: {
      intentStatus: {
        type: 'string' as const,
        enum: ['clear', 'unclear'],
        description: "Whether the user's intent is clear or unclear",
      },
      assistantMessage: {
        type: 'string' as const,
        description: 'A short message the assistant should return to the user: ask a clarifying question if unclear, or give a confirmation if clear.',
      },
      intentSummary: {
        type: 'string' as const,
        description: 'A summary of user intent (null when intent is unclear)',
      },
      hiddenConcern: {
        type: 'string' as const,
        description: 'Combination of user deeper concern and user need (null when intent is unclear)',
      },
      topic: {
        type: 'string' as const,
        description: 'Detected topic (max 50 chars) if clear, null if unclear',
      },
      timeframe: {
        type: 'string' as const,
        description: "Detected timeframe (e.g., 'today', 'next week'), or null if none",
      },
    },
    required: ['intentStatus', 'assistantMessage', 'intentSummary', 'hiddenConcern', 'topic', 'timeframe'],
    additionalProperties: false,
  } as const,

  validator: IntentAssessmentSchema as any, // Type coercion for API compatibility
}
