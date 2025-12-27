// Voice Reading Page - Voice-based tarot reading mode
// Uses OpenAI Realtime API for conversational readings

import { VoiceReadingClientWrapper } from './VoiceReadingClientWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voice Reading | Tarot Reading',
  description: 'Experience a conversational tarot reading with voice interaction',
}

export default function VoiceReadingPage() {
  return <VoiceReadingClientWrapper />
}
