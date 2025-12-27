import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { RequestExplanationRequestSchema } from '@/lib/schemas/aiSchemas'
import { llmProvider } from '@/lib/config/llm-provider'
import { EXPLANATION_PROMPT, type ExplanationResult } from '@/lib/prompts/explanation-prompt'
import { ZodError } from 'zod'

/**
 * POST /api/ai/request-explanation
 *
 * Requests an explanation for highlighted text from a previous reading.
 * Uses the previous response ID for context continuity.
 * Uses LLM provider abstraction (supports OpenAI and Xai).
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

    // Call LLM provider with both prompt formats (provider picks what it needs)
    const response = await llmProvider.callAPI({
      input: inputMessage,
      promptId: PROMPTS.EXPLANATION, // For OpenAI (stored prompt)
      promptDefinition: EXPLANATION_PROMPT, // For Xai (in-code prompt)
      previousResponseId: responseId,
    })

    // Parse JSON response to get explanation
    const explanationData = response.content as ExplanationResult

    // Return response with metadata (content is explanation string from JSON)
    const result = {
      content: explanationData.explanation,
      responseId: response.responseId,
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
