'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { getCardImagePath } from '@/lib/utils/cardImageUtils'

interface VoiceCardDisplayProps {
  cardId: string
  cardName: string
  reversed: boolean
}

/**
 * VoiceCardDisplay - Shows a tarot card face-up without reveal animation
 *
 * Used by ReadingAgent and FollowupAgent when calling show_card tool.
 * Unlike VoiceCardReveal, this component shows the card immediately
 * without any flip animation, as the card is being actively discussed.
 */
export function VoiceCardDisplay({
  cardId,
  cardName,
  reversed,
}: VoiceCardDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm">
        {/* Voice session indicator */}
        <div className="mb-4 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Voice session active
          </span>
        </div>

        {/* Card image */}
        <div className="relative h-[340px] w-[204px] lg:h-[454px] lg:w-[272px] mx-auto overflow-hidden rounded-lg border-2 border-purple-500/50 shadow-xl mb-4">
          <Image
            src={getCardImagePath(cardId)}
            alt={cardName}
            width={272}
            height={454}
            className={`h-full w-full object-cover ${
              reversed ? 'rotate-180' : ''
            }`}
            priority
          />
        </div>

        {/* Card info */}
        <div className="text-center">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {cardName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {reversed ? 'Reversed' : 'Upright'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 italic">
            Listen for your voice assistant's interpretation
          </p>
        </div>
      </div>
    </motion.div>
  )
}
