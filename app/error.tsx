'use client'

// Error Boundary - Catches runtime errors in the app
// Must be a Client Component

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 text-7xl">⚠️</div>
        <h2 className="mb-4 text-3xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="mb-8 text-foreground/70">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
