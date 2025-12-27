import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { HandleClarificationRequestSchema } from '@/lib/schemas/aiSchemas'
import { llmProvider } from '@/lib/config/llm-provider'
import { CLARIFICATION_PROMPT } from '@/lib/prompts/clarification-prompt'
import { ZodError } from 'zod'
import type { ClarificationResult } from '@/types'

/**
 * POST /api/ai/handle-clarification
 *
 * Handles clarification questions during a reading follow-up.
 * May return additional card draws or a final answer.
 * Uses LLM provider abstraction (supports OpenAI and Xai).
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { clarificationQuestion, cards, previousResponseId } =
      HandleClarificationRequestSchema.parse(body)

    console.log('[handle-clarification] Request:', {
      clarificationQuestion,
      cardsCount: cards.length,
      previousResponseId,
    })

    // Prepare input message
    const inputMessage = JSON.stringify({
      clarificationQuestion,
      cards,
    })

    // Call LLM provider with both prompt formats (provider picks what it needs)
    const response = await llmProvider.callAPI({
      input: inputMessage,
      promptId: PROMPTS.CLARIFICATION, // For OpenAI (stored prompt)
      promptDefinition: CLARIFICATION_PROMPT, // For Xai (in-code prompt)
      previousResponseId,
    })

    // Response is already validated by provider
    const clarificationData = response.content as {
      synthesis: string
      isFinalAnswer: boolean
      cards: Array<{
        cardId: string
        name: string
        promptRole: string
        interpretation: string
        label: string
        reversed: boolean
      }>
    }

    const result: ClarificationResult = {
      message: clarificationData.synthesis,
      cards: clarificationData.cards as any, // Type conversion for CardDraw compatibility
      isFinalAnswer: clarificationData.isFinalAnswer,
      responseId: response.responseId,
    }

    console.log('[handle-clarification] Response:', {
      cardsNeeded: result.cards.length,
      isFinalAnswer: result.isFinalAnswer,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[handle-clarification] Error:', error)

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // Handle OpenAI API errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to handle clarification',
          message: error.message,
        },
        { status: 500 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
