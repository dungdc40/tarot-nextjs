import OpenAI from 'openai'
import type { PromptDefinition, LLMProviderConfig, LLMResponse } from '@/lib/types/prompts'

/**
 * Parameters for calling Xai Responses API.
 */
interface XaiCallParams {
  /**
   * User input text.
   */
  input: string

  /**
   * In-code prompt definition with system prompt and JSON schema.
   */
  promptDefinition: PromptDefinition

  /**
   * Optional previous response ID for conversation context.
   */
  previousResponseId?: string

  /**
   * Optional additional context data to include in the request.
   */
  additionalContext?: Record<string, unknown>

  /**
   * Provider configuration (API key, base URL, timeout, model).
   */
  config: LLMProviderConfig
}

/**
 * Extracts assistant output text from Responses API response.
 * Uses SDK's typed response structure to safely access content.
 * Same logic as OpenAI's extractAssistantOutputText for consistency.
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
 * Calls Xai API using Responses API with Xai-specific configuration.
 *
 * Xai uses the same OpenAI SDK but with different base URL (https://api.x.ai/v1).
 * System prompts are passed as messages in the input array (not via `instructions` parameter).
 *
 * Key differences from OpenAI:
 * - Base URL: https://api.x.ai/v1
 * - Extended timeout: 360000ms (6 minutes) for reasoning models
 * - System prompt passed in input array (xAI doesn't support `instructions` with `previous_response_id`)
 * - Uses Responses API with messages array instead of stored prompts
 * - JSON schema support via `text.format` parameter
 *
 * @param params - Call parameters including input, prompt definition, and config
 * @returns Promise resolving to normalized LLM response
 * @throws Error if API call fails, response is empty, or validation fails
 */
export async function callXaiResponsesAPI(params: XaiCallParams): Promise<LLMResponse> {
  const { input, promptDefinition, previousResponseId, additionalContext, config } = params

  // Retry logic: attempt up to 2 times (initial + 1 retry)
  let lastError: Error | null = null
  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Xai Responses API] Attempt ${attempt}/${maxAttempts}`)

      // Create Xai client with extended timeout for reasoning models
      const xai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        timeout: config.timeout || 360000, // Default 6 minutes for reasoning models
      })

      // Construct user input with optional additional context
      let userInput = input
      if (additionalContext) {
        // Append structured context to user input
        userInput += '\n\nAdditional context:\n' + JSON.stringify(additionalContext, null, 2)
      }

      // Prepare input messages array with system prompt
      // xAI requires system message to be included in input array, not instructions parameter
      // (instructions cannot be used together with previous_response_id)
      const inputMessages: OpenAI.Responses.ResponseCreateParams['input'] = [
        {
          role: 'system',
          content: promptDefinition.systemPrompt,
        },
        {
          role: 'user',
          content: userInput,
        },
      ]

      // Prepare request parameters for Responses API
      const requestParams: OpenAI.Responses.ResponseCreateParams = {
        model: config.model || 'grok-2-latest',
        input: inputMessages,
        ...(promptDefinition.jsonSchema
          ? {
              text: {
                format: {
                  type: 'json_schema',
                  name: 'response',
                  schema: promptDefinition.jsonSchema,
                  strict: true,
                },
              },
            }
          : {}),
      }

      // Add previous response ID for conversation continuity if provided
      if (previousResponseId) {
        requestParams.previous_response_id = previousResponseId
      }

      console.log('[Xai Responses API] Request:', {
        model: requestParams.model,
        inputLength: userInput.length,
        hasJsonSchema: !!promptDefinition.jsonSchema,
        hasContext: !!additionalContext,
        hasPreviousResponse: !!previousResponseId,
      })

      // Call Xai Responses API using SDK (same as OpenAI)
      const response = await xai.responses.create(requestParams)

      console.log('[Xai Responses API] Response received:', {
        responseId: response.id,
      })

      // Extract assistant output text from SDK response (same logic as OpenAI)
      const rawContent = extractAssistantOutputText(response)

      if (!rawContent) {
        throw new Error('No content in Xai response')
      }

      // For raw text responses (no JSON schema), return content as-is
      if (!promptDefinition.jsonSchema || !promptDefinition.validator) {
        console.log(`[Xai Responses API] Success on attempt ${attempt} (raw text)`)
        return {
          content: rawContent,
          responseId: response.id || '',
          rawContent,
        }
      }

      // Parse JSON response
      let content: unknown
      try {
        content = JSON.parse(rawContent)
      } catch (parseError) {
        const error = new Error(
          `Failed to parse Xai response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}\nRaw content: ${rawContent.substring(0, 200)}...`
        )
        console.error(`[Xai Responses API] JSON parse error on attempt ${attempt}:`, error.message)

        // If this is the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw error
        }

        // Otherwise, continue to retry
        lastError = error
        continue
      }

      // Validate response against Zod schema
      const validationResult = promptDefinition.validator.safeParse(content)
      if (!validationResult.success) {
        const error = new Error(
          `Xai response failed validation: ${validationResult.error.message}\n` +
            `Raw content: ${rawContent.substring(0, 200)}...`
        )
        console.error(`[Xai Responses API] Validation error on attempt ${attempt}:`, error.message)

        // If this is the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw error
        }

        // Otherwise, continue to retry
        lastError = error
        continue
      }

      // Success - return the validated response
      console.log(`[Xai Responses API] Success on attempt ${attempt}`)
      return {
        content: validationResult.data,
        responseId: response.id || '',
        rawContent,
      }
    } catch (error) {
      // Handle OpenAI SDK errors (Xai uses same SDK)
      if (error instanceof OpenAI.APIError) {
        console.error('[Xai Responses API] APIError:', {
          status: error.status,
          message: error.message,
          type: error.type,
          code: error.code,
        })
        const apiError = new Error(
          `Xai API request failed: ${error.message || 'Unknown error'}. ` +
            `Status: ${error.status || 'unknown'}. ` +
            `Check your XAI_API_KEY and ensure Xai service is available.`
        )
        lastError = apiError

        // API errors should not be retried in most cases
        throw apiError
      }

      // Store other errors
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[Xai Responses API] Error on attempt ${attempt}:`, lastError.message)

      // If this is the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw new Error(`Xai API call failed: ${lastError.message}`)
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Unknown error occurred')
}
