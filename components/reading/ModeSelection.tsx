'use client'

// Mode Selection - Choose between text chat and voice reading
// Shown at start of reading flow

import { useRouter } from 'next/navigation'
import { MessageSquare, Mic } from 'lucide-react'

export function ModeSelection() {
  const router = useRouter()

  const handleTextMode = () => {
    router.push('/reading/text')
  }

  const handleVoiceMode = () => {
    router.push('/reading/voice')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Reading Mode
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select how you'd like to experience your tarot reading
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Text Chat Mode */}
          <button
            onClick={handleTextMode}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-left hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Text Chat
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Type your questions and receive detailed written interpretations. Perfect for reflection and saving your reading.
              </p>

              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2 w-full">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save and review later
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Detailed explanations
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Works anywhere
                </li>
              </ul>
            </div>
          </button>

          {/* Voice Mode */}
          <button
            onClick={handleVoiceMode}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-left hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Voice Reading
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Speak naturally with the AI for an immersive, conversational tarot experience. Like talking to a real reader.
              </p>

              <ul className="text-sm text-gray-500 dark:text-gray-500 space-y-2 w-full">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Natural conversation
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Hands-free experience
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Immersive and intuitive
                </li>
              </ul>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
