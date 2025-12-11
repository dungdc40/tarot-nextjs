import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getJournalEntry, deleteJournalEntry } from '@/lib/db/journal'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/journal/[id]
 * Get a single journal entry by ID for the authenticated user.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const entry = await getJournalEntry(id, userId)

    if (!entry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(entry, { status: 200 })
  } catch (error) {
    console.error('[journal] Error fetching entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/journal/[id]
 * Delete a journal entry by ID for the authenticated user.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteJournalEntry(id, userId)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[journal] Error deleting entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    )
  }
}
