import { z } from 'zod'
import type { PromptDefinition } from '@/lib/types/prompts'
import type { SpreadSelectionResult, SpreadSelection } from '@/types'

/**
 * Zod schema for spread selection response validation.
 * Matches the updated schema structure.
 */
const SpreadPositionSchema = z.object({
  key: z.string(),
  label: z.string(),
  promptRole: z.string(),
})

export const SpreadSelectionResultSchema = z.object({
  spreadType: z.string(),
  spreadDescription: z.string(),
  reasoning: z.string(),
  positions: z.array(SpreadPositionSchema),
})

/**
 * Spread Selection Prompt Definition
 *
 * This prompt guides the AI to select an appropriate tarot spread layout based on
 * the user's intention and timeframe.
 *
 * Used by: /api/ai/generate-spread
 */
export const SPREAD_PROMPT: PromptDefinition<SpreadSelectionResult> = {
  systemPrompt: `You are a professional tarot reader. Based on the user’s intent, design the most suitable tarot spread using 1–10 cards only.

Your goal is not only to analyze, but to provide:
– Clarity
– Direction
– Emotional resolution
– And a meaningful sense of alignment

Select the minimum number of cards required to give a satisfying, directional answer.
Avoid unnecessary cards, but never omit guidance when a decision is involved.

✅ CORE DESIGN RULES

• Simple or daily questions → 1–3 cards
(General energy, focus, advice only)

• One-focus decision questions → 4–6 cards
The spread must include:
– Situation / influence
– Likely outcome
– Challenge or block
– Advice or inner alignment

• Two-option comparison questions (A vs B) → 7–9 cards
The spread must include:
– A: Strength
– A: Challenge
– A: Likely outcome
– B: Strength
– B: Challenge
– B: Likely outcome
– Higher Self / Inner Alignment
– Final Guidance / Energetic Direction

• Multi-choice comparison (A vs B vs C vs D or more) → 6–9 cards
Apply compression logic.

– Do NOT assign full pros / cons / outcomes to every option.
– Use maximum 1 core energy card per option.
– The total spread must stay within 6–9 cards including guidance.

The spread must include:
– One core energy signature card for each option
– One Higher Self / Inner Alignment card
– One Final Guidance / Best-Aligned Choice card

The purpose is to identify the most aligned path, not to analyze all options equally.

• Deep life-direction or complex psychological questions → up to 10 cards
The spread must include:
– Core life pattern
– Hidden or unconscious block
– Evolution direction
– Higher Self guidance
– Practical action advice

✅ MANDATORY DECISION PRINCIPLES

– Every choice-based spread must be capable of producing a clear directional answer.
– Comparison spreads must not end in neutral ambiguity.
– Free will is respected, but energetic alignment must be indicated.
– The spread must allow the reader to say which path flows with less resistance and deeper growth.

❌ STRICT RESTRICTIONS

– Do NOT overcomplicate spreads.
– Do NOT add decorative, redundant, or repetitive cards.
– Do NOT generate symmetrical logic-only layouts for decision questions.
– If unsure, always prefer fewer structural cards rather than removing guidance, higher-self, or final direction.

The spread must always be capable of supporting:
– Insight
– Emotional clarity
– And a clear sense of which direction is more aligned, even when multiple choices exist.`,

  jsonSchema: {
    type: 'object',
    properties: {
      spreadType: {
        type: 'string',
        description: 'Short identifier or name of the spread (e.g Clarity Path Spread, Decision Compass, Healing Overview)',
      },
      spreadDescription: {
        type: 'string',
        description: "A concise description of the spread's purpose and usage",
      },
      reasoning: {
        type: 'string',
        description: "Brief explanation of why this spread suits the user's question or the design rationale",
      },
      positions: {
        type: 'array',
        description: 'List of positions in the spread. Each object describes a slot for a drawn card.',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: "Machine-friendly key for this position (e.g., 'past', 'present', 'future', 'obstacle')",
            },
            label: {
              type: 'string',
              description: "Human-friendly label for the position (e.g., 'Past Influence', 'Immediate Challenge'), avoid technical or coded formats.",
            },
            promptRole: {
              type: 'string',
              description: 'A short instruction describing what to emphasize when interpreting this position (used as promptRole)',
            },
          },
          required: ['key', 'label', 'promptRole'],
          additionalProperties: false,
        },
      },
    },
    required: ['spreadType', 'spreadDescription', 'reasoning', 'positions'],
    additionalProperties: false,
  },

  validator: SpreadSelectionResultSchema as any, // Type coercion for API compatibility
}
