import { z } from 'zod'

/**
 * JSON Schema definition for structured LLM outputs.
 * Follows JSON Schema specification for OpenAI structured outputs.
 */
export interface JSONSchema {
  type: string
  properties?: Record<string, JSONSchema | { type: string; description?: string; items?: JSONSchema }>
  required?: string[]
  items?: JSONSchema
  description?: string
  enum?: string[]
  additionalProperties?: boolean
  [key: string]: unknown // Index signature for OpenAI SDK compatibility
}

/**
 * Complete prompt definition for in-code prompts (used by Xai and other providers
 * that don't support stored prompts).
 *
 * Each prompt definition includes:
 * - System prompt: Instructions for the AI
 * - JSON schema: Expected response structure (optional, omit for raw text responses)
 * - Validator: Runtime validation using Zod (optional, omit for raw text responses)
 */
export interface PromptDefinition<T = unknown> {
  /**
   * System prompt with AI instructions and response format requirements.
   */
  systemPrompt: string

  /**
   * JSON Schema defining the expected response structure.
   * Used for OpenAI structured outputs and response validation.
   * If omitted, the response is expected to be raw text.
   */
  jsonSchema?: JSONSchema

  /**
   * Zod schema for runtime response validation.
   * Should match the JSON schema structure.
   * If omitted, the response is returned as raw text without validation.
   */
  validator?: z.ZodSchema<T>
}

/**
 * Configuration for a specific LLM provider (OpenAI, Xai, etc.).
 */
export interface LLMProviderConfig {
  /**
   * Provider name identifier.
   */
  name: 'openai' | 'xai'

  /**
   * API key for authentication.
   */
  apiKey: string

  /**
   * Base URL for the provider's API.
   */
  baseURL: string

  /**
   * Request timeout in milliseconds.
   * Xai reasoning models may need longer timeouts (e.g., 360000ms).
   */
  timeout?: number

  /**
   * Default model to use for API calls.
   */
  model?: string
}

/**
 * Normalized response from any LLM provider.
 * Provider implementations must transform their responses to this format.
 */
export interface LLMResponse<T = unknown> {
  /**
   * Parsed and validated response content.
   */
  content: T

  /**
   * Response ID for tracking conversation context.
   * Used with previousResponseId for multi-turn conversations.
   */
  responseId: string

  /**
   * Raw content string (before parsing).
   * Useful for debugging and logging.
   */
  rawContent: string
}

/**
 * Parameters for making an LLM API call through the provider abstraction.
 */
export interface LLMCallParams {
  /**
   * User input text to send to the LLM.
   */
  input: string

  /**
   * OpenAI stored prompt ID (used by OpenAIProvider).
   * Ignored by providers that don't support stored prompts.
   */
  promptId?: string

  /**
   * In-code prompt definition (used by XaiProvider and similar).
   * Ignored by providers that support stored prompts.
   */
  promptDefinition?: PromptDefinition

  /**
   * Previous response ID for conversation context tracking.
   * Enables multi-turn conversations with context.
   */
  previousResponseId?: string

  /**
   * Additional structured data to include in the request.
   * Used for passing cards, intent summaries, etc.
   */
  additionalContext?: Record<string, unknown>
}

/**
 * Interface that all LLM providers must implement.
 * Provides a unified API for making LLM calls regardless of provider.
 */
export interface LLMProvider {
  /**
   * Provider configuration.
   */
  readonly config: LLMProviderConfig

  /**
   * Make an API call to the LLM provider.
   *
   * @param params - Call parameters including input, prompts, and context
   * @returns Promise resolving to normalized LLM response
   * @throws Error if API call fails or response is invalid
   */
  callAPI(params: LLMCallParams): Promise<LLMResponse>
}
