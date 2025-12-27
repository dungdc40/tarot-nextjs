'use client'

// Voice Transcript - Optional transcript display for accessibility
// Shows conversation history with user and assistant messages

import { useEffect, useRef } from 'react'
import { useTranscriptMessages, useShowTranscript, useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'
import { AGENT_LABELS } from '@/types'

export function VoiceTranscript() {
  const messages = useTranscriptMessages()
  const showTranscript = useShowTranscript()
  const toggleTranscript = useVoiceReadingStore((state) => state.toggleTranscript)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current && showTranscript) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, showTranscript])

  return (
    <div className="flex flex-col gap-2">
      {/* Toggle button */}
      <button
        onClick={toggleTranscript}
        className="self-end px-3 py-1 text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        aria-expanded={showTranscript}
        aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
      >
        {showTranscript ? 'Hide' : 'Show'} Transcript
      </button>

      {/* Transcript messages */}
      {showTranscript && (
        <div
          ref={scrollRef}
          className="max-h-64 overflow-y-auto rounded-lg border border-purple-200 dark:border-purple-800 bg-white/50 dark:bg-black/20 p-4 space-y-3"
          role="log"
          aria-live="polite"
          aria-label="Conversation transcript"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
              Conversation will appear here...
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {/* Agent name for assistant messages */}
                  {message.role === 'assistant' && message.agentName && (
                    <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                      {AGENT_LABELS[message.agentName]}
                    </div>
                  )}

                  {/* Message content */}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Timestamp */}
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
