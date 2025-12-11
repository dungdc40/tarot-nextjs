import { z } from 'zod'

// ==================== Request Schemas ====================

export const AssessIntentRequestSchema = z.object({
  userMessage: z.string().min(1, 'User message is required'),
  previousResponseId: z.string().optional(),
})

export const GenerateSpreadRequestSchema = z.object({
  intentSummary: z.string().min(1, 'Intent summary is required'),
  timeframe: z.string().optional(),
})

export const GenerateReadingRequestSchema = z.object({
  intentSummary: z.string().min(1, 'Intent summary is required'),
  cards: z.array(
    z.object({
      cardId: z.string(),
      card: z.string(),
      reversed: z.boolean(),
      promptRole: z.string(),
      label: z.string(),
    })
  ),
})

export const RequestExplanationRequestSchema = z.object({
  highlightedText: z.string().min(1, 'Highlighted text is required'),
  responseId: z.string().min(1, 'Response ID is required'),
})

export const HandleClarificationRequestSchema = z.object({
  clarificationQuestion: z.string().min(1, 'Clarification question is required'),
  cards: z.array(
    z.object({
      cardId: z.string(),
      name: z.string(),
      reversed: z.boolean(),
      promptRole: z.string(),
      label: z.string(),
    })
  ),
  previousResponseId: z.string().optional(),
})

// ==================== Response Schemas ====================

export const IntentAssessmentSchema = z.object({
  status: z.enum(['clear', 'unclear']),
  intention: z.string(),
  topic: z.string().optional(),
  timeframe: z.string().optional(),
  clarificationQuestion: z.string().optional(),
  responseId: z.string().optional(),
})

export const SpreadPositionSchema = z.object({
  label: z.string(),
  promptRole: z.string(),
})

export const SpreadSelectionSchema = z.object({
  name: z.string(),
  cardCount: z.number(),
  positions: z.array(SpreadPositionSchema),
  description: z.string().optional(),
})

export const CardDrawSchema = z.object({
  cardId: z.string(),
  name: z.string(),
  reversed: z.boolean(),
  drawIndex: z.number(),
  label: z.string(),
  promptRole: z.string(),
  interpretation: z.string().optional(),
  generalMeaning: z.string().optional(),
})

export const ClarificationResultSchema = z.object({
  message: z.string(),
  cards: z.array(CardDrawSchema),
  isFinalAnswer: z.boolean(),
  responseId: z.string().optional(),
})

// ==================== Type Exports ====================

export type AssessIntentRequest = z.infer<typeof AssessIntentRequestSchema>
export type GenerateSpreadRequest = z.infer<typeof GenerateSpreadRequestSchema>
export type GenerateReadingRequest = z.infer<typeof GenerateReadingRequestSchema>
export type RequestExplanationRequest = z.infer<typeof RequestExplanationRequestSchema>
export type HandleClarificationRequest = z.infer<typeof HandleClarificationRequestSchema>

export type IntentAssessmentResponse = z.infer<typeof IntentAssessmentSchema>
export type SpreadSelectionResponse = z.infer<typeof SpreadSelectionSchema>
export type ClarificationResultResponse = z.infer<typeof ClarificationResultSchema>
