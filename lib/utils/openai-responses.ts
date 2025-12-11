import { OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_CONFIG } from '@/lib/config/openai'

/**
 * Parses the OpenAI Responses API payload and extracts all assistant output_text values.
 * Matches Flutter's extractAssistantOutputText function.
 */
export function extractAssistantOutputText(response: any): string {
  if (!response || typeof response !== 'object') return ''

  const output = response.output
  if (!Array.isArray(output)) return ''

  const results: string[] = []

  for (const item of output) {
    if (typeof item !== 'object' || !item) continue
    if (item.type !== 'message' || item.role !== 'assistant') continue

    const content = item.content
    if (!Array.isArray(content)) continue

    for (const block of content) {
      if (typeof block !== 'object' || !block) continue
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
 * Calls OpenAI Responses API with the given parameters.
 * Matches Flutter's createResponseWithFormat function.
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
  // Prepare request data for Responses API (matching Flutter implementation)
  const requestData: any = {
    model: OPENAI_CONFIG.model,
    input,
    prompt: {
      id: promptId,
    },
  }

  // Add previous response ID for context if available
  if (previousResponseId) {
    requestData.previous_response_id = previousResponseId
  }

  console.log('[OpenAI Responses API] Request:', requestData)

  // Call OpenAI Responses API
  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('[OpenAI Responses API] Error:', errorData)
    throw new Error(errorData.error?.message || 'OpenAI API request failed')
  }

  const responseData = await response.json()

  console.log('[OpenAI Responses API] Response:', responseData)

  // Check for refusal (safety-related model refusals)
  if (responseData.refusal) {
    throw new Error(`Model refused to respond: ${responseData.refusal}`)
  }

  // Extract assistant output text from response
  const content = extractAssistantOutputText(responseData)

  if (!content) {
    throw new Error('No content in OpenAI response')
  }

  return {
    content,
    responseId: responseData.id || '',
  }
}
