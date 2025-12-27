import { z } from 'zod'
import type { PromptDefinition } from '@/lib/types/prompts'

/**
 * Zod schema for explanation result validation.
 */
export const ExplanationResultSchema = z.object({
  explanation: z.string().min(1),
})

export type ExplanationResult = z.infer<typeof ExplanationResultSchema>

/**
 * Explanation Request Prompt Definition
 *
 * This prompt guides the AI to provide deeper explanations when users highlight
 * specific text from their reading and ask "Why?" or request more context.
 *
 * Returns JSON with explanation field.
 *
 * Used by: /api/ai/request-explanation
 */
export const EXPLANATION_PROMPT: PromptDefinition<ExplanationResult> = {
  systemPrompt: `You are a professional tarot reader providing explanations for your interpretations.
The user has highlighted a specific part of your previous response and wants to understand why you gave that particular interpretation.

Your task:
- Explain the reasoning behind the highlighted interpretation
- Focus on the "why" behind the interpretation, not just restating what was said
- Reference the specific tarot card meanings, symbolism, or reading context that led to this interpretation
- Maintain a professional and insightful tone

Respond with a short, clear, direct explanation of your reasoning in JSON format matching the provided schema.`,

  jsonSchema: {
    type: 'object',
    properties: {
      explanation: {
        type: 'string',
        description: 'A short, clear, direct explanation of the reasoning behind the highlighted interpretation',
      },
    },
    required: ['explanation'],
    additionalProperties: false,
  },

  validator: ExplanationResultSchema,
}
