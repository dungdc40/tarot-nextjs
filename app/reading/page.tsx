'use client'

// Reading Flow Page - Phase 3.2
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Check } from 'lucide-react'
import { useReadingStore } from '@/lib/stores/readingStore'
import { useToast } from '@/lib/contexts/ToastContext'
import { ChatInterface } from '@/components/reading/ChatInterface'
import { RitualInterface } from '@/components/reading/RitualInterface'
import { ShufflingAnimation } from '@/components/reading/ShufflingAnimation'
import { ReadingLoadingAnimation } from '@/components/reading/ReadingLoadingAnimation'
import { CardPicker } from '@/components/reading/CardPicker'
import { CardRevealScreen } from '@/components/reading/CardRevealScreen'
import { ReadingDisplay } from '@/components/reading/ReadingDisplay'
import { riderWaiteDeckService } from '@/lib/services/RiderWaiteDeckService'
import { aiService } from '@/lib/services/AIService'
import type { ChatMessage, ReadingMainData, ExplanationMessageData } from '@/types'
import { isReadingMainData } from '@/types'

export default function ReadingPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingSpread, setIsGeneratingSpread] = useState(false)

  // Helper to check if error is a 5xx server error
  const handle5xxError = useCallback((error: any) => {
    // Check if error has a status code in 500-599 range
    if (error?.status && error.status >= 500 && error.status < 600) {
      showToast(error.message || 'Server error occurred. Please try again.', 'error')
      return true
    }
    // Check if error message indicates server error
    if (error?.message && /5\d{2}/.test(error.message)) {
      showToast(error.message || 'Server error occurred. Please try again.', 'error')
      return true
    }
    return false
  }, [showToast])

  // Prevent body scrolling on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const {
    state,
    session,
    spread,
    shuffledDeck,
    clarificationCards,
    selectedClarificationCards,
    isLoading,
    setState,
    startReading,
    addMessage,
    setIntention,
    setSpread,
    setShuffledDeck,
    selectCard,
    setClarificationCards,
    selectClarificationCard,
    completeClarificationPicking,
    setLoading,
    setError,
    reset,
  } = useReadingStore()

  // Initialize deck and start reading flow
  useEffect(() => {
    const initializeReading = async () => {
      if (state.type === 'idle') {
        try {
          // Load deck first
          await riderWaiteDeckService.loadDeck()

          // Start with intention collecting (chat screen)
          startReading()
        } catch (err) {
          console.error('Failed to load deck:', err)
          setError('Failed to load tarot deck')
        }
      }
    }

    initializeReading()
  }, [state.type, startReading, setState, setSpread, setShuffledDeck, setError])

  // Reset save button when new message is added
  useEffect(() => {
    if (session?.messages && session.messages.length > 0 && isSaved) {
      setIsSaved(false)
    }
  }, [session?.messages.length])

  // Auto-transition when spread becomes ready during shuffling
  useEffect(() => {
    if (state.type === 'shuffling' && spread !== null && session) {
      console.log('[useEffect] Spread ready during shuffling, transitioning to picking...')

      // Shuffle deck if not already done
      if (shuffledDeck.length === 0) {
        const shuffled = riderWaiteDeckService.shuffleDeck(session.deckSeed)
        setShuffledDeck(shuffled)
      }

      // Move to card picking
      setState({ type: 'picking', currentPositionIndex: 0 })
    }
  }, [state.type, spread, session, shuffledDeck.length, setState, setShuffledDeck])

  // Handle intent collection message
  const handleIntentMessage = async (message: string) => {
    if (!session) return

    // Add user message
    const userMessage: ChatMessage = {
      data: message,
      isUser: true,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    setLoading(true)

    try {
      // Call AI to assess intent
      const assessment = await aiService.assessIntent({
        userMessage: message,
        previousResponseId: session.messages[session.messages.length - 1]?.responseId,
      })

      // If intent is clear, move to ritual immediately without showing AI message
      if (assessment.intentStatus === 'clear') {
        setIntention(assessment.intentSummary || message, assessment.topic)

        // Start generating spread in the background immediately
        // This reduces waiting time during the ritual and shuffling phases
        setIsGeneratingSpread(true)
        aiService.generateSpreadSelection({
          intentSummary: assessment.intentSummary || message,
          timeframe: assessment.topic,
        })
          .then((spreadResult) => {
            if (spreadResult.spread && session) {
              console.log('[handleIntentMessage] Spread generated early:', spreadResult)
              setSpread(spreadResult.spread)

              // Also shuffle the deck now so it's ready when needed
              const shuffled = riderWaiteDeckService.shuffleDeck(session.deckSeed)
              setShuffledDeck(shuffled)
            }
          })
          .catch((error) => {
            console.error('[handleIntentMessage] Early spread generation failed:', error)
            // Don't show error here - will retry in handleShufflingComplete if needed
          })
          .finally(() => {
            setIsGeneratingSpread(false)
          })

        // Transition to ritual immediately
        setState({ type: 'ritualPreparing' })
      } else {
        // Intent is unclear - add AI clarification question
        const aiMessage: ChatMessage = {
          data: assessment.assistantMessage || 'Could you tell me more about what you want to know?',
          isUser: false,
          timestamp: new Date(),
          responseId: assessment.responseId,
        }
        addMessage(aiMessage)
      }
    } catch (error) {
      console.error('Failed to assess intent:', error)
      handle5xxError(error)
      setError('Failed to process your message. Please try again.')

      const errorMessage: ChatMessage = {
        data: 'I apologize, but I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle ritual completion
  const handleRitualComplete = async () => {
    if (!session) return

    setState({ type: 'shuffling' })
  }

  // Handle shuffling completion
  const handleShufflingComplete = async () => {
    if (!session) return

    // Don't generate if already generating or generated
    if (spread !== null || isGeneratingSpread) {
      console.log('[handleShufflingComplete] Spread already generated or in progress, skipping API call')
      // Wait for the early generation to complete - the useEffect will handle transition
      return
    }

    setLoading(true)

    try {
      // Generate spread (fallback if early generation didn't happen)
      console.log('[handleShufflingComplete] Calling generateSpreadSelection...')
      setIsGeneratingSpread(true)
      const spreadResult = await aiService.generateSpreadSelection({
        intentSummary: session.intention,
        timeframe: session.topic,
      })

      console.log('[handleShufflingComplete] Spread result:', spreadResult)

      // Check for spread data
      if (!spreadResult.spread) {
        throw new Error('No spread data returned')
      }

      console.log('[handleShufflingComplete] Setting spread and transitioning to picking...')
      setSpread(spreadResult.spread)

      // Shuffle the deck with the session seed
      const shuffled = riderWaiteDeckService.shuffleDeck(session.deckSeed)
      setShuffledDeck(shuffled)

      // Move to card picking
      console.log('[handleShufflingComplete] Transitioning to picking state')
      setState({ type: 'picking', currentPositionIndex: 0 })
    } catch (error) {
      console.error('[handleShufflingComplete] Error:', error)
      handle5xxError(error)
      setError('Failed to prepare your reading. Please try again.')
    } finally {
      setLoading(false)
      setIsGeneratingSpread(false)
    }
  }

  // Handle card selection
  const handleCardSelected = (cardId: string) => {
    if (state.type !== 'picking' || !spread) return

    const positionIndex = state.currentPositionIndex

    // Store the selected card
    selectCard(cardId, positionIndex)

    // Remove the picked card from the shuffled deck
    const updatedDeck = shuffledDeck.filter((id) => id !== cardId)
    setShuffledDeck(updatedDeck)

    console.log(`[Card Picked] ${cardId} removed. ${updatedDeck.length} cards remaining`)

    // Move to card reveal
    setState({ type: 'cardRevealing', cardId, currentPositionIndex: positionIndex })
  }

  // Handle card reveal confirmation
  const handleCardRevealNext = () => {
    if (state.type !== 'cardRevealing' || !spread || !session) return

    const positionIndex = state.currentPositionIndex

    // Check if there are more positions
    if (positionIndex < spread.positions.length - 1) {
      // Move to next position
      setState({ type: 'picking', currentPositionIndex: positionIndex + 1 })
    } else {
      // Last card selected! Move to waiting and generate reading
      setState({ type: 'waitingBeforeReading' })
      generateReading()
    }
  }

  // Handle clarification/follow-up questions
  const handleClarificationMessage = async (message: string) => {
    if (!session) return

    // Add user message
    const userMessage: ChatMessage = {
      data: message,
      isUser: true,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    setLoading(true)

    try {
      // Get the last AI response ID for context
      const lastResponseId = session.messages
        .filter((msg) => !msg.isUser && msg.responseId)
        .pop()?.responseId

      // Call AI service for clarification
      // Only send newly drawn cards (if any), not the original spread cards
      const clarificationResponse = await aiService.handleClarification(
        message,
        [], // Empty array - no new cards drawn yet at this point
        lastResponseId
      )

      console.log('[handleClarificationMessage] Full response:', clarificationResponse)
      console.log('[handleClarificationMessage] isFinalAnswer:', clarificationResponse.isFinalAnswer)
      console.log('[handleClarificationMessage] cards:', clarificationResponse.cards)

      // Check if AI needs more cards
      if (!clarificationResponse.isFinalAnswer && clarificationResponse.cards.length > 0) {
        // AI wants to draw clarification cards - go directly to picking without message
        console.log('[clarification] AI requests additional cards:', clarificationResponse.cards)

        // Set up clarification cards
        setClarificationCards(clarificationResponse.cards)

        // Move to clarification picking state immediately
        setState({ type: 'clarificationPicking', currentPositionIndex: 0 })
      } else {
        // Final answer - just add the message
        const aiMessage: ChatMessage = {
          data: clarificationResponse.message || 'Here is additional insight.',
          isUser: false,
          timestamp: new Date(),
          responseId: clarificationResponse.responseId,
        }
        addMessage(aiMessage)
      }
    } catch (error) {
      console.error('Failed to handle clarification:', error)
      handle5xxError(error)
      setError('Failed to process your question. Please try again.')

      const errorMessage: ChatMessage = {
        data: 'I apologize, but I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle clarification card selection
  const handleClarificationCardSelected = (cardId: string) => {
    if (state.type !== 'clarificationPicking') return

    const positionIndex = state.currentPositionIndex

    // Store the selected card
    selectClarificationCard(cardId, positionIndex)

    // Remove the picked card from the shuffled deck
    const updatedDeck = shuffledDeck.filter((id) => id !== cardId)
    setShuffledDeck(updatedDeck)

    console.log(`[Clarification Card Picked] ${cardId} removed. ${updatedDeck.length} cards remaining`)

    // Move to card reveal
    setState({ type: 'clarificationCardRevealing', cardId, currentPositionIndex: positionIndex })
  }

  // Handle clarification card reveal confirmation
  const handleClarificationCardRevealNext = () => {
    if (state.type !== 'clarificationCardRevealing' || !session) return

    const positionIndex = state.currentPositionIndex

    // Check if there are more cards to pick
    if (positionIndex < clarificationCards.length - 1) {
      // Move to next card
      setState({ type: 'clarificationPicking', currentPositionIndex: positionIndex + 1 })
    } else {
      // Last clarification card revealed! Process clarification
      setState({ type: 'clarificationProcessing' })
      processClarificationWithCards()
    }
  }

  // Process clarification with drawn cards
  const processClarificationWithCards = async () => {
    if (!session) return

    setLoading(true)

    try {
      // Get the last clarification question from messages
      const lastUserMessage = session.messages
        .filter((msg) => msg.isUser)
        .pop()
      const clarificationQuestion = typeof lastUserMessage?.data === 'string'
        ? lastUserMessage.data
        : 'Please interpret these clarification cards.'

      // Get the last AI response ID for context
      const lastResponseId = session.messages
        .filter((msg) => !msg.isUser && msg.responseId)
        .pop()?.responseId

      // Build cards array with clarification cards
      const cardsWithClarification = selectedClarificationCards.map((card, index) => {
        const cardData = riderWaiteDeckService.getCardData(card.cardId)
        const reversed = riderWaiteDeckService.isCardReversed(
          session.deckSeed,
          card.cardId,
          1000 + index // Offset to differentiate from main spread
        )

        return {
          cardId: card.cardId,
          name: cardData?.name || card.cardId,
          reversed,
          promptRole: card.promptRole,
          label: card.label,
        }
      })

      // Call AI service
      const finalResponse = await aiService.handleClarification(
        clarificationQuestion,
        cardsWithClarification,
        lastResponseId
      )

      // Render based on card count (matching Flutter implementation)
      if (!finalResponse.cards || finalResponse.cards.length === 0) {
        // No cards - render as plain text message
        const aiMessage: ChatMessage = {
          data: finalResponse.message || 'Here is the interpretation with the clarification cards.',
          isUser: false,
          timestamp: new Date(),
          responseId: finalResponse.responseId,
        }
        addMessage(aiMessage)
      } else if (finalResponse.cards.length === 1) {
        // Single card - render as CardDraw message
        const singleCard = finalResponse.cards[0]
        const cardMessage: ChatMessage = {
          data: singleCard,
          isUser: false,
          timestamp: new Date(),
          responseId: finalResponse.responseId,
        }
        addMessage(cardMessage)
      } else {
        // Multiple cards - render as ReadingMainData
        const readingData: ReadingMainData = {
          interpretation: finalResponse.message || '',
          cards: finalResponse.cards,
          advice: '', // Clarifications don't include advice
        }
        const readingMessage: ChatMessage = {
          data: readingData,
          isUser: false,
          timestamp: new Date(),
          responseId: finalResponse.responseId,
        }
        addMessage(readingMessage)
      }

      // Return to follow-ups state
      setState({ type: 'followUps' })
    } catch (error) {
      console.error('Failed to process clarification cards:', error)
      handle5xxError(error)
      setError('Failed to interpret clarification cards. Please try again.')

      // Return to follow-ups
      setState({ type: 'followUps' })
    } finally {
      setLoading(false)
    }
  }

  // Handle "Why?" explanation request
  const handleWhyRequest = async (expandedText: string): Promise<void> => {
    if (!session) return

    // Get the last AI response ID for context
    const lastResponseId = session.messages
      .filter((msg) => !msg.isUser && msg.responseId)
      .pop()?.responseId

    if (!lastResponseId) {
      console.error('No response ID found for explanation request')
      return
    }

    setLoading(true)

    try {
      // Call AI service for explanation
      const response = await aiService.requestExplanation({
        highlightedText: expandedText,
        responseId: lastResponseId,
      })

      // Create explanation message
      const explanationData: ExplanationMessageData = {
        originalText: expandedText,
        explanation: response.content,
      }

      const explanationMessage: ChatMessage = {
        data: explanationData,
        isUser: false,
        timestamp: new Date(),
        responseId: response.responseId,
      }

      addMessage(explanationMessage)
    } catch (error) {
      console.error('Failed to get explanation:', error)
      handle5xxError(error)
      setError('Failed to get explanation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Save reading to journal
  const handleSaveReading = useCallback(async () => {
    if (!session || isSaving || isSaved) return

    // Check if there's a reading to save (has ReadingMainData message)
    const hasReading = session.messages.some((msg) => isReadingMainData(msg.data))
    if (!hasReading) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intention: session.intention,
          topic: session.topic,
          deckSeed: session.deckSeed,
          messages: session.messages,
        }),
      })

      if (!response.ok) {
        // Create error object with status for 5xx detection
        const error: any = new Error('Failed to save reading')
        error.status = response.status
        throw error
      }

      setIsSaved(true)
    } catch (error) {
      console.error('Failed to save reading:', error)
      handle5xxError(error)
      setError('Failed to save reading. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [session, isSaving, isSaved, setError, handle5xxError])

  // Handle back navigation
  const handleBack = useCallback(async () => {
    if (state.type === 'followUps' && !isSaved) {
      // Auto-save before navigating away
      await handleSaveReading()
    }
    reset()
    router.push('/')
  }, [state.type, isSaved, handleSaveReading, reset, router])

  // Generate full reading from AI
  const generateReading = async () => {
    if (!session || !spread) return

    setLoading(true)

    try {
      // Build cards array with all selected cards
      const selectedCardsArray = Array.from(session.selectedCards.entries())
        .sort(([indexA], [indexB]) => indexA - indexB)
        .map(([index, cardId]) => {
          const position = spread.positions[index]
          const cardData = riderWaiteDeckService.getCardData(cardId)
          const reversed = riderWaiteDeckService.isCardReversed(
            session.deckSeed,
            cardId,
            index
          )

          return {
            cardId,
            card: cardData?.name || cardId,
            reversed,
            promptRole: position.promptRole,
            label: position.label,
          }
        })

      // Call AI service
      const readingResponse = await aiService.generateReading(
        session.intention, // intentSummary
        selectedCardsArray
      )

      if (!readingResponse.messageData) {
        throw new Error('No reading data returned')
      }

      // Parse the reading response
      const readingData: ReadingMainData = {
        interpretation: readingResponse.messageData.synthesis || '',
        advice: readingResponse.messageData.advice || '',
        cards: selectedCardsArray.map((card, index) => {
          const interpretation = readingResponse.messageData?.cards?.find(card1 => card1.cardId === card.cardId)?.interpretation || ''

          return {
            cardId: card.cardId,
            name: card.card,
            reversed: card.reversed,
            drawIndex: index,
            label: card.label,
            promptRole: card.promptRole,
            interpretation,
            generalMeaning: '', // Will be populated from card data if available
          }
        }),
      }

      // Add reading to messages
      const readingMessage: ChatMessage = {
        data: readingData,
        isUser: false,
        timestamp: new Date(),
        responseId: readingResponse.responseId,
      }
      addMessage(readingMessage)

      // Move to followUps state
      setState({ type: 'followUps' })
    } catch (error) {
      console.error('Failed to generate reading:', error)
      handle5xxError(error)
      setError('Failed to generate your reading. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Render based on state
  const renderContent = () => {
    console.log('[renderContent] Current state:', state.type)
    switch (state.type) {
      case 'idle':
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-4xl">🔮</div>
              <p className="text-lg text-foreground/70">Initializing reading...</p>
            </div>
          </div>
        )

      case 'intentCollecting':
        return (
          <div className="mx-auto h-screen max-w-4xl overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="flex-shrink-0 bg-surface-raised border-b border-primary/20 p-4 shadow-neu-raised">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBack}
                    className="rounded-neu bg-surface p-2.5 text-muted-foreground shadow-neu-raised-sm transition-all duration-200 hover:shadow-neu-inset-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    aria-label="Back to home"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div>
                    <h1 className="font-serif text-xl font-bold text-foreground">New Reading</h1>
                    <p className="text-sm text-muted-foreground">
                      Tell me what's on your mind...
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ChatInterface
                  messages={session?.messages || []}
                  onSendMessage={handleIntentMessage}
                  isLoading={isLoading}
                  placeholder="What guidance do you seek?"
                />
              </div>
            </div>
          </div>
        )

      case 'ritualPreparing':
        return <RitualInterface onComplete={handleRitualComplete} />

      case 'shuffling':
        return <ShufflingAnimation onComplete={handleShufflingComplete} />

      case 'picking':
        console.log('[renderContent] Rendering picking state. Spread:', spread)
        if (!spread) {
          console.log('[renderContent] No spread available, returning null')
          return null
        }
        const position = spread.positions[state.currentPositionIndex]
        console.log('[renderContent] Rendering CardPicker for position:', position)
        return (
          <CardPicker
            shuffledDeck={shuffledDeck}
            positionLabel={position.label}
            positionIndex={state.currentPositionIndex}
            totalPositions={spread.positions.length}
            onCardSelected={handleCardSelected}
          />
        )

      case 'cardRevealing':
        if (!spread) return null
        const revealPosition = spread.positions[state.currentPositionIndex]
        const cardData = riderWaiteDeckService.getCardData(state.cardId)
        const isReversed = riderWaiteDeckService.isCardReversed(
          session?.deckSeed || '',
          state.cardId,
          state.currentPositionIndex
        )
        return (
          <CardRevealScreen
            cardId={state.cardId}
            cardName={cardData?.name || state.cardId}
            reversed={isReversed}
            positionLabel={revealPosition.label}
            positionIndex={state.currentPositionIndex}
            totalPositions={spread.positions.length}
            onNext={handleCardRevealNext}
          />
        )

      case 'waitingBeforeReading':
        return <ReadingLoadingAnimation />

      case 'followUps':
        return (
          <div className="mx-auto h-screen max-w-4xl overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="flex-shrink-0 bg-surface-raised border-b border-primary/20 p-4 shadow-neu-raised">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleBack}
                      className="rounded-neu bg-surface p-2.5 text-muted-foreground shadow-neu-raised-sm transition-all duration-200 hover:shadow-neu-inset-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      aria-label="Back to home"
                    >
                      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div>
                      <h1 className="font-serif text-xl font-bold text-foreground">Your Reading</h1>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {session?.intention || 'Tarot Reading'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveReading}
                    disabled={isSaving || isSaved}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
                      isSaved
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-50'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="h-4 w-4" />
                        Saved
                      </>
                    ) : isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ChatInterface
                  messages={session?.messages || []}
                  onSendMessage={handleClarificationMessage}
                  isLoading={isLoading}
                  placeholder="Ask a follow-up question..."
                  showAllMessageTypes={true}
                  onWhyRequest={handleWhyRequest}
                />
              </div>
            </div>
          </div>
        )

      case 'clarificationPicking':
        if (clarificationCards.length === 0) return null
        const clarificationCard = clarificationCards[state.currentPositionIndex]
        return (
          <CardPicker
            shuffledDeck={shuffledDeck}
            positionLabel={clarificationCard.label}
            positionIndex={state.currentPositionIndex}
            totalPositions={clarificationCards.length}
            onCardSelected={handleClarificationCardSelected}
          />
        )

      case 'clarificationCardRevealing':
        if (clarificationCards.length === 0) return null
        const revealClarCard = clarificationCards[state.currentPositionIndex]
        const clarCardData = riderWaiteDeckService.getCardData(state.cardId)
        const isClarReversed = riderWaiteDeckService.isCardReversed(
          session?.deckSeed || '',
          state.cardId,
          1000 + state.currentPositionIndex
        )
        return (
          <CardRevealScreen
            cardId={state.cardId}
            cardName={clarCardData?.name || state.cardId}
            reversed={isClarReversed}
            positionLabel={revealClarCard.label}
            positionIndex={state.currentPositionIndex}
            totalPositions={clarificationCards.length}
            onNext={handleClarificationCardRevealNext}
          />
        )

      case 'clarificationProcessing':
        return <ReadingLoadingAnimation />

      default:
        return null
    }
  }

  return <div className="h-screen overflow-hidden">{renderContent()}</div>
}
