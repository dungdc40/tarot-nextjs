'use client'

// Client wrapper for Voice Reading Interface
// This component is necessary because dynamic imports with ssr: false
// can only be used in Client Components

import dynamic from 'next/dynamic'

// Dynamically import VoiceReadingInterface with SSR disabled
// This prevents hydration errors since the component uses browser-only APIs
const VoiceReadingInterface = dynamic(
  () => import('@/components/voice/VoiceReadingInterface').then(mod => ({ default: mod.VoiceReadingInterface })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Loading voice interface...
          </p>
        </div>
      </div>
    ),
  }
)

export function VoiceReadingClientWrapper() {
  return <VoiceReadingInterface />
}
