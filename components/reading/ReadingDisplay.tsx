'use client'

import { SynthesisMessage } from './SynthesisMessage'
import { CardMessage } from './CardMessage'
import type { ReadingMainData } from '@/types'

interface ReadingDisplayProps {
  reading: ReadingMainData
  responseId?: string
  onWhyRequest?: (expandedText: string) => Promise<void>
}

export function ReadingDisplay({ reading, responseId, onWhyRequest }: ReadingDisplayProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      {/* Individual Card Interpretations - Show First */}
      <div className="space-y-4">
        {reading.cards.map((card, index) => (
          <CardMessage
            key={card.cardId}
            card={card}
            index={index}
            responseId={responseId}
            onWhyRequest={onWhyRequest}
          />
        ))}
      </div>

      {/* Overall Synthesis - Show After Cards */}
      <SynthesisMessage
        interpretation={reading.interpretation}
        advice={reading.advice}
        responseId={responseId}
        onWhyRequest={onWhyRequest}
      />
    </div>
  )
}
