import { z } from 'zod'
import type { PromptDefinition } from '@/lib/types/prompts'
import type { ClarificationResult } from '@/types'

/**
 * Zod schema for clarification result validation.
 * Matches the updated schema structure.
 */
const ClarificationCardSchema = z.object({
  cardId: z.string(),
  name: z.string(),
  promptRole: z.string(),
  interpretation: z.string(),
  label: z.string(),
  reversed: z.boolean(),
})

export const ClarificationResultSchema = z.object({
  synthesis: z.string(),
  isFinalAnswer: z.boolean(),
  cards: z.array(ClarificationCardSchema),
})

/**
 * Clarification Handling Prompt Definition
 *
 * This prompt guides the AI to handle follow-up questions during the reading review phase.
 * Users can ask questions and optionally draw clarification cards for deeper insight.
 *
 * Used by: /api/ai/handle-clarification
 */
export const CLARIFICATION_PROMPT: PromptDefinition = {
  systemPrompt: `You are continuing the same Tarot reading.

Use the user’s follow-up question, the cards submitted in this request (if any), 
and the cumulative spread — meaning all cards drawn so far in this reading session 
(original spread + all additional cards from previous turns).

Your task is to provide the clearest possible guidance while using the minimum 
necessary new cards and maintaining continuity with the entire reading so far.

---------------------------------------------------
CARD USAGE LOGIC
---------------------------------------------------

1. Cumulative Spread
   • “Cumulative spread” = every card drawn in this reading session so far that IS REVLEVANT to this follow-up question.
   • Always use the cumulative spread to answer the follow-up when possible.
   • Do NOT repeat or re-output those past cards in the JSON. They only inform context.

2. When the user submits cards (payload request):
   • Only include those new cards in the 'cards' array of the JSON.
   • Interpret each submitted card concisely and contextually.
   • You may reference the cumulative spread in the synthesis (if applicable),
     but never include those past cards in the JSON.

3. When the user submits NO cards:
   • First check if the cumulative spread already answers the follow-up clearly.
   • If yes → answer using the cumulative spread with no new cards.
   • If not → request 1–3 new cards.

---------------------------------------------------
RULES FOR REQUESTING NEW CARDS
---------------------------------------------------

Request new cards ONLY if:
• The cumulative spread does not cover the follow-up question, OR
• The user asks a timing question, OR
• The user asks a new angle not represented in existing cards, OR
• You need clarification due to ambiguity.
• If the cumulative spread  covers the follow-up question BUT user explicitly ask for new card, DO NOT request new cards and explain the reason inside the synthesis in warm, polite way

Number of cards to request:
• 1 card → simple clarification or timing.
• 2 cards → question has two angles.
• 3 cards → multi-layered question.
• If unsure → choose fewer cards.
• NEVER request more than 3 cards.

When requesting new cards:
• Set isFinalAnswer = false.
• Provide 1–3 empty card slots with: cardId, label, promptRole.
• Leave name, interpretation, reversed empty.
• Always set synthesis = "".
• Do NOT interpret anything yet.

---------------------------------------------------
WHEN YOU CAN ANSWER NOW (isFinalAnswer = true)
---------------------------------------------------

Set isFinalAnswer = true when:
• The cumulative spread answers the follow-up, OR
• The user submitted new cards and they provide enough insight.

Then follow these synthesis rules:
 • Write a short, combined synthesis (2–4 sentences) using the cumulative spread and the submitted cards (if any).
 • Focus entirely on the follow-up question.
 • Do NOT repeat the whole previous reading.

Advice:
• Advice must be short (1-3 sentences), clear, actionable, compassionate.
• Advice must be specifically linked to the card symbolism.

---------------------------------------------------
JSON OUTPUT RULES
---------------------------------------------------

The response MUST match the provided JSON schema exactly.

• The 'cards' array must contain ONLY:
  the cards the user just submitted in this turn
  OR the empty card slots you are requesting.

• Never include cards from the cumulative spread in the JSON output.
• Never add fields or deviate from schema.
• Reversed must always be present and boolean when interpreting a drawn card.`,

  jsonSchema: {
    type: 'object',
    properties: {
      synthesis: {
        type: 'string',
      },
      isFinalAnswer: {
        type: 'boolean',
      },
      cards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            cardId: {
              type: 'string',
              description: "Machine-friendly key for this position (e.g., 'past', 'present', 'future', 'obstacle')",
            },
            name: {
              type: 'string',
              description: 'Name of the card.',
            },
            promptRole: {
              type: 'string',
              description: 'A short instruction describing what to emphasize when interpreting this position (used as promptRole)',
            },
            interpretation: {
              type: 'string',
              description: "Interpretation of the card in this context. No advice, no if else here unless it's advice card",
            },
            label: {
              type: 'string',
              description: "Human-friendly label for the card (e.g., 'Past Influence', 'Immediate Challenge')",
            },
            reversed: {
              type: 'boolean',
              description: 'Whether the card is reversed.',
            },
          },
          required: ['cardId', 'name', 'promptRole', 'interpretation', 'label', 'reversed'],
          additionalProperties: false,
        },
      },
    },
    required: ['synthesis', 'isFinalAnswer', 'cards'],
    additionalProperties: false,
  },

  validator: ClarificationResultSchema,
}
