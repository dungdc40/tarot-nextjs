import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { AssessIntentRequestSchema } from '@/lib/schemas/aiSchemas'
import { llmProvider } from '@/lib/config/llm-provider'
import { INTENT_PROMPT } from '@/lib/prompts/intent-prompt'
import { ZodError } from 'zod'

/**
 * POST /api/ai/assess-intent
 *
 * Assesses the clarity of a user's intention for a tarot reading.
 * Uses LLM provider abstraction (supports OpenAI and Xai).
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { userMessage, previousResponseId } = AssessIntentRequestSchema.parse(body)

    console.log('[assess-intent] Request:', { userMessage, previousResponseId })

    // Call LLM provider with both prompt formats (provider picks what it needs)
    const response = await llmProvider.callAPI({
      input: userMessage,
      promptId: PROMPTS.INTENT, // For OpenAI (stored prompt)
      promptDefinition: INTENT_PROMPT, // For Xai (in-code prompt)
      previousResponseId,
    })

    // Add response ID for context tracking
    const result = {
      ...(response.content as Record<string, unknown>),
      responseId: response.responseId,
    }

    console.log('[assess-intent] Final result:', result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[assess-intent] Error:', error)

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
          error: 'Failed to assess intent',
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
