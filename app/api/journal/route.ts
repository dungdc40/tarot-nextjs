import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getJournalEntries, saveJournalEntry } from '@/lib/db/journal'
import type { ChatSession } from '@/types'

/**
 * GET /api/journal
 * Get all journal entries for the authenticated user, sorted by most recent first.
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entries = await getJournalEntries(userId)
    return NextResponse.json(entries, { status: 200 })
  } catch (error) {
    console.error('[journal] Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/journal
 * Save a new journal entry for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.intention || !body.deckSeed || !body.messages) {
      return NextResponse.json(
        { error: 'Missing required fields: intention, deckSeed, messages' },
        { status: 400 }
      )
    }

    // Create ChatSession from request body
    const session: ChatSession = {
      intention: body.intention,
      topic: body.topic,
      deckSeed: body.deckSeed,
      messages: body.messages,
      selectedCards: new Map(), // Not needed for storage
      createdAt: new Date(),
    }

    const entry = await saveJournalEntry(userId, session)
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('[journal] Error saving entry:', error)
    return NextResponse.json(
      { error: 'Failed to save journal entry' },
      { status: 500 }
    )
  }
}
