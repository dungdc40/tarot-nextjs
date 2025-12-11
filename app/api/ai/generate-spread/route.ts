import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { GenerateSpreadRequestSchema } from '@/lib/schemas/aiSchemas'
import { callOpenAIResponsesAPI } from '@/lib/utils/openai-responses'
import { ZodError } from 'zod'

/**
 * POST /api/ai/generate-spread
 *
 * Generates a tarot spread selection based on the user's intention.
 * Returns spread configuration with positions and their roles.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { intentSummary, timeframe } = GenerateSpreadRequestSchema.parse(body)

    console.log('[generate-spread] Request:', { intentSummary, timeframe })

    // Prepare input message
    const inputMessage = JSON.stringify({
      intentSummary,
      ...(timeframe && { timeframe }),
    })

    // Call OpenAI Responses API
    const { content, responseId } = await callOpenAIResponsesAPI({
      input: inputMessage,
      promptId: PROMPTS.SPREAD,
    })

    // Parse JSON response
    const parsed = JSON.parse(content)

    // Add response ID
    const result = {
      success: true,
      spread: parsed,
      responseId,
      isComplete: true,
    }

    console.log('[generate-spread] Response:', result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[generate-spread] Error:', error)

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
          error: `Failed to generate spread selection: ${error.message}`,
          isComplete: true,
        },
        { status: 500 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        isComplete: true,
      },
      { status: 500 }
    )
  }
}
