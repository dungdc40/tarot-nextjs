'use client'

// PanningBackground - Animated two-layer background system
// Features:
// - Crossfade transitions between 4 background images
// - Horizontal panning animation (50px/sec, max 10s duration)
// - Configurable overlay opacity and blur
// - Uses Framer Motion for smooth animations

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface PanningBackgroundProps {
  overlayOpacity?: number // 0-1, default 0.85
  overlayBlur?: number // pixels, default 8
  transitionInterval?: number // milliseconds, default 10000 (10s)
}

const BACKGROUND_IMAGES = [
  '/images/backgrounds/tarot_bg1.webp',
  '/images/backgrounds/tarot_bg2.webp',
  '/images/backgrounds/tarot_bg3.png',
  '/images/backgrounds/tarot_bg4.webp',
]

const PANNING_SPEED = 50 // pixels per second
const MAX_PANNING_DURATION = 10 // seconds

export function PanningBackground({
  overlayOpacity = 0.85,
  overlayBlur = 8,
  transitionInterval = 10000,
}: PanningBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length)
      setNextIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length)
    }, transitionInterval)

    return () => clearInterval(interval)
  }, [transitionInterval])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background Layer 1 (Current) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <motion.div
            className="relative h-full w-full"
            animate={{
              x: [-25, 25], // Pan 50px total (50px/sec * 1s = 50px in 1s, stretched to 10s)
            }}
            transition={{
              duration: MAX_PANNING_DURATION,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          >
            <Image
              src={BACKGROUND_IMAGES[currentIndex]}
              alt="Tarot background"
              fill
              className="object-cover"
              priority={currentIndex === 0}
              quality={90}
              sizes="100vw"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Background Layer 2 (Next - for crossfade preview) */}
      <motion.div
        key={`bg-next-${nextIndex}`}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        style={{ pointerEvents: 'none' }}
      >
        <Image
          src={BACKGROUND_IMAGES[nextIndex]}
          alt="Tarot background next"
          fill
          className="object-cover"
          quality={90}
          sizes="100vw"
        />
      </motion.div>

      {/* Overlay with blur */}
      <div
        className="absolute inset-0 bg-background"
        style={{
          opacity: overlayOpacity,
          backdropFilter: `blur(${overlayBlur}px)`,
          WebkitBackdropFilter: `blur(${overlayBlur}px)`,
        }}
      />
    </div>
  )
}
