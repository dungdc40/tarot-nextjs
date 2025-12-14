import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { GenerateReadingRequestSchema } from '@/lib/schemas/aiSchemas'
import { callOpenAIResponsesAPI } from '@/lib/utils/openai-responses'
import { ZodError } from 'zod'

/**
 * POST /api/ai/generate-reading
 *
 * Generates a complete tarot reading interpretation based on
 * the user's intention and selected cards.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { intentSummary, cards, hiddenConcern } = GenerateReadingRequestSchema.parse(body)

    console.log('[generate-reading] Request:', { intentSummary, cardsCount: cards.length, hiddenConcern })

    // Prepare input message
    const inputMessage = JSON.stringify({
      intentSummary,
      cards,
      hiddenConcern,
    })

    // Call OpenAI Responses API
    const { content, responseId } = await callOpenAIResponsesAPI({
      input: inputMessage,
      promptId: PROMPTS.READING,
    })

    // Parse JSON response (same pattern as other endpoints)
    const parsed = JSON.parse(content)

    // Return response with messageData
    const result = {
      messageData: parsed,
      responseId,
    }

    console.log('[generate-reading] Response generated successfully')

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[generate-reading] Error:', error)

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
          error: 'Failed to generate reading',
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
