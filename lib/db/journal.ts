import { prisma } from './prisma'
import type { JournalEntry, ChatSession } from '@/types'

/**
 * Save a journal entry to the database.
 * Converts ChatSession to JSONB format.
 */
export async function saveJournalEntry(
  userId: string,
  session: ChatSession
): Promise<JournalEntry> {
  const entry = await prisma.journalEntry.create({
    data: {
      userId,
      intention: session.intention,
      topic: session.topic,
      deckSeed: session.deckSeed,
      messagesJson: session.messages as any, // Prisma handles JSON serialization
    },
  })

  return {
    id: entry.id,
    intention: entry.intention,
    topic: entry.topic || undefined,
    deckSeed: entry.deckSeed,
    createdAt: entry.createdAt,
    messagesJson: entry.messagesJson as any,
  }
}

/**
 * Get all journal entries for a specific user, sorted by most recent first.
 */
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const entries = await prisma.journalEntry.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return entries.map((entry) => ({
    id: entry.id,
    intention: entry.intention,
    topic: entry.topic || undefined,
    deckSeed: entry.deckSeed,
    createdAt: entry.createdAt,
    messagesJson: entry.messagesJson as any,
  }))
}

/**
 * Get a single journal entry by ID for a specific user.
 * Returns null if not found or doesn't belong to user (prevents access to other users' entries).
 */
export async function getJournalEntry(
  id: string,
  userId: string
): Promise<JournalEntry | null> {
  const entry = await prisma.journalEntry.findFirst({
    where: {
      id,
      userId,
    },
  })

  if (!entry) return null

  return {
    id: entry.id,
    intention: entry.intention,
    topic: entry.topic || undefined,
    deckSeed: entry.deckSeed,
    createdAt: entry.createdAt,
    messagesJson: entry.messagesJson as any,
  }
}

/**
 * Delete a journal entry by ID for a specific user.
 * Returns true if deleted, false if not found or doesn't belong to user.
 */
export async function deleteJournalEntry(id: string, userId: string): Promise<boolean> {
  try {
    const result = await prisma.journalEntry.deleteMany({
      where: {
        id,
        userId,
      },
    })
    return result.count > 0
  } catch (error) {
    // Entry not found or doesn't belong to user
    return false
  }
}

/**
 * Update a journal entry for a specific user.
 * Only updates the messagesJson field.
 * Returns null if not found or doesn't belong to user.
 */
export async function updateJournalEntry(
  id: string,
  userId: string,
  session: ChatSession
): Promise<JournalEntry | null> {
  try {
    // First verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    })

    if (!existing) return null

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        messagesJson: session.messages as any,
      },
    })

    return {
      id: entry.id,
      intention: entry.intention,
      topic: entry.topic || undefined,
      deckSeed: entry.deckSeed,
      createdAt: entry.createdAt,
      messagesJson: entry.messagesJson as any,
    }
  } catch (error) {
    // Entry not found or doesn't belong to user
    return null
  }
}
