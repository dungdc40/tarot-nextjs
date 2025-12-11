'use client'

// React Query Provider - Wraps the app for server state management
// This component must be a Client Component due to useState

import { ClerkProvider } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
import { ToastProvider } from '@/lib/contexts/ToastContext'
import { ToastContainer } from '@/components/Toast'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create a client inside the component to ensure it's created once per request
  // and not shared between different users
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default query options
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Default mutation options
            retry: 0,
          },
        },
      })
  )

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
          <ToastContainer />
          {/* Only show DevTools in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools
              initialIsOpen={false}
              position="bottom"
              buttonPosition="bottom-right"
            />
          )}
        </ToastProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
