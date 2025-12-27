'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import type { ChatMessage } from '@/types'
import { isStringMessage, isCardDraw, isReadingMainData, isExplanationMessageData } from '@/types'
import { ReadingDisplay } from './ReadingDisplay'
import { CardMessage } from './CardMessage'
import { ExplanationReply } from './ExplanationReply'
import { SelectableText } from './SelectableText'

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  showAllMessageTypes?: boolean
  onWhyRequest?: (expandedText: string, responseId: string) => Promise<void>
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = 'Type your message...',
  showAllMessageTypes = false,
  onWhyRequest,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has been updated
    requestAnimationFrame(scrollToBottom)
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  // Create wrapper for onWhyRequest that also scrolls to bottom
  const handleWhyRequestWithScroll = onWhyRequest
    ? async (expandedText: string, responseId: string) => {
        await onWhyRequest(expandedText, responseId)
        // Small delay to ensure new message is rendered
        setTimeout(() => {
          requestAnimationFrame(scrollToBottom)
        }, 100)
      }
    : undefined

  return (
    <div className="flex h-full flex-col relative" role="region" aria-label="Chat interface">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{ paddingBottom: '120px' }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message, index) => {
          // Render ReadingMainData messages (multiple cards)
          if (isReadingMainData(message.data) && showAllMessageTypes) {
            return (
              <div key={index} className="my-6">
                <div className="mb-2 text-xs text-muted-foreground">
                  <time dateTime={message.timestamp.toISOString()}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <ReadingDisplay
                  reading={message.data}
                  responseId={message.responseId}
                  onWhyRequest={onWhyRequest}
                  onWhyRequestWithClose={handleWhyRequestWithScroll}
                />
              </div>
            )
          }

          // Render CardDraw messages (single card)
          if (isCardDraw(message.data) && showAllMessageTypes) {
            return (
              <div key={index} className="my-6">
                <div className="mb-2 text-xs text-muted-foreground">
                  <time dateTime={message.timestamp.toISOString()}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <CardMessage
                  card={message.data}
                  index={0}
                  responseId={message.responseId}
                  onWhyRequest={onWhyRequest}
                  onWhyRequestWithClose={handleWhyRequestWithScroll}
                />
              </div>
            )
          }

          // Render ExplanationMessageData messages
          if (isExplanationMessageData(message.data) && showAllMessageTypes) {
            return (
              <div key={index} className="my-4">
                <ExplanationReply
                  originalText={message.data.originalText}
                  explanation={message.data.explanation}
                  responseId={message.responseId}
                  onWhyRequest={onWhyRequest}
                />
              </div>
            )
          }

          // Only render string messages in chat
          if (!isStringMessage(message.data)) return null

          return (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <article
                className={`max-w-[80%] rounded-neu-lg px-5 py-3.5 ${
                  message.isUser
                    ? 'bg-primary text-white shadow-neu-btn'
                    : 'bg-surface-raised text-foreground shadow-neu-raised-sm'
                }`}
                aria-label={message.isUser ? 'Your message' : 'Assistant message'}
              >
                {onWhyRequest && !message.isUser ? (
                  <SelectableText
                    text={message.data}
                    responseId={message.responseId}
                    onWhyRequest={onWhyRequest}
                    className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base"
                  />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base">{message.data}</p>
                )}
                <p className="mt-1.5 text-xs opacity-70">
                  <time dateTime={message.timestamp.toISOString()}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </p>
              </article>
            </div>
          )
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start" role="status" aria-label="Loading response">
            <div className="max-w-[80%] rounded-neu-lg bg-surface-raised px-5 py-4 shadow-neu-raised-sm">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary" />
                <div
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: '0.15s' }}
                />
                <div
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
              <span className="sr-only">Assistant is typing...</span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Input Area - Neumorphic - Fixed for Safari mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-raised p-4 shadow-neu-raised safe-area-bottom">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            aria-describedby={isLoading ? 'loading-status' : undefined}
            className="neu-input flex-1"
          />
          {isLoading && (
            <span id="loading-status" className="sr-only">
              Please wait, processing your message
            </span>
          )}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="neu-btn-primary rounded-neu px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  )
}
