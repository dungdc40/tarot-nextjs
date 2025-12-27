'use client'

// Voice Reading Interface - Main container for voice reading mode
// Coordinates all voice components and manages UI state

import { useRouter } from 'next/navigation'
import { useVoiceSession } from '@/lib/hooks/useVoiceSession'
import { useCurrentAgent, useCardDrawRequest, useCurrentlyDisplayedCard, useCardReveal, useVoiceReadingStore, useShuffledDeck, useShowRitual, useShowShuffling } from '@/lib/stores/voiceReadingStore'
import { VoiceAgentIndicator } from './VoiceAgentIndicator'
import { VoiceTranscript } from './VoiceTranscript'
import { CardPicker } from '@/components/reading/CardPicker'
import { VoiceCardReveal } from './VoiceCardReveal'
import { VoiceCardDisplay } from './VoiceCardDisplay'
import { StartStopButton } from './StartStopButton'
import { RitualInterface } from '@/components/reading/RitualInterface'
import { ShufflingAnimation } from '@/components/reading/ShufflingAnimation'
import { useState, useEffect } from 'react'
import { checkVoiceCompatibility, requestMicrophonePermission, type CompatibilityCheck } from '@/lib/utils/voice-compatibility'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import { getVoiceSessionManager } from '@/lib/services/VoiceSessionManager'

