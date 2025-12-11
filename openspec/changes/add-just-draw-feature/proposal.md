# Add Just Draw Feature

## Why
Users want a quick, casual way to draw single tarot cards without going through the full reading ritual flow. This feature provides immediate access to card insights for daily guidance or simple questions without requiring authentication or a multi-card spread.

## What Changes
- Add new "Just Draw" feature accessible from home page without authentication
- Create card picking screen that allows single card selection from shuffled deck
- Add card reveal screen with "Meaning" button to show card details in popup
- Add "Next Card" button to return to picking screen for another draw
- Add back button on picking screen to return to home
- Reuse existing `CardPicker` and `CardRevealScreen` components
- Create new card detail popup component (similar to deck card detail but as modal)

## Impact
- **Affected specs**: New `quick-draw` capability
- **Affected code**:
  - Home page: `app/page.tsx` - Add "Just Draw" button
  - New page: `app/quick-draw/page.tsx` (new) - Card picking and reveal flow
  - New component: `components/quick-draw/CardDetailModal.tsx` (new) - Card meaning popup
  - Existing components reused: `components/reading/CardPicker.tsx`, `components/reading/CardRevealScreen.tsx`
  - Services: `lib/services/RiderWaiteDeckService.ts` - Already supports shuffling and card data
- **Non-breaking**: Feature is additive and does not require authentication
