import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { RequestExplanationRequestSchema } from '@/lib/schemas/aiSchemas'
import { callOpenAIResponsesAPI } from '@/lib/utils/openai-responses'
import { ZodError } from 'zod'

/**
 * POST /api/ai/request-explanation
 *
 * Requests an explanation for highlighted text from a previous reading.
 * Uses the previous response ID for context continuity.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { highlightedText, responseId } = RequestExplanationRequestSchema.parse(body)

    console.log('[request-explanation] Request:', { highlightedText, responseId })

    // Prepare input message
    const inputMessage = JSON.stringify({
      highlightedText,
    })

    // Call OpenAI Responses API with previous response ID for context
    const { content, responseId: newResponseId } = await callOpenAIResponsesAPI({
      input: inputMessage,
      promptId: PROMPTS.EXPLANATION,
      previousResponseId: responseId,
    })

    // Return response with metadata
    const result = {
      content,
      responseId: newResponseId,
    }

    console.log('[request-explanation] Response generated successfully')

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[request-explanation] Error:', error)

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
          error: 'Failed to generate explanation',
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
