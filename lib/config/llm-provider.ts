import OpenAI from 'openai'
import type {
  LLMProvider,
  LLMProviderConfig,
  LLMCallParams,
  LLMResponse,
} from '@/lib/types/prompts'
import { callOpenAIResponsesAPI } from '@/lib/utils/openai-responses'
import { callXaiResponsesAPI } from '@/lib/utils/xai-responses'

/**
 * OpenAI provider implementation.
 * Uses OpenAI's stored prompts feature (prompts referenced by ID).
 */
export class OpenAIProvider implements LLMProvider {
  readonly config: LLMProviderConfig

  constructor(config: LLMProviderConfig) {
    this.config = config
  }

  async callAPI(params: LLMCallParams): Promise<LLMResponse> {
    const { input, promptId, previousResponseId } = params

    if (!promptId) {
      throw new Error('OpenAIProvider requires promptId parameter')
    }

    // Retry logic: attempt up to 2 times (initial + 1 retry)
    let lastError: Error | null = null
    const maxAttempts = 2

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[OpenAIProvider] Attempt ${attempt}/${maxAttempts}`)

        // Call existing OpenAI Responses API utility
        const result = await callOpenAIResponsesAPI({
          input,
          promptId,
          previousResponseId,
        })

        // All OpenAI responses are expected to be JSON
        let content: unknown
        try {
          content = JSON.parse(result.content)
        } catch (parseError) {
          const error = new Error(
            `Failed to parse OpenAI response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
          )
          console.error(`[OpenAIProvider] JSON parse error on attempt ${attempt}:`, error.message)

          // If this is the last attempt, throw the error
          if (attempt === maxAttempts) {
            throw error
          }

          // Otherwise, continue to retry
          lastError = error
          continue
        }

        // Success - return the response
        console.log(`[OpenAIProvider] Success on attempt ${attempt}`)
        return {
          content,
          responseId: result.responseId,
          rawContent: result.content,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`[OpenAIProvider] Error on attempt ${attempt}:`, lastError.message)

        // If this is the last attempt or it's not a parse error, throw
        if (attempt === maxAttempts) {
          throw lastError
        }
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Unknown error occurred')
  }
}

/**
 * Xai provider implementation.
 * Uses in-code prompt definitions (no stored prompts support).
 */
export class XaiProvider implements LLMProvider {
  readonly config: LLMProviderConfig

  constructor(config: LLMProviderConfig) {
    this.config = config
  }

  async callAPI(params: LLMCallParams): Promise<LLMResponse> {
    const { input, promptDefinition, previousResponseId, additionalContext } = params

    if (!promptDefinition) {
      throw new Error('XaiProvider requires promptDefinition parameter')
    }

    // Call Xai Responses API utility with in-code prompt
    const result = await callXaiResponsesAPI({
      input,
      promptDefinition,
      previousResponseId,
      additionalContext,
      config: this.config,
    })

    return result
  }
}

/**
 * Factory function to create the appropriate LLM provider based on environment configuration.
 *
 * Provider selection is determined by LLM_PROVIDER environment variable:
 * - 'openai' (default): Use OpenAI with stored prompts
 * - 'xai': Use Xai with in-code prompts
 *
 * @returns LLMProvider instance (OpenAIProvider or XaiProvider)
 * @throws Error if provider is invalid or required configuration is missing
 */
export function createLLMProvider(): LLMProvider {
  const providerName = (process.env.LLM_PROVIDER || 'openai').toLowerCase()

  switch (providerName) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('Missing required environment variable: OPENAI_API_KEY')
      }

      // Validate OpenAI stored prompt IDs are configured
      const requiredPromptIds = [
        'OPENAI_PROMPT_INTENT_ID',
        'OPENAI_PROMPT_SPREAD_ID',
        'OPENAI_PROMPT_READING_ID',
        'OPENAI_PROMPT_EXPLANATION_ID',
        'OPENAI_PROMPT_CLARIFICATION_ID',
      ]

      for (const promptId of requiredPromptIds) {
        if (!process.env[promptId]) {
          throw new Error(
            `Missing required environment variable for OpenAI: ${promptId}. ` +
              `OpenAI provider requires stored prompt IDs.`
          )
        }
      }

      const config: LLMProviderConfig = {
        name: 'openai',
        apiKey,
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        timeout: process.env.OPENAI_TIMEOUT_MS
          ? parseInt(process.env.OPENAI_TIMEOUT_MS, 10)
          : undefined,
      }

      return new OpenAIProvider(config)
    }

    case 'xai': {
      const apiKey = process.env.XAI_API_KEY
      if (!apiKey) {
        throw new Error(
          'Missing required environment variable: XAI_API_KEY. ' +
            'Set XAI_API_KEY in your environment when using LLM_PROVIDER=xai'
        )
      }

      const config: LLMProviderConfig = {
        name: 'xai',
        apiKey,
        baseURL: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
        model: process.env.XAI_MODEL || 'grok-2-latest',
        // Xai reasoning models need extended timeout (360s = 6 minutes)
        timeout: process.env.XAI_TIMEOUT_MS
          ? parseInt(process.env.XAI_TIMEOUT_MS, 10)
          : 360000,
      }

      return new XaiProvider(config)
    }

    default:
      throw new Error(
        `Invalid LLM_PROVIDER: "${providerName}". Valid options are: "openai", "xai". ` +
          `Check your LLM_PROVIDER environment variable.`
      )
  }
}

/**
 * Singleton LLM provider instance.
 * Created once at startup based on LLM_PROVIDER environment variable.
 *
 * All API routes should use this instance for LLM calls.
 */
export const llmProvider = createLLMProvider()

/**
 * Get the current provider name for logging/debugging.
 */
export function getProviderName(): string {
  return llmProvider.config.name
}
