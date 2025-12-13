import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Tarot Reading - AI-Powered Mystical Guidance',
  description:
    'Experience personalized tarot readings with AI-powered interpretations. Explore the mystical wisdom of the Rider-Waite tarot deck.',
  keywords: ['tarot', 'tarot reading', 'AI tarot', 'divination', 'spirituality'],
  authors: [{ name: 'Tarot App' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
  openGraph: {
    title: 'Tarot Reading - AI-Powered Mystical Guidance',
    description:
      'Experience personalized tarot readings with AI-powered interpretations.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarot Reading - AI-Powered Mystical Guidance',
    description:
      'Experience personalized tarot readings with AI-powered interpretations.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Skip to main content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="skip-to-content"
        >
          Skip to main content
        </a>
        <Providers>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
