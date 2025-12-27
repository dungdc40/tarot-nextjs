// useVoiceSession Hook - React hook for managing voice reading sessions
// Handles token fetching, connection lifecycle, and cleanup

import { useEffect, useState, useCallback, useRef } from 'react'
import { getVoiceSessionManager } from '@/lib/services/VoiceSessionManager'
import { useVoiceReadingStore, useVoiceConnectionStatus } from '@/lib/stores/voiceReadingStore'
import type { VoiceConnectionStatus } from '@/types'

interface UseVoiceSessionOptions {
  maxSessionDuration?: number // Max session duration in seconds
}

interface UseVoiceSessionReturn {
  connectionStatus: VoiceConnectionStatus
  error: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sessionDuration: number
}

/**
 * React hook for managing voice reading sessions
 *
 * Handles:
 * - Ephemeral token fetching
 * - Session connection/disconnection
 * - Automatic cleanup on unmount
 * - Session duration tracking
 *
 * @example
 * ```tsx
 * const { isConnected, error, disconnect } = useVoiceSession()
 * ```
 */
export function useVoiceSession(options: UseVoiceSessionOptions = {}): UseVoiceSessionReturn {
  const { maxSessionDuration = 1800 } = options

  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectionStatus = useVoiceConnectionStatus()
  const sessionManager = useRef(getVoiceSessionManager())
  const durationInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const connectionAttemptInProgress = useRef(false)

  const store = useVoiceReadingStore()

  /**
   * Fetch ephemeral token from backend
   */
  const fetchToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/voice/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Token fetch failed: ${response.status}`)
      }

      const data = await response.json()
      return data.token
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch voice token')
    }
  }

  /**
   * Connect to voice session
   */
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
      console.log('[useVoiceSession] Skipping connect - already connected or connecting')
      return
    }

    if (connectionAttemptInProgress.current) {
      console.log('[useVoiceSession] Skipping connect - connection attempt already in progress')
      return
    }

    try {
      connectionAttemptInProgress.current = true
      setIsConnecting(true)
      setError(null)

      console.log('[useVoiceSession] Starting connection - fetching token')
      const token = await fetchToken()

      console.log('[useVoiceSession] Token received, connecting to session')
      await sessionManager.current.connect(token)

      // Start duration tracking
      startDurationTracking()

      console.log('[useVoiceSession] Connection successful')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect'
      console.error('[useVoiceSession] Connection failed:', errorMessage)
      setError(errorMessage)
      store.setError(errorMessage)
    } finally {
      connectionAttemptInProgress.current = false
      setIsConnecting(false)
    }
  }, [connectionStatus, store])

  /**
   * Disconnect from voice session
   */
  const disconnect = useCallback(async () => {
    try {
      // Stop duration tracking
      stopDurationTracking()

      await sessionManager.current.disconnect()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect'
      setError(errorMessage)
    }
  }, [])

  /**
   * Start tracking session duration
   */
  const startDurationTracking = () => {
    stopDurationTracking() // Clear any existing interval

    let duration = 0
    durationInterval.current = setInterval(() => {
      duration += 1
      store.updateSessionDuration(duration)

      // Force disconnect at max duration
      if (duration >= maxSessionDuration) {
        disconnect()
      }
    }, 1000)
  }

  /**
   * Stop tracking session duration
   */
  const stopDurationTracking = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current)
      durationInterval.current = undefined
    }
  }

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopDurationTracking()
      if (sessionManager.current.isConnected()) {
        disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount/unmount

  return {
    connectionStatus,
    error,
    isConnected: connectionStatus === 'connected',
    isConnecting: isConnecting || connectionStatus === 'connecting',
    connect,
    disconnect,
    sessionDuration: store.sessionDuration,
  }
}
