import OpenAI from 'openai'

// Validate that required environment variables are set
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'OPENAI_PROMPT_INTENT_ID',
  'OPENAI_PROMPT_SPREAD_ID',
  'OPENAI_PROMPT_READING_ID',
  'OPENAI_PROMPT_EXPLANATION_ID',
  'OPENAI_PROMPT_CLARIFICATION_ID',
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// OpenAI base URL and API key
export const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

// Create OpenAI client instance for all API interactions
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
})

// Export prompt IDs for easy access (these are stored prompt IDs in OpenAI)
export const PROMPTS = {
  INTENT: process.env.OPENAI_PROMPT_INTENT_ID!,
  SPREAD: process.env.OPENAI_PROMPT_SPREAD_ID!,
  READING: process.env.OPENAI_PROMPT_READING_ID!,
  EXPLANATION: process.env.OPENAI_PROMPT_EXPLANATION_ID!,
  CLARIFICATION: process.env.OPENAI_PROMPT_CLARIFICATION_ID!,
} as const

// OpenAI model configuration (matching Flutter app exactly)
export const OPENAI_CONFIG = {
  model: 'gpt-5-mini', // Matching Flutter app's model
  maxTokens: 2000,
} as const
