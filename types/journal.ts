// Journal Types for Next.js Tarot App

import type { ChatMessage } from './reading'

// ===========================
// Journal Entry
// ===========================

export interface JournalEntry {
  id: string
  intention: string
  topic?: string
  deckSeed: string
  createdAt: Date
  messagesJson: ChatMessage[] // Stored as JSONB in PostgreSQL
  cardIds?: string[]          // Optional: extracted for fast queries
  messageCount?: number       // Optional: for display
}

// ===========================
// Journal API Types
// ===========================

export interface CreateJournalEntryInput {
  intention: string
  topic?: string
  deckSeed: string
  messages: ChatMessage[]
  cardIds?: string[]
}

export interface UpdateJournalEntryInput {
  intention?: string
  topic?: string
}

export interface JournalEntryListItem {
  id: string
  intention: string
  topic?: string
  createdAt: Date
  messageCount: number
}
