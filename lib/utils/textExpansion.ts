/**
 * Text Expansion Utilities for the "Why?" feature
 * Expands user text selections to complete sentences/meaningful chunks
 */

const MIN_EXPANDED_LENGTH = 20

/**
 * Expands the selected text to include complete sentences or meaningful chunks.
 * Ensures the expanded text is at least 20 characters long.
 */
export function expandSelection(fullText: string, start: number, end: number): string {
  const selectedText = fullText.substring(start, end)

  // If selection is already long enough, return as-is
  if (selectedText.length >= MIN_EXPANDED_LENGTH) {
    return selectedText
  }

  // Try to expand to complete sentences first
  const sentenceExpanded = expandToCompleteSentences(fullText, start, end)
  if (sentenceExpanded.length >= MIN_EXPANDED_LENGTH) {
    return sentenceExpanded
  }

  // If sentence expansion isn't enough, expand to word boundaries
  const wordExpanded = expandToWordBoundaries(fullText, start, end)
  if (wordExpanded.length >= MIN_EXPANDED_LENGTH) {
    return wordExpanded
  }

  // Last resort: expand character by character until we reach minimum length
  return expandToMinimumLength(fullText, start, end)
}

/**
 * Expands selection to include complete sentences
 */
function expandToCompleteSentences(fullText: string, selStart: number, selEnd: number): string {
  let start = selStart
  let end = selEnd

  // Expand backwards to find sentence start
  while (start > 0) {
    const char = fullText[start - 1]
    if (char === '.' || char === '!' || char === '?') {
      // Found sentence end, stop here
      break
    }
    start--
  }

  // Expand forwards to find sentence end
  while (end < fullText.length) {
    const char = fullText[end]
    if (char === '.' || char === '!' || char === '?') {
      end++
      break
    }
    end++
  }

  return fullText.substring(start, end).trim()
}

/**
 * Expands selection to word boundaries
 */
function expandToWordBoundaries(fullText: string, selStart: number, selEnd: number): string {
  let start = selStart
  let end = selEnd

  // Expand backwards to word start
  while (start > 0 && fullText[start - 1] !== ' ' && fullText[start - 1] !== '\n') {
    start--
  }

  // Expand forwards to word end
  while (end < fullText.length && fullText[end] !== ' ' && fullText[end] !== '\n') {
    end++
  }

  return fullText.substring(start, end).trim()
}

/**
 * Expands character by character until minimum length is reached
 */
function expandToMinimumLength(fullText: string, selStart: number, selEnd: number): string {
  let start = selStart
  let end = selEnd

  // Expand symmetrically from both ends
  while (end - start < MIN_EXPANDED_LENGTH && (start > 0 || end < fullText.length)) {
    if (start > 0) {
      start--
    }
    if (end < fullText.length && end - start < MIN_EXPANDED_LENGTH) {
      end++
    }
  }

  return fullText.substring(start, end).trim()
}

/**
 * Checks if the text is meaningful for explanation
 */
export function isMeaningfulForExplanation(text: string): boolean {
  const trimmed = text.trim()

  // Must be at least minimum length
  if (trimmed.length < MIN_EXPANDED_LENGTH) {
    return false
  }

  // Must not be only whitespace or punctuation
  if (/^[\s.,!?\-_]+$/.test(trimmed)) {
    return false
  }

  // Must contain at least some alphabetic characters
  if (!/[a-zA-Z]/.test(trimmed)) {
    return false
  }

  return true
}
