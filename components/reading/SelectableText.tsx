'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { expandSelection, isMeaningfulForExplanation } from '@/lib/utils/textExpansion'

interface SelectableTextProps {
  text: string
  responseId?: string
  className?: string
  onWhyRequest?: (expandedText: string) => Promise<void>
}

interface ButtonPosition {
  x: number
  y: number
}

export function SelectableText({
  text,
  responseId,
  className = '',
  onWhyRequest,
}: SelectableTextProps) {
  const [showWhyButton, setShowWhyButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Hide button when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowWhyButton(false)
        setSelectedText('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseUp = useCallback(() => {
    // Don't show button if no responseId or no callback
    if (!responseId || !onWhyRequest) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
      setShowWhyButton(false)
      setSelectedText('')
      return
    }

    const selectedStr = selection.toString()

    // Get the selection range and position
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // Calculate button position (above the selection, centered)
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (containerRect) {
      // Position above selection, centered
      let x = rect.left + rect.width / 2 - containerRect.left
      let y = rect.top - containerRect.top - 45 // 45px above selection

      // Ensure button doesn't go off the left edge
      if (x < 60) x = 60

      // Ensure button doesn't go off the right edge
      const containerWidth = containerRect.width
      if (x > containerWidth - 60) x = containerWidth - 60

      // If button would go above container, show it below selection instead
      if (y < 0) {
        y = rect.bottom - containerRect.top + 10
      }

      setButtonPosition({ x, y })
    }

    // Expand the selection to complete sentences
    const fullText = text
    const selectionStart = text.indexOf(selectedStr)
    const selectionEnd = selectionStart + selectedStr.length

    if (selectionStart >= 0) {
      const expandedText = expandSelection(fullText, selectionStart, selectionEnd)
      setSelectedText(expandedText)
      setShowWhyButton(true)
    }
  }, [text, responseId, onWhyRequest])

  const handleWhyClick = useCallback(async () => {
    if (!selectedText || !onWhyRequest || isLoading) return

    // Validate selection
    if (!isMeaningfulForExplanation(selectedText)) {
      setError('Please select more meaningful text for explanation')
      setTimeout(() => setError(null), 3000)
      return
    }

    // Hide button immediately when clicked
    setShowWhyButton(false)
    setIsLoading(true)
    setError(null)

    const textToExplain = selectedText
    setSelectedText('')
    // Clear the browser selection
    window.getSelection()?.removeAllRanges()

    try {
      await onWhyRequest(textToExplain)
    } catch (err) {
      console.error('Failed to get explanation:', err)
      // Don't show error toast since button is already hidden
    } finally {
      setIsLoading(false)
    }
  }, [selectedText, onWhyRequest, isLoading])

  const handleCloseButton = useCallback(() => {
    setShowWhyButton(false)
    setSelectedText('')
    window.getSelection()?.removeAllRanges()
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selectable text */}
      <p
        className="select-text leading-relaxed"
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        {text}
      </p>

      {/* Why? button overlay */}
      <AnimatePresence>
        {showWhyButton && responseId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50"
            style={{
              left: buttonPosition.x,
              top: buttonPosition.y,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 shadow-lg">
              <button
                onClick={handleWhyClick}
                disabled={isLoading}
                className="text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>...</span>
                  </span>
                ) : (
                  'Why?'
                )}
              </button>
              <button
                onClick={handleCloseButton}
                className="ml-1 text-white/80 transition-colors hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-lg bg-red-500/90 px-3 py-2 text-center text-sm text-white"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
