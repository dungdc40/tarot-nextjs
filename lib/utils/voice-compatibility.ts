// Voice Compatibility Utilities
// Detect browser support for WebRTC and voice features

export interface CompatibilityCheck {
  isSupported: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Check if the browser supports all required voice features
 */
export function checkVoiceCompatibility(): CompatibilityCheck {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for WebRTC support
  if (!window.RTCPeerConnection) {
    errors.push('Your browser does not support WebRTC, which is required for voice readings.')
  }

  // Check for MediaDevices API
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errors.push('Your browser does not support microphone access (MediaDevices API).')
  }

  // Check for AudioContext (optional but recommended)
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    warnings.push('Your browser has limited audio support. You may experience audio quality issues.')
  }

  // Check if running in a secure context (HTTPS or localhost)
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
    errors.push('Voice features require a secure connection (HTTPS).')
  }

  return {
    isSupported: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get a user-friendly error message for compatibility issues
 */
export function getCompatibilityErrorMessage(check: CompatibilityCheck): string {
  if (check.isSupported) {
    return ''
  }

  let message = 'Voice reading is not available in your browser:\n\n'

  check.errors.forEach((error, index) => {
    message += `${index + 1}. ${error}\n`
  })

  message += '\nRecommendations:\n'
  message += '• Use a modern browser (Chrome, Firefox, Safari, Edge)\n'
  message += '• Ensure you\'re using the latest browser version\n'
  message += '• Try accessing the site via HTTPS\n'

  return message
}

/**
 * Request microphone permission and check if it's granted
 */
export async function requestMicrophonePermission(): Promise<{
  granted: boolean
  error?: string
}> {
  try {
    // Request permission by attempting to access the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Stop all tracks immediately (we just wanted to check permission)
    stream.getTracks().forEach(track => track.stop())

    return { granted: true }
  } catch (error) {
    console.error('[Voice Compatibility] Microphone permission error:', error)

    let errorMessage = 'Microphone access denied.'

    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Your microphone is already in use by another application.'
      } else {
        errorMessage = `Microphone error: ${error.message}`
      }
    }

    return {
      granted: false,
      error: errorMessage,
    }
  }
}
