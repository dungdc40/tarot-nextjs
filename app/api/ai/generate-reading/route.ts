import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { GenerateReadingRequestSchema } from '@/lib/schemas/aiSchemas'
import { llmProvider } from '@/lib/config/llm-provider'
import { READING_PROMPT } from '@/lib/prompts/reading-prompt'
import { ZodError } from 'zod'

/**
 * POST /api/ai/generate-reading
 *
 * Generates a complete tarot reading interpretation based on
 * the user's intention and selected cards.
 * Uses LLM provider abstraction (supports OpenAI and Xai).
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

    // Call LLM provider with both prompt formats (provider picks what it needs)
    const response = await llmProvider.callAPI({
      input: inputMessage,
      promptId: PROMPTS.READING, // For OpenAI (stored prompt)
      promptDefinition: READING_PROMPT, // For Xai (in-code prompt)
    })

    // Response is already validated and parsed by provider
    const readingData = response.content as {
      cards: Array<{
        cardId: string
        name: string
        interpretation: string
        label: string
      }>
      synthesis: string
    }

    // Wrap in the expected messageData format for the API response
    const result = {
      messageData: readingData,
      responseId: response.responseId,
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
