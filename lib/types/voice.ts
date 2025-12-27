// Voice Reading Mode Types for OpenAI Realtime API Integration

import type { CardDraw, SpreadSelection } from '@/types'

// ===========================
// Voice Agent Types
// ===========================

/**
 * Available voice agent names in the reading flow
 * Each agent handles a specific phase of the reading
 */
export type VoiceAgentName =
  | 'IntentAssessmentAgent'
  | 'SpreadGenerationAgent'
  | 'ReadingAgent'
  | 'FollowupAgent'

/**
 * User-friendly labels for each agent
 */
export const AGENT_LABELS: Record<VoiceAgentName, string> = {
  IntentAssessmentAgent: 'Intent Assessment',
  SpreadGenerationAgent: 'Spread Generation',
  ReadingAgent: 'Reading',
  FollowupAgent: 'Follow-up Questions',
}

// ===========================
// Connection Status Types
// ===========================

/**
 * WebRTC connection status for voice session
 */
export type VoiceConnectionStatus =
  | 'disconnected'  // Not connected
  | 'connecting'    // Establishing connection
  | 'connected'     // Active voice session
  | 'error'         // Connection failed

// ===========================
// Transcript Types
// ===========================

/**
 * A single message in the voice transcript
 */
export interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentName?: VoiceAgentName  // Which agent spoke (for assistant messages)
}

// ===========================
// Card Interaction Types
// ===========================

/**
 * Request for user to draw a card
 * Used by draw_card tool to communicate with UI
 */
export interface CardDrawRequest {
  positionLabel: string      // e.g., "Past", "Present", "Future"
  promptRole: string         // What this position represents
  cardNumber: number         // Current card number (1-based, e.g., 1, 2, 3)
  totalCards: number         // Total number of cards to draw in this reading
  resolve: (card: DrawnCard) => void   // Callback when user selects card
  reject: (error: Error) => void       // Callback on error
}

/**
 * Result of a card draw (returned by UI to tool)
 */
export interface DrawnCard {
  cardId: string
  cardName: string
  reversed: boolean
}

/**
 * Request to display a card on screen
 * Used by show_card tool
 */
export interface CardDisplayRequest {
  cardId: string
  reversed: boolean
}

/**
 * Card reveal state for full-screen card display
 */
export interface CardRevealState {
  cardId: string
  cardName: string
  reversed: boolean
  positionLabel: string
  positionIndex: number
  totalPositions: number
  isVisible: boolean
}

// ===========================
// Audio State Types
// ===========================

/**
 * Audio state for push-to-talk and voice activity
 */
export interface VoiceAudioState {
  isListening: boolean      // User is speaking
  isSpeaking: boolean       // AI is speaking
  isMuted: boolean          // Microphone is muted
}

// ===========================
// Intent Data Types
// ===========================

/**
 * Intent data collected by Intent Assessment Agent
 */
export interface VoiceIntentData {
  summary?: string          // Intent summary
  hiddenConcern?: string    // Deeper concern identified
  topic?: string            // Topic category
  timeframe?: string        // Timeframe (past, present, future)
}

// ===========================
// Voice Reading State
// ===========================

/**
 * Complete state for voice reading session
 */
export interface VoiceReadingState {
  // Connection
  connectionStatus: VoiceConnectionStatus
  sessionId: string | null
  error: string | null

  // Agent tracking
  currentAgentName: VoiceAgentName

  // Reading data
  intentData: VoiceIntentData
  spread: SpreadSelection | null
  drawnCards: CardDraw[]
  shuffledDeck: string[]  // Persistent deck across card draws

  // Audio state
  audioState: VoiceAudioState

  // Transcript
  transcriptMessages: TranscriptMessage[]
  showTranscript: boolean

  // Card interaction
  cardDrawRequest: CardDrawRequest | null
  currentlyDisplayedCard: CardDisplayRequest | null
  cardReveal: CardRevealState | null

  // Ritual phase
  showRitual: boolean
  showShuffling: boolean

  // Card drawing flow (batch mode)
  currentCardDrawIndex: number  // Track which card we're drawing (0-based, -1 = not started)

  // Session metadata
  sessionStartTime: Date | null
  sessionDuration: number  // in seconds
}

// ===========================
// Tool Result Types
// ===========================

/**
 * Result returned by draw_card tool to agent (legacy)
 * @deprecated Use DrawCardsToolResult for batch mode
 */
export interface DrawCardToolResult {
  cardId: string
  cardName: string
  reversed: boolean
}

/**
 * Result returned by draw_cards tool to agent (batch mode)
 */
export interface DrawCardsToolResult {
  status: 'started'
  totalCards: number
  message: string
}

/**
 * Result returned by show_card tool to agent
 */
export interface ShowCardToolResult {
  success: boolean
  cardId: string
  reversed: boolean
}

/**
 * Result returned by start_ritual tool to agent
 */
export interface StartRitualToolResult {
  success: boolean
  message: string
}

/**
 * Result returned by wait_for_ritual tool to agent
 */
export interface WaitForRitualToolResult {
  success: boolean
  message: string
  wasAlreadyComplete: boolean
}

// ===========================
// Voice Session Events
// ===========================

/**
 * Events that can occur during voice session
 */
export type VoiceSessionEvent =
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'agent_handoff'; fromAgent: VoiceAgentName; toAgent: VoiceAgentName }
  | { type: 'tool_execution'; toolName: 'draw_card' | 'show_card' | 'start_ritual'; success: boolean }
  | { type: 'user_speaking_start' }
  | { type: 'user_speaking_end' }
  | { type: 'assistant_speaking_start' }
  | { type: 'assistant_speaking_end' }
  | { type: 'transcript_message'; message: TranscriptMessage }
  | { type: 'error'; error: string }

// ===========================
// Voice Configuration
// ===========================

/**
 * Configuration for voice session
 */
export interface VoiceSessionConfig {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  model: string  // e.g., 'gpt-4o-realtime-preview'
  maxSessionDuration: number  // in seconds
  turnDetection?: {
    silenceThreshold?: number
    type: 'server_vad' | 'none'
  }
}

// ===========================
// Type Guards
// ===========================

/**
 * Check if agent is an intent assessment agent
 */
export function isIntentAgent(agentName: VoiceAgentName): boolean {
  return agentName === 'IntentAssessmentAgent'
}

/**
 * Check if agent is a spread generation agent
 */
export function isSpreadAgent(agentName: VoiceAgentName): boolean {
  return agentName === 'SpreadGenerationAgent'
}

/**
 * Check if agent is a reading agent
 */
export function isReadingAgent(agentName: VoiceAgentName): boolean {
  return agentName === 'ReadingAgent'
}

/**
 * Check if agent is a followup agent
 */
export function isFollowupAgent(agentName: VoiceAgentName): boolean {
  return agentName === 'FollowupAgent'
}

/**
 * Check if agent can use draw_card tool
 */
export function canDrawCards(agentName: VoiceAgentName): boolean {
  return agentName === 'SpreadGenerationAgent' || agentName === 'FollowupAgent'
}

/**
 * Check if agent can use show_card tool
 */
export function canShowCards(agentName: VoiceAgentName): boolean {
  return agentName === 'ReadingAgent' || agentName === 'FollowupAgent'
}
