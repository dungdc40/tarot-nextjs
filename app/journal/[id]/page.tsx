'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { JournalEntry, ChatMessage } from '@/types'
import { isStringMessage, isCardDraw, isReadingMainData, isExplanationMessageData } from '@/types'
import { ReadingDisplay } from '@/components/reading/ReadingDisplay'
import { CardMessage } from '@/components/reading/CardMessage'
import { ExplanationReply } from '@/components/reading/ExplanationReply'

interface JournalDetailPageProps {
  params: Promise<{ id: string }>
}

export default function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch journal entry
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/journal/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Journal entry not found')
          }
          throw new Error('Failed to fetch journal entry')
        }
        const data = await response.json()
        // Parse dates
        setEntry({
          ...data,
          createdAt: new Date(data.createdAt),
        })
        setError(null)
      } catch (err) {
        console.error('Failed to fetch journal entry:', err)
        setError(err instanceof Error ? err.message : 'Failed to load journal entry')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [id])

  // Delete journal entry
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete journal entry')
      }
      router.push('/journal')
    } catch (err) {
      console.error('Failed to delete journal entry:', err)
      setError('Failed to delete journal entry')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  // Render message based on type
  const renderMessage = (message: ChatMessage, index: number) => {
    // Parse the message data if it has timestamps as strings
    const parsedMessage = {
      ...message,
      timestamp: typeof message.timestamp === 'string'
        ? new Date(message.timestamp)
        : message.timestamp,
    }

    // Render ReadingMainData messages
    if (isReadingMainData(parsedMessage.data)) {
      return (
        <div key={index} className="my-6">
          <div className="mb-2 text-xs text-foreground/60">
            {parsedMessage.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <ReadingDisplay reading={parsedMessage.data} />
        </div>
      )
    }

    // Render CardDraw messages
    if (isCardDraw(parsedMessage.data)) {
      return (
        <div key={index} className="my-6">
          <div className="mb-2 text-xs text-foreground/60">
            {parsedMessage.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <CardMessage card={parsedMessage.data} index={0} />
        </div>
      )
    }

    // Render ExplanationMessageData messages
    if (isExplanationMessageData(parsedMessage.data)) {
      return (
        <div key={index} className="my-4">
          <ExplanationReply
            originalText={parsedMessage.data.originalText}
            explanation={parsedMessage.data.explanation}
          />
        </div>
      )
    }

    // Render string messages
    if (!isStringMessage(parsedMessage.data)) return null

    return (
      <div
        key={index}
        className={`flex ${parsedMessage.isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            parsedMessage.isUser
              ? 'bg-primary text-white'
              : 'bg-background/60 text-foreground backdrop-blur-sm'
          }`}
        >
          <p className="whitespace-pre-wrap">{parsedMessage.data}</p>
          <p className="mt-1 text-xs opacity-60">
            {parsedMessage.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/journal"
                className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="animate-pulse">
                <div className="h-6 w-48 rounded bg-foreground/10" />
                <div className="mt-1 h-4 w-32 rounded bg-foreground/10" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-foreground/5 p-4">
                <div className="h-4 w-3/4 rounded bg-foreground/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !entry) {
    return (
      <div className="min-h-screen">
        <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/journal"
                className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-foreground">Journal Entry</h1>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl p-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error || 'Journal entry not found'}</p>
            <Link
              href="/journal"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Back to Journal
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/journal"
                className="rounded-full p-2 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground line-clamp-1">
                  {entry.topic || entry.intention}
                </h1>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(entry.createdAt)} • {formatTime(entry.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg bg-foreground/10 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/20"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-full p-2 text-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Delete entry"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Topic Badge */}
      {entry.topic && (
        <div className="border-b border-primary/20 bg-background/60 px-4 py-2">
          <div className="mx-auto max-w-4xl">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
              {entry.topic}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
          {entry.messagesJson.map((message, index) => renderMessage(message, index))}
        </div>
      </div>

      {/* Read-only indicator */}
      <div className="border-t border-primary/20 bg-background/80 p-4 text-center backdrop-blur-sm">
        <p className="text-sm text-foreground/50">
          This is a saved reading. Start a new reading to ask follow-up questions.
        </p>
        <Link
          href="/reading"
          className="mt-2 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Start New Reading
        </Link>
      </div>
    </div>
  )
}
