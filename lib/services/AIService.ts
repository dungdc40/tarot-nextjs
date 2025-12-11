import type {
  IntentAssessment,
  SpreadSelectionResult,
  ChatResponse,
  ReadingResponse,
  ClarificationResult,
  CardDraw,
} from '@/types'

/**
 * Client-side wrapper for AI API endpoints.
 *
 * Provides type-safe methods for interacting with the OpenAI-powered
 * tarot reading features.
 */
export class AIService {
  private baseUrl: string

  constructor(baseUrl: string = '/api/ai') {
    this.baseUrl = baseUrl
  }

  /**
   * Assess the clarity of a user's intention.
   * Returns either a clear intent summary or a clarification question.
   */
  async assessIntent({
    userMessage,
    previousResponseId,
  }: {
    userMessage: string
    previousResponseId?: string
  }): Promise<IntentAssessment> {
    const response = await fetch(`${this.baseUrl}/assess-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        previousResponseId,
      }),
    })
    console.log('client response')
    console.log(response)

    if (!response.ok) {
      const errorData = await response.json()
      const error: any = new Error(errorData.message || 'Failed to assess intent')
      error.status = response.status
      throw error
    }

    return response.json()
  }

  /**
   * Generate a spread selection based on the user's intention.
   */
  async generateSpreadSelection({
    intentSummary,
    timeframe,
  }: {
    intentSummary: string
    timeframe?: string
  }): Promise<SpreadSelectionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-spread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intentSummary,
          timeframe,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const error: any = new Error(errorData.error || 'Failed to generate spread selection')
        error.status = response.status
        throw error
      }

      return response.json()
    } catch (error: any) {
      console.error('Error generating spread selection:', error)
      // Re-throw to preserve status code for 5xx error detection
      throw error
    }
  }

  /**
   * Generate a complete reading interpretation based on intention and cards.
   */
  async generateReading(
    intentSummary: string,
    cards: Array<{
      cardId: string
      card: string
      reversed: boolean
      promptRole: string
      label: string
    }>
  ): Promise<ReadingResponse> {
    const cardsData = cards.map((card) => ({
      cardId: card.cardId,
      card: card.card,
      reversed: card.reversed,
      promptRole: card.promptRole,
      label: card.label,
    }))

    const response = await fetch(`${this.baseUrl}/generate-reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intentSummary,
        cards: cardsData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error: any = new Error(errorData.message || 'Failed to generate reading')
      error.status = response.status
      throw error
    }

    return response.json()
  }

  /**
   * Request an explanation for highlighted text from a reading.
   */
  async requestExplanation({
    highlightedText,
    responseId,
  }: {
    highlightedText: string
    responseId: string
  }): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/request-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        highlightedText,
        responseId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error: any = new Error(errorData.message || 'Failed to request explanation')
      error.status = response.status
      throw error
    }

    return response.json()
  }

  /**
   * Handle a clarification question during reading follow-up.
   */
  async handleClarification(
    question: string,
    cards: Array<{
      cardId: string
      name: string
      reversed: boolean
      promptRole: string
      label: string
    }>,
    previousResponseId?: string
  ): Promise<ClarificationResult> {
    const clarificationCards = cards.map((card) => ({
      cardId: card.cardId,
      name: card.name,
      reversed: card.reversed,
      promptRole: card.promptRole,
      label: card.label,
    }))

    const response = await fetch(`${this.baseUrl}/handle-clarification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clarificationQuestion: question,
        cards: clarificationCards,
        previousResponseId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error: any = new Error(errorData.message || 'Failed to handle clarification')
      error.status = response.status
      throw error
    }

    return response.json()
  }
}

// Create singleton instance
export const aiService = new AIService()
