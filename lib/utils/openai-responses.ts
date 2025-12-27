import { openai, OPENAI_CONFIG } from '@/lib/config/openai'
import OpenAI from 'openai'

/**
 * Extracts assistant output text from OpenAI Responses API response.
 * Uses SDK's typed response structure to safely access content.
 */
function extractAssistantOutputText(response: OpenAI.Responses.Response): string {
  if (!response.output || !Array.isArray(response.output)) {
    return ''
  }

  const results: string[] = []

  for (const item of response.output) {
    if (item.type !== 'message' || item.role !== 'assistant') continue

    const content = item.content
    if (!Array.isArray(content)) continue

    for (const block of content) {
      if (block.type !== 'output_text') continue

      const text = block.text
      if (typeof text === 'string' && text.length > 0) {
        results.push(text)
      }
    }
  }

  return results.length > 0 ? results.join('') : ''
}

/**
 * Calls OpenAI Responses API using the official OpenAI SDK.
 *
 * Uses stored prompts from OpenAI platform and supports conversation continuity
 * via previousResponseId parameter.
 *
 * @param input - User input text
 * @param promptId - OpenAI stored prompt ID
 * @param previousResponseId - Optional response ID from previous turn for context
 * @returns Object containing extracted content and response ID
 * @throws Error if API call fails or response is empty
 */
export async function callOpenAIResponsesAPI({
  input,
  promptId,
  previousResponseId,
}: {
  input: string
  promptId: string
  previousResponseId?: string
}): Promise<{ content: string; responseId: string }> {
  try {
    // Prepare request parameters for Responses API
    const requestParams: OpenAI.Responses.ResponseCreateParams = {
      model: OPENAI_CONFIG.model,
      input,
      prompt: {
        id: promptId,
      },
    }

    // Add previous response ID for conversation continuity if provided
    if (previousResponseId) {
      requestParams.previous_response_id = previousResponseId
    }

    console.log('[OpenAI Responses API] Request:', requestParams)

    // Call OpenAI Responses API using SDK
    const response = await openai.responses.create(requestParams)

    console.log('[OpenAI Responses API] Response:', response)

    // Extract assistant output text from SDK response
    const content = extractAssistantOutputText(response)

    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    return {
      content,
      responseId: response.id || '',
    }
  } catch (error) {
    // Handle OpenAI SDK errors
    if (error instanceof OpenAI.APIError) {
      console.error('[OpenAI Responses API] APIError:', {
        status: error.status,
        message: error.message,
        type: error.type,
        code: error.code,
      })
      throw new Error(error.message || 'OpenAI API request failed')
    }

    // Re-throw other errors
    console.error('[OpenAI Responses API] Error:', error)
    throw error
  }
}
