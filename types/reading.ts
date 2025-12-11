// Reading Flow Types for Next.js Tarot App

// ===========================
// Chat Session Types
// ===========================

export interface ChatSession {
  intention: string
  topic?: string
  deckSeed: string
  messages: ChatMessage[]
  selectedCards: Map<number, string> // positionIndex -> cardId
  createdAt: Date
}

// Message data can be one of 4 types (discriminated union)
export type MessageData =
  | string
  | CardDraw
  | ReadingMainData
  | ExplanationMessageData

export interface ChatMessage {
  data: MessageData
  isUser: boolean
  timestamp: Date
  responseId?: string
  lastResponseId?: string
}

// ===========================
// Card Types
// ===========================

export interface CardDraw {
  cardId: string
  name: string
  reversed: boolean
  drawIndex: number
  label: string          // Position label (e.g., "Past influences")
  promptRole: string     // Position description for AI
  interpretation: string // AI interpretation for this card
  generalMeaning: string // General card meaning
}

// ===========================
// Reading Data Types
// ===========================

export interface ReadingMainData {
  interpretation: string      // Overall spread synthesis
  cards: CardDraw[]           // Cards with individual interpretations
  advice: string              // Practical advice
}

export interface ExplanationMessageData {
  originalText: string        // Text user asked about
  explanation: string         // AI's explanation
}

// ===========================
// Intent Assessment Types
// ===========================

export interface IntentAssessment {
  intentStatus: 'clear' | 'unclear'
  assistantMessage?: string
  intentSummary?: string
  topic?: string
  timeframe?: string
  confidence?: number
  responseId?: string
}

export interface IntentSubmitResult {
  needsCards?: boolean
  cardsNeeded?: number
  isFinalAnswer?: boolean
}

// ===========================
// Spread Types
// ===========================

export interface SpreadSelection {
  spreadType: string
  spreadDescription: string
  positions: CardDraw[]       // Placeholder cards with label/promptRole
  reasoning?: string
}

export interface SpreadPosition {
  key: string
  label: string
  promptRole: string
  draw?: CardDraw
}

// ===========================
// Reading Flow State Machine
// ===========================

export type ReadingFlowState =
  | { type: 'idle' }
  | { type: 'intentCollecting' }
  | { type: 'ritualPreparing' }
  | { type: 'shuffling' }
  | { type: 'picking'; currentPositionIndex: number }
  | { type: 'cardRevealing'; cardId: string; currentPositionIndex: number }
  | { type: 'waitingBeforeReading' }
  | { type: 'reading' }
  | { type: 'followUps' }
  | { type: 'clarificationPicking'; currentPositionIndex: number }
  | { type: 'clarificationCardRevealing'; cardId: string; currentPositionIndex: number }
  | { type: 'clarificationProcessing' }
  | { type: 'closed' }

// ===========================
// API Response Types
// ===========================

export interface ChatResponse {
  content: string
  responseId: string
}

export interface ReadingResponse {
  messageData: {
    synthesis?: string
    advice?: string
    cards?: Array<{
      cardId: string
      interpretation: string
    }>
  }
  responseId: string
}

export interface SpreadSelectionResult {
  success: boolean
  spread?: SpreadSelection
  error?: string
  isComplete?: boolean
}

export interface ClarificationResult {
  message: string
  cards: CardDraw[]
  isFinalAnswer: boolean
  responseId: string
}

// ===========================
// Type Guards
// ===========================

export function isCardDraw(data: MessageData): data is CardDraw {
  return typeof data === 'object' && 'cardId' in data && 'name' in data
}

export function isReadingMainData(data: MessageData): data is ReadingMainData {
  return typeof data === 'object' && 'interpretation' in data && 'cards' in data && 'advice' in data
}

export function isExplanationMessageData(data: MessageData): data is ExplanationMessageData {
  return typeof data === 'object' && 'originalText' in data && 'explanation' in data
}

export function isStringMessage(data: MessageData): data is string {
  return typeof data === 'string'
}
