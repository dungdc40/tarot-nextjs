'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface FollowupChatTipModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FollowupChatTipModal({ isOpen, onClose }: FollowupChatTipModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when modal opens
      closeButtonRef.current?.focus()

      // Handle ESC key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      // Trap focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (!focusableElements || focusableElements.length === 0) return

          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTabKey)

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTabKey)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
      aria-describedby="tip-modal-description"
    >
      {/* Transparent Backdrop */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Modal Content - Neumorphic Style */}
      <div
        ref={modalRef}
        className="relative bg-gradient-to-br from-background via-surface-raised to-background rounded-2xl shadow-neu-raised max-w-md w-full border border-primary/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decoration */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title with icon */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shadow-neu-inset-sm">
              <span className="text-2xl">✨</span>
            </div>
            <h2
              id="tip-modal-title"
              className="text-xl font-semibold text-foreground flex-1"
            >
              Reading Guidance
            </h2>
          </div>

          {/* Message */}
          <p
            id="tip-modal-description"
            className="text-muted-foreground leading-relaxed text-base"
          >
            The cards speak clearest to one concern at a time. If you have a new one to explore,
            consider opening a new reading session to receive the most focused guidance.
          </p>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-neu shadow-neu-btn transition-all duration-200 hover:shadow-neu-raised focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              I Understand
            </button>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      </div>
    </div>
  )
}
