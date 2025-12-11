'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Trash2, BookOpen, Calendar, Sparkles } from 'lucide-react'
import type { JournalEntry } from '@/types'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Fetch journal entries
  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/journal')
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries')
      }
      const data = await response.json()
      // Parse dates from JSON
      const parsedEntries = data.map((entry: JournalEntry) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
      }))
      setEntries(parsedEntries)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch journal entries:', err)
      setError('Failed to load journal entries')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Delete journal entry
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete journal entry')
      }
      // Remove from local state
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
    } catch (err) {
      console.error('Failed to delete journal entry:', err)
      setError('Failed to delete journal entry')
    } finally {
      setDeletingId(null)
      setShowDeleteConfirm(null)
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Neumorphic */}
      <header className="bg-surface-raised shadow-neu-raised">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-neu bg-surface p-2.5 text-muted-foreground shadow-neu-raised-sm transition-all duration-200 hover:shadow-neu-inset-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Journal</h1>
              <p className="text-sm text-muted-foreground">
                Your saved readings
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-6" role="main">
        {/* Loading State - Neumorphic skeleton */}
        {isLoading && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading journal entries">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="neu-card animate-pulse"
              >
                <div className="mb-3 h-5 w-3/4 rounded-neu bg-surface-sunken" />
                <div className="h-4 w-1/2 rounded-neu bg-surface-sunken" />
              </div>
            ))}
            <span className="sr-only">Loading your journal entries...</span>
          </div>
        )}

        {/* Error State - Neumorphic */}
        {error && !isLoading && (
          <div
            className="neu-card border-2 border-error/30 text-center"
            role="alert"
            aria-live="assertive"
          >
            <p className="mb-4 text-error">{error}</p>
            <button
              onClick={fetchEntries}
              className="neu-btn-primary rounded-neu px-5 py-2.5"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State - Neumorphic */}
        {!isLoading && !error && entries.length === 0 && (
          <div className="neu-card p-12 text-center">
            <div
              className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-neu bg-surface-sunken shadow-neu-inset-sm"
              aria-hidden="true"
            >
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 font-serif text-xl font-bold text-foreground">No Readings Yet</h2>
            <p className="mb-6 text-muted-foreground">
              Complete a reading to save it to your journal.
            </p>
            <Link
              href="/reading"
              className="neu-btn-primary inline-flex items-center gap-2 rounded-neu-lg px-6 py-3"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              <span>Start a Reading</span>
            </Link>
          </div>
        )}

        {/* Journal Entries List - Neumorphic cards */}
        {!isLoading && !error && entries.length > 0 && (
          <section aria-labelledby="entries-heading">
            <h2 id="entries-heading" className="sr-only">Your Journal Entries</h2>
            <ul className="space-y-4">
              <AnimatePresence>
                {entries.map((entry) => (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <article className="neu-card-interactive group relative cursor-pointer">
                      <Link
                        href={`/journal/${entry.id}`}
                        className="block p-5"
                        aria-label={`View reading: ${entry.topic || entry.intention}`}
                      >
                        {/* Topic as Title */}
                        <h3 className="mb-2 font-serif text-lg font-semibold text-foreground line-clamp-2 transition-colors duration-200 group-hover:text-primary">
                          {entry.topic || entry.intention}
                        </h3>

                        {/* Date/Time - Neumorphic badge */}
                        <div className="flex items-center gap-2">
                          <span className="neu-badge gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            <time dateTime={entry.createdAt.toISOString()}>
                              {formatDate(entry.createdAt)} • {formatTime(entry.createdAt)}
                            </time>
                          </span>
                        </div>
                      </Link>

                      {/* Delete Button */}
                      <div className="absolute right-4 top-4">
                        {showDeleteConfirm === entry.id ? (
                          <div className="flex items-center gap-2" role="group" aria-label="Confirm delete">
                            <button
                              onClick={() => handleDelete(entry.id)}
                              disabled={deletingId === entry.id}
                              className="rounded-neu bg-error px-3 py-1.5 text-sm font-semibold text-white shadow-neu-btn transition-all duration-200 hover:bg-error-light disabled:opacity-50"
                              aria-label={deletingId === entry.id ? 'Deleting entry' : 'Confirm delete'}
                            >
                              {deletingId === entry.id ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="neu-btn rounded-neu px-3 py-1.5 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setShowDeleteConfirm(entry.id)
                            }}
                            className="rounded-neu bg-surface p-2 text-muted-foreground shadow-neu-raised-sm opacity-0 transition-all duration-200 hover:text-error hover:shadow-neu-inset-sm group-hover:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                            aria-label={`Delete entry: ${entry.topic || entry.intention}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </article>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
