import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Sparkles, BookOpen, PenLine, Shield, Layers, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* User Menu - Top Right */}
      <div className="absolute right-6 top-6">
        <SignedIn>
          <div className="neu-card flex items-center gap-3 px-4 py-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10 shadow-neumorphic-sm',
                  userButtonPopoverCard: 'shadow-neumorphic-xl rounded-2xl',
                  userButtonPopoverActions: 'space-y-1',
                },
              }}
            />
          </div>
        </SignedIn>
        <SignedOut>
          <Link
            href="/sign-in"
            className="neu-btn-primary rounded-neu-lg px-6 py-2.5 text-sm font-semibold"
          >
            Sign In
          </Link>
        </SignedOut>
      </div>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            {/* Neumorphic Badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface-raised px-5 py-2.5 text-sm font-medium text-primary shadow-neu-raised-sm"
              role="status"
              aria-label="Welcome message"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Your Mystical Journey Awaits</span>
            </div>

            {/* Logo with neumorphic effect */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-neu-xl bg-surface-raised p-4 shadow-neu-raised">
                <Image
                  src="/icons/logo.png"
                  alt="Tarot Reading App Logo - A mystical crystal ball symbol"
                  width={80}
                  height={80}
                  className="rounded-neu-lg"
                  priority
                />
              </div>
            </div>

            {/* Title with accessible heading structure */}
            <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Find Your Inner{' '}
              <span className="text-gradient">Guidance</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Experience personalized tarot readings with AI-powered interpretations.
              Discover insights, explore the mystical wisdom of tarot, and journal your spiritual journey.
            </p>

            {/* CTA Buttons - Neumorphic style */}
            <SignedIn>
              <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/reading"
                  className="neu-btn-primary inline-flex items-center gap-2 rounded-neu-lg px-8 py-4 text-lg font-semibold"
                >
                  <span>Start Your Reading</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/quick-draw"
                  className="neu-btn inline-flex items-center gap-2 rounded-neu-lg px-8 py-4 text-lg font-semibold"
                >
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  <span>Just Draw a Card</span>
                </Link>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="neu-btn-primary inline-flex items-center gap-2 rounded-neu-lg px-8 py-4 text-lg font-semibold"
                >
                  <span>Get Started</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/decks"
                  className="neu-btn inline-flex items-center gap-2 rounded-neu-lg px-8 py-4 text-lg font-semibold"
                >
                  Explore Cards
                </Link>
              </div>
            </SignedOut>

            {/* Trust Badges - Neumorphic pills */}
            <div
              className="flex flex-wrap items-center justify-center gap-4 text-sm"
              role="list"
              aria-label="App features"
            >
              <div
                className="neu-badge gap-2"
                role="listitem"
              >
                <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-foreground">AI-Powered Insights</span>
              </div>
              <div
                className="neu-badge gap-2"
                role="listitem"
              >
                <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-foreground">78 Card Deck</span>
              </div>
              <div
                className="neu-badge gap-2"
                role="listitem"
              >
                <PenLine className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-foreground">Personal Journal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Neumorphic cards */}
      <section
        className="bg-surface-sunken px-6 py-16 md:py-24"
        aria-labelledby="features-heading"
      >
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <div className="neu-badge mb-4">
              <span className="text-primary">Features</span>
            </div>
            <h2
              id="features-heading"
              className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl"
            >
              Tools for Your <span className="text-gradient">Spiritual Journey</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Everything you need to explore tarot, all in one calming space.
            </p>
          </div>

          {/* Feature Cards - Neumorphic interactive */}
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/reading"
              className="neu-card-interactive group cursor-pointer"
              aria-label="Start a new tarot reading session"
            >
              <div
                className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-neu bg-surface-sunken shadow-neu-inset-sm"
                aria-hidden="true"
              >
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                New Reading
              </h3>
              <p className="text-muted-foreground">
                Start a personalized AI-powered tarot reading session tailored to your questions.
              </p>
            </Link>

            <Link
              href="/decks"
              className="neu-card-interactive group cursor-pointer"
              aria-label="Browse and explore tarot card decks"
            >
              <div
                className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-neu bg-surface-sunken shadow-neu-inset-sm"
                aria-hidden="true"
              >
                <Layers className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                Explore Decks
              </h3>
              <p className="text-muted-foreground">
                Browse and learn about all 78 tarot cards and their rich symbolism.
              </p>
            </Link>

            <Link
              href="/journal"
              className="neu-card-interactive group cursor-pointer"
              aria-label="View your reading journal and past sessions"
            >
              <div
                className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-neu bg-surface-sunken shadow-neu-inset-sm"
                aria-hidden="true"
              >
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                Reading Journal
              </h3>
              <p className="text-muted-foreground">
                Review your past readings, track patterns, and reflect on your insights.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Neumorphic raised */}
      <footer
        className="bg-surface-raised px-6 py-8 shadow-neu-raised"
        role="contentinfo"
      >
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-neu bg-surface shadow-neu-raised-sm p-2">
              <Image
                src="/icons/logo.png"
                alt=""
                width={28}
                height={28}
                className="rounded-lg"
                aria-hidden="true"
              />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Tarot Reading</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by AI • Rider-Waite Tarot Deck
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tarot Reading. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
