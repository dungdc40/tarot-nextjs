'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SelectableText } from './SelectableText'

interface SynthesisMessageProps {
  interpretation: string
  advice: string
  responseId?: string
  onWhyRequest?: (expandedText: string) => Promise<void>
}

export function SynthesisMessage({
  interpretation,
  advice,
  responseId,
  onWhyRequest,
}: SynthesisMessageProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-4 overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-primary/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h3 className="text-lg font-bold text-foreground">Overall Reading</h3>
        </div>
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="h-5 w-5 text-foreground/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4 pt-0">
              {/* Interpretation */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                  Synthesis
                </h4>
                <SelectableText
                  text={interpretation}
                  responseId={responseId}
                  className="text-foreground/90"
                  onWhyRequest={onWhyRequest}
                />
              </div>

              {/* Advice */}
              {advice && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                    Advice
                  </h4>
                  <SelectableText
                    text={advice}
                    responseId={responseId}
                    className="text-foreground/90"
                    onWhyRequest={onWhyRequest}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
