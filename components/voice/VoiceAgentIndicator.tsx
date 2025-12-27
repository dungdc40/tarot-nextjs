'use client'

// Voice Agent Indicator - Shows current agent and status
// Displays at top of voice reading interface

import { useCurrentAgent } from '@/lib/stores/voiceReadingStore'
import { AGENT_LABELS } from '@/types'

export function VoiceAgentIndicator() {
  const currentAgent = useCurrentAgent()
  const label = AGENT_LABELS[currentAgent]

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2">
      {/* Status indicator */}
      <div className="relative flex items-center">
        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
        <div className="absolute h-2 w-2 rounded-full bg-purple-500 animate-ping opacity-75" />
      </div>

      {/* Agent label */}
      <span
        className="text-sm font-medium text-purple-700 dark:text-purple-300"
        role="status"
        aria-live="polite"
        aria-label={`Current agent: ${label}`}
      >
        {label}
      </span>
    </div>
  )
}
