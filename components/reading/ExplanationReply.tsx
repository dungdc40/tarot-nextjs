'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X } from 'lucide-react'
import { SelectableText } from './SelectableText'

interface ExplanationReplyProps {
  originalText: string
  explanation: string
  responseId?: string
  onWhyRequest?: (expandedText: string, responseId: string) => Promise<void>
}

export function ExplanationReply({
  originalText,
  explanation,
  responseId,
  onWhyRequest,
}: ExplanationReplyProps) {
  const [showFullDialog, setShowFullDialog] = useState(false)

  const isLongExplanation = explanation.length > 500
  const displayText = isLongExplanation
    ? `${explanation.substring(0, 300)}...`
    : explanation

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-2"
    >
      <div className="flex justify-start">
        <div className="max-w-[80%]">
          {/* Reply indicator line */}
          <div className="mb-2 h-0.5 w-5 bg-primary/60" />

          {/* Quoted original text */}
          <div className="mb-2 rounded-lg border-l-[3px] border-primary/60 bg-foreground/5 p-3">
            <p className="text-sm italic text-foreground/70 line-clamp-2">
              {truncateText(originalText, 120)}
            </p>
          </div>

          {/* Explanation bubble */}
          <div className="rounded-2xl bg-background/60 px-4 py-3 shadow-sm backdrop-blur-sm">
            {/* "Why?" header */}
            <div className="mb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Why?</span>
            </div>

            {/* Explanation text (also selectable for recursive Why?) */}
            <SelectableText
              text={displayText}
              responseId={responseId}
              className="text-sm text-foreground/90"
              onWhyRequest={onWhyRequest}
            />

            {/* Read more button for long explanations */}
            {isLongExplanation && (
              <button
                onClick={() => setShowFullDialog(true)}
                className="mt-2 text-xs font-medium text-primary hover:text-primary-dark"
              >
                Read more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full explanation dialog */}
      <AnimatePresence>
        {showFullDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowFullDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-primary/20 p-4">
                <h3 className="flex-1 pr-4 text-lg font-bold text-foreground">
                  Why &quot;{truncateText(originalText, 50)}&quot;
                </h3>
                <button
                  onClick={() => setShowFullDialog(false)}
                  className="rounded-full p-1 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                <SelectableText
                  text={explanation}
                  responseId={responseId}
                  className="text-sm leading-relaxed text-foreground/90"
                  onWhyRequest={onWhyRequest}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-primary/20 p-4">
                <button
                  onClick={() => setShowFullDialog(false)}
                  className="w-full rounded-lg bg-primary py-2 font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
