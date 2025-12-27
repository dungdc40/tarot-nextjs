'use client'

// Push-to-Talk Button - Main interaction button for voice mode
// Allows user to speak to the AI

import { useVoiceAudioState, useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'

export function PushToTalkButton() {
  const audioState = useVoiceAudioState()
  const store = useVoiceReadingStore()

  const handlePress = () => {
    store.setMuted(false)
  }

  const handleRelease = () => {
    store.setMuted(true)
  }

  const isDisabled = audioState.isSpeaking

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main button */}
      <button
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
        disabled={isDisabled}
        className={`
          relative h-32 w-32 rounded-full
          transition-all duration-200
          ${
            audioState.isListening
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-2xl shadow-purple-500/50'
              : isDisabled
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-br from-purple-600 to-pink-600 hover:scale-105 shadow-xl shadow-purple-500/30'
          }
          ${audioState.isSpeaking ? 'animate-pulse' : ''}
        `}
        aria-label={
          audioState.isSpeaking
            ? 'AI is speaking...'
            : audioState.isListening
            ? 'Listening...'
            : 'Hold to speak'
        }
        aria-pressed={audioState.isListening}
      >
        {/* Icon/Text */}
        <div className="flex flex-col items-center justify-center h-full text-white">
          {audioState.isSpeaking ? (
            <>
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span className="text-sm font-medium">Speaking...</span>
            </>
          ) : audioState.isListening ? (
            <>
              <svg
                className="w-12 h-12 mb-2 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span className="text-sm font-medium">Listening...</span>
            </>
          ) : (
            <>
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span className="text-sm font-medium">Hold to Speak</span>
            </>
          )}
        </div>

        {/* Ripple effect when listening */}
        {audioState.isListening && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
        )}
      </button>

      {/* Hint text */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs">
        {audioState.isSpeaking
          ? 'The AI is speaking. Please wait...'
          : 'Press and hold the button to speak'}
      </p>
    </div>
  )
}
