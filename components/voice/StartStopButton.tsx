'use client'

// Start/Stop Button - Simple interaction button for voice mode
// Start: Begin speaking session
// Stop: End speaking session

import { useState } from 'react'
import { useVoiceAudioState, useVoiceReadingStore } from '@/lib/stores/voiceReadingStore'

export function StartStopButton() {
  const [isActive, setIsActive] = useState(false)
  const audioState = useVoiceAudioState()
  const store = useVoiceReadingStore()

  const handleStart = () => {
    console.log('[StartStopButton] ========== START CLICKED ==========')
    console.log('[StartStopButton] Current audio state:', audioState)
    console.log('[StartStopButton] Setting isActive to true')
    setIsActive(true)
    console.log('[StartStopButton] Calling store.setMuted(false)')
    store.setMuted(false)
    console.log('[StartStopButton] Calling store.setListening(true)')
    store.setListening(true)
    console.log('[StartStopButton] Start complete. Should be listening now.')
  }

  const handleStop = () => {
    console.log('[StartStopButton] ========== STOP CLICKED ==========')
    console.log('[StartStopButton] Current audio state:', audioState)
    console.log('[StartStopButton] Setting isActive to false')
    setIsActive(false)
    console.log('[StartStopButton] Calling store.setMuted(true)')
    store.setMuted(true)
    console.log('[StartStopButton] Calling store.setListening(false)')
    store.setListening(false)
    console.log('[StartStopButton] Stop complete. Should be muted now.')
  }

  // Disable when AI is speaking
  const isDisabled = audioState.isSpeaking

  // If active, show Stop button
  if (isActive) {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Stop button */}
        <button
          onClick={handleStop}
          disabled={isDisabled}
          className={`
            relative h-32 w-32 rounded-full
            transition-all duration-200
            ${
              isDisabled
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-br from-red-500 to-red-600 hover:scale-105 shadow-xl shadow-red-500/30'
            }
            ${audioState.isListening ? 'scale-110 shadow-2xl shadow-red-500/50' : ''}
          `}
          aria-label="Stop speaking"
        >
          {/* Icon/Text */}
          <div className="flex flex-col items-center justify-center h-full text-white">
            <svg
              className="w-12 h-12 mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span className="text-sm font-medium">Stop</span>
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
            : audioState.isListening
            ? 'Listening... Click Stop when finished'
            : 'Click Stop to end your message'}
        </p>
      </div>
    )
  }

  // Otherwise, show Start button
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={isDisabled}
        className={`
          relative h-32 w-32 rounded-full
          transition-all duration-200
          ${
            isDisabled
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-br from-purple-600 to-pink-600 hover:scale-105 shadow-xl shadow-purple-500/30'
          }
        `}
        aria-label="Start speaking"
      >
        {/* Icon/Text */}
        <div className="flex flex-col items-center justify-center h-full text-white">
          {audioState.isSpeaking ? (
            <>
              <svg
                className="w-12 h-12 mb-2 animate-pulse"
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
              <span className="text-sm font-medium">Start</span>
            </>
          )}
        </div>
      </button>

      {/* Hint text */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs">
        {audioState.isSpeaking
          ? 'The AI is speaking. Please wait...'
          : 'Click Start to begin speaking'}
      </p>
    </div>
  )
}