export function VoiceReadingInterface() {
  const router = useRouter()
  const [compatibilityCheck, setCompatibilityCheck] = useState<CompatibilityCheck | null>(null)
  const [microphonePermission, setMicrophonePermission] = useState<{granted: boolean, error?: string} | null>(null)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // Always call hooks - no early returns before this
  const { connectionStatus, error, disconnect, connect, isConnecting } = useVoiceSession()
  const currentAgent = useCurrentAgent()
  const cardDrawRequest = useCardDrawRequest()
  const displayedCard = useCurrentlyDisplayedCard()
  const cardReveal = useCardReveal()
  const shuffledDeck = useShuffledDeck()
  const showRitual = useShowRitual()
  const showShuffling = useShowShuffling()
  const store = useVoiceReadingStore()

  // Initialize deck when connection is established
  useEffect(() => {
    if (connectionStatus === 'connected' && shuffledDeck.length === 0) {
      store.initializeDeck().catch(() => {
        // Failed to initialize deck
      })
    }
  }, [connectionStatus, shuffledDeck.length, store])

  // Check browser compatibility and request microphone permission on mount
  useEffect(() => {
    const initializeVoice = async () => {
      // Step 1: Check browser compatibility
      const check = checkVoiceCompatibility()
      setCompatibilityCheck(check)

      if (!check.isSupported) {
        return
      }

      // Step 2: Request microphone permission
      const micPermission = await requestMicrophonePermission()
      setMicrophonePermission(micPermission)

      if (micPermission.granted) {
        // Step 3: Automatically connect to voice session
        connect()
      }
    }

    initializeVoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - do not re-run when connect changes

  const handleBackClick = () => {
    setShowExitConfirm(true)
  }

  const handleConfirmExit = async () => {
    await disconnect()
    router.push('/reading')
  }

  const handleCancelExit = () => {
    setShowExitConfirm(false)
  }

  const handleSwitchToTextMode = () => {
    router.push('/reading')
  }

  const handleRitualComplete = () => {
    // Transition from ritual to shuffling
    store.completeRitual()
  }

  const handleShufflingComplete = () => {
    // Complete shuffling phase
    store.completeShuffling()
  }

  // Compatibility check loading
  if (compatibilityCheck === null || microphonePermission === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {compatibilityCheck === null ? 'Checking browser compatibility...' : 'Requesting microphone permission...'}
          </p>
        </div>
      </div>
    )
  }

  // Compatibility error
  if (!compatibilityCheck.isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-amber-500 mb-4 flex justify-center">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Voice Not Supported
          </h2>
          <div className="text-gray-600 dark:text-gray-400 mb-6 space-y-2">
            <p className="font-medium">Voice reading is not available in your browser:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {compatibilityCheck.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                Recommendations:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Use a modern browser (Chrome, Firefox, Safari, Edge)</li>
                <li>• Ensure you&apos;re using the latest version</li>
                <li>• Access the site via HTTPS</li>
              </ul>
            </div>
          </div>
          <button
            onClick={handleSwitchToTextMode}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Switch to Text Mode
          </button>
        </div>
      </div>
    )
  }

  // Microphone permission error
  if (!microphonePermission.granted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-amber-500 mb-4 flex justify-center">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Microphone Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
            {microphonePermission.error || 'Voice reading requires microphone permission.'}
          </p>
          <button
            onClick={handleSwitchToTextMode}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Switch to Text Mode
          </button>
        </div>
      </div>
    )
  }

  // Connection state - auto-connect, so show loading until connected
  if (connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Initializing voice session...
          </p>
        </div>
      </div>
    )
  }

  // Compatibility warnings (non-blocking)
  const showWarnings = compatibilityCheck.warnings.length > 0

  // Loading state
  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Connecting to voice session...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (connectionStatus === 'error' || error) {
    // Determine error type and message
    const isServiceUnavailable = error?.includes('503') || error?.includes('unavailable')
    const isWebRTCError = error?.includes('WebRTC') || error?.includes('connection')
    const isMicrophoneError = error?.includes('microphone') || error?.includes('permission')

    let errorTitle = 'Connection Error'
    let errorDetails = error || 'Failed to connect to voice session'
    let recoverySteps: string[] = []

    if (isServiceUnavailable) {
      errorTitle = 'Service Temporarily Unavailable'
      errorDetails = 'The voice service is currently experiencing high demand or maintenance.'
      recoverySteps = [
        'Wait a few minutes and try again',
        'Check the service status page',
        'Switch to text mode to continue your reading',
      ]
    } else if (isWebRTCError) {
      errorTitle = 'Connection Failed'
      errorDetails = 'Unable to establish a real-time connection with the voice service.'
      recoverySteps = [
        'Check your internet connection',
        'Try refreshing the page',
        'Ensure you\'re using a compatible browser',
        'Switch to text mode as an alternative',
      ]
    } else if (isMicrophoneError) {
      errorTitle = 'Microphone Access Required'
      errorDetails = error || 'Voice reading requires microphone permission.'
      recoverySteps = [
        'Click the microphone icon in your browser\'s address bar',
        'Select "Allow" to grant microphone access',
        'Refresh the page after granting permission',
      ]
    } else {
      recoverySteps = [
        'Check your internet connection',
        'Try refreshing the page',
        'Switch to text mode',
      ]
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-red-500 mb-4 flex justify-center">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {errorTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
            {errorDetails}
          </p>

          {recoverySteps.length > 0 && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                What you can do:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                {recoverySteps.map((step, index) => (
                  <li key={index}>• {step}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleSwitchToTextMode}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Switch to Text Mode
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show ritual screen
  if (showRitual) {
    return <RitualInterface onComplete={handleRitualComplete} />
  }

  // Show shuffling animation
  if (showShuffling) {
    return <ShufflingAnimation onComplete={handleShufflingComplete} />
  }

  // Card reveal takes precedence over card picker
  // Check this BEFORE currentPosition to ensure reveal shows after selection
  if (cardReveal) {
    // During card reveal, show the full-screen card reveal with batch mode progression
    const handleCardRevealNext = () => {
      const { spread, currentCardDrawIndex, drawnCards } = store

      console.log('[VoiceReadingInterface] Card reveal next clicked')
      console.log('[VoiceReadingInterface] Current state:', {
        currentCardDrawIndex,
        totalPositions: spread?.positions.length,
        drawnCardsCount: drawnCards.length
      })

      // Hide current reveal
      store.hideCardReveal()

      if (spread && currentCardDrawIndex !== null && currentCardDrawIndex >= 0) {
        const isLastCard = currentCardDrawIndex >= spread.positions.length - 1

        if (isLastCard) {
          console.log('[VoiceReadingInterface] Last card detected - transitioning to ReadingAgent')
          // Last card - transition to ReadingAgent
          const sessionManager = getVoiceSessionManager()
          sessionManager.transitionToReadingWithCards(drawnCards)

          // Complete card drawing
          store.completeCardDrawing()
        } else {
          console.log('[VoiceReadingInterface] Advancing to next card')
          // More cards to draw - advance to next
          store.advanceCardDrawing()
        }
      }
    }

    return (
      <VoiceCardReveal
        cardId={cardReveal.cardId}
        cardName={cardReveal.cardName}
        reversed={cardReveal.reversed}
        positionLabel={cardReveal.positionLabel}
        positionIndex={cardReveal.positionIndex}
        totalPositions={cardReveal.totalPositions}
        showNextButton={true}  // Always show button in batch mode
        onNext={handleCardRevealNext}
      />
    )
  }

  // Batch card drawing mode - show CardPicker when we have a spread and valid currentCardDrawIndex
  const currentPosition = store.getCurrentCardPosition()

  if (currentPosition) {
    // During card picking, show CardPicker
    const handleCardSelected = (cardId: string) => {
      console.log('[VoiceReadingInterface] Card selected:', cardId)
      const cardName = riderWaiteDeckService.getCardName(cardId)
      const reversed = Math.random() < 0.5  // 50% chance for voice mode

      // Remove card from deck
      store.removeCardFromDeck(cardId)

      // Add to drawn cards
      store.addDrawnCard({
        cardId,
        name: cardName,
        reversed,
        drawIndex: currentPosition.cardNumber - 1,
        label: currentPosition.positionLabel,
        promptRole: currentPosition.promptRole,
      })

      console.log('[VoiceReadingInterface] Showing card reveal for:', cardName, reversed ? '(Reversed)' : '(Upright)')

      // Show card reveal screen with batch context
      store.showCardReveal({
        cardId,
        cardName,
        reversed,
        positionLabel: currentPosition.positionLabel,
        positionIndex: currentPosition.cardNumber - 1,  // Convert from 1-based to 0-based
        totalPositions: currentPosition.totalCards,
        isVisible: true,
      })
    }

    const handleCancel = () => {
      // In batch mode, cancel means going back to main reading
      store.completeCardDrawing()
    }

    return (
      <CardPicker
        shuffledDeck={shuffledDeck}
        positionLabel={currentPosition.positionLabel}
        positionIndex={currentPosition.cardNumber - 1}  // Convert from 1-based to 0-based
        totalPositions={currentPosition.totalCards}
        onCardSelected={handleCardSelected}
        showVoiceIndicator={true}
        onCancel={handleCancel}
        promptRole={currentPosition.promptRole}
      />
    )
  }

  // Normal voice interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Back button */}
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors"
            aria-label="Exit reading"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Exit</span>
          </button>

          {/* Agent indicator */}
          <VoiceAgentIndicator />

          {/* Spacer for balance */}
          <div className="w-24" />
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Displayed card (when show_card tool is called) */}
        {displayedCard && (
          <VoiceCardDisplay
            cardId={displayedCard.cardId}
            cardName={riderWaiteDeckService.getCardName(displayedCard.cardId)}
            reversed={displayedCard.reversed}
          />
        )}

        {/* Start/Stop button */}
        <div className="flex justify-center">
          <StartStopButton />
        </div>

        {/* Transcript */}
        <VoiceTranscript />
      </div>

      {/* Exit confirmation dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Exit Voice Reading?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your reading session will end and cannot be resumed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelExit}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
