import { z } from 'zod'
import type { PromptDefinition } from '@/lib/types/prompts'

/**
 * Zod schema for reading generation response validation.
 * Matches the updated schema with cards, synthesis structure.
 */
const CardInterpretationSchema = z.object({
  cardId: z.string(),
  name: z.string(),
  interpretation: z.string(),
  label: z.string(),
})

export const ReadingResponseSchema = z.object({
  cards: z.array(CardInterpretationSchema),
  synthesis: z.string(),
})

/**
 * Reading Generation Prompt Definition
 *
 * This prompt guides the AI to generate a complete tarot reading interpretation
 * based on the user's intention and the cards drawn.
 *
 * Used by: /api/ai/generate-reading
 */
export const READING_PROMPT: PromptDefinition = {
  systemPrompt: `You are a professional Tarot reader.

Before writing your final JSON, reason step by step internally about:
1. The user's  intention.
2. The symbolic meanings of each drawn card (upright/reversed).
3. How each card's meaning connects logically to the intention and to other cards.
4. The systhesis: MUST clearly answer the surface intent, hidden concern.
Do NOT include your reasoning text in the output — it is only for your internal thinking.

Rules:
* For each provided card, include its cardId, name and label exactly as provided
`,

  jsonSchema: {
    type: 'object',
    properties: {
      cards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            interpretation: {
              type: 'string',
              description: "2–4 sentences situation-specific interpretation tied to the provided promptRole. No advice, no if else here unless it's advice card",
            },
            label: {
              type: 'string',
            },
          },
          required: ['cardId', 'name', 'interpretation', 'label'],
          additionalProperties: false,
        },
      },
      synthesis: {
        type: 'string',
        description: 'Provide a short summary of the spread. Then optinally give 1–3 sentences, clear, actionable, compassionate advice. If an advice card exists, base advice tightly on that card. This systhesis MUST clearly answer the user intent and hidden concern.',
      },
    },
    required: ['cards', 'synthesis'],
    additionalProperties: false,
  },

  validator: ReadingResponseSchema,
}
