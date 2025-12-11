/**
 * Utility functions for generating card image paths.
 *
 * The card images are organized in folders by suit:
 * - /public/images/cards/major_arcana/
 * - /public/images/cards/wands/
 * - /public/images/cards/cups/
 * - /public/images/cards/swords/
 * - /public/images/cards/pentacles/
 * - /public/images/cards/background/ (card back image)
 */

/**
 * Get the folder name for a given card ID.
 * Examples:
 * - "RW-00-FOOL" → "major_arcana"
 * - "RW-ACE-WANDS" → "wands"
 * - "RW-KING-CUPS" → "cups"
 */
export function getCardFolderName(cardId: string): string {
  const upperCardId = cardId.toUpperCase()

  if (upperCardId.includes('WANDS')) {
    return 'wands'
  } else if (upperCardId.includes('CUPS')) {
    return 'cups'
  } else if (upperCardId.includes('SWORDS')) {
    return 'swords'
  } else if (upperCardId.includes('PENTACLES')) {
    return 'pentacles'
  } else {
    // Major Arcana (RW-00 to RW-21)
    return 'major_arcana'
  }
}

/**
 * Get the full image path for a given card ID.
 * Returns a path relative to /public/
 *
 * Examples:
 * - "RW-00-FOOL" → "/images/cards/major_arcana/RW-00-FOOL.png"
 * - "RW-ACE-WANDS" → "/images/cards/wands/RW-ACE-WANDS.png"
 */
export function getCardImagePath(cardId: string): string {
  const folder = getCardFolderName(cardId)
  return `/images/cards/${folder}/${cardId}.png`
}

/**
 * Get the card back image path.
 * This is the image shown when a card is face-down.
 */
export function getCardBackImagePath(): string {
  return '/images/cards/background.png'
}

/**
 * Preload a card image for better performance.
 * Useful when you know a card will be displayed soon.
 */
export function preloadCardImage(cardId: string): void {
  const img = new Image()
  img.src = getCardImagePath(cardId)
}

/**
 * Preload multiple card images.
 */
export function preloadCardImages(cardIds: string[]): void {
  cardIds.forEach(preloadCardImage)
}
