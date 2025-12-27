import { NextRequest, NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/config/openai'
import { GenerateSpreadRequestSchema } from '@/lib/schemas/aiSchemas'
import { llmProvider } from '@/lib/config/llm-provider'
import { SPREAD_PROMPT } from '@/lib/prompts/spread-prompt'
import { ZodError } from 'zod'

/**
 * POST /api/ai/generate-spread
 *
 * Generates a tarot spread selection based on the user's intention.
 * Returns spread configuration with positions and their roles.
 * Uses LLM provider abstraction (supports OpenAI and Xai).
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

    // Call LLM provider with both prompt formats (provider picks what it needs)
    const response = await llmProvider.callAPI({
      input: inputMessage,
      promptId: PROMPTS.SPREAD, // For OpenAI (stored prompt)
      promptDefinition: SPREAD_PROMPT, // For Xai (in-code prompt)
    })

    // Response is already validated and parsed by provider
    const spreadData = response.content as {
      spreadType: string
      spreadDescription: string
      reasoning: string
      positions: Array<{
        key: string
        label: string
        promptRole: string
      }>
    }

    // Wrap in the expected format for the API response
    const result = {
      success: true,
      spread: spreadData,
      responseId: response.responseId,
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
