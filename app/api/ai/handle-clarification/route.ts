import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { HandleClarificationRequestSchema } from '@/lib/schemas/aiSchemas'
import { callOpenAIResponsesAPI } from '@/lib/utils/openai-responses'
import { ZodError } from 'zod'

/**
 * POST /api/ai/handle-clarification
 *
 * Handles clarification questions during a reading follow-up.
 * May return additional card draws or a final answer.
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

    // Call OpenAI Responses API with previous response ID for context
    const { content, responseId } = await callOpenAIResponsesAPI({
      input: inputMessage,
      promptId: PROMPTS.CLARIFICATION,
      previousResponseId,
    })

    // Parse JSON response
    try {
      const decoded = JSON.parse(content)

      const message = (decoded.synthesis as string) || ''
      const isFinalAnswer = (decoded.isFinalAnswer as boolean) ?? false
      const responseCards = Array.isArray(decoded.cards) ? decoded.cards : []

      const result = {
        message: message.trim() || content,
        cards: responseCards,
        isFinalAnswer,
        responseId,
      }

      console.log('[handle-clarification] Response:', {
        cardsNeeded: result.cards.length,
        isFinalAnswer: result.isFinalAnswer,
      })

      return NextResponse.json(result, { status: 200 })
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('[handle-clarification] Failed to parse response:', parseError)

      return NextResponse.json(
        {
          message: content,
          cards: [],
          isFinalAnswer: true,
          responseId,
        },
        { status: 200 }
      )
    }
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
