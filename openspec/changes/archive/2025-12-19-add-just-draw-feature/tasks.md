# Implementation Tasks

## 1. UI Components
- [x] 1.1 Create `CardDetailModal.tsx` component with card meaning popup UI
- [x] 1.2 Add orientation toggle (upright/reversed) in modal
- [x] 1.3 Display card description, keywords, and category meanings
- [x] 1.4 Add close button and click-outside-to-close behavior
- [x] 1.5 Apply neumorphic design system to modal

## 2. Quick Draw Page
- [x] 2.1 Create `app/quick-draw/page.tsx` with state management
- [x] 2.2 Implement card picking state using existing `CardPicker` component
- [x] 2.3 Implement card reveal state using existing `CardRevealScreen` component
- [x] 2.4 Add back button to return to home page
- [x] 2.5 Add "Meaning" button on reveal screen to open card detail modal
- [x] 2.6 Add "Next Card" button on reveal screen to return to picking
- [x] 2.7 Generate random seed for deck shuffling on page mount
- [x] 2.8 Handle card orientation (upright/reversed) using deck service

## 3. Home Page Integration
- [x] 3.1 Add "Just Draw" button to home page hero section
- [x] 3.2 Position button alongside existing "Start Your Reading" button
- [x] 3.3 Use neumorphic button styling consistent with design system
- [x] 3.4 Add appropriate icon (e.g., Sparkles or similar)
- [x] 3.5 Ensure button is accessible without authentication

## 4. Component Modifications
- [x] 4.1 Update `CardRevealScreen` to accept optional custom buttons via props
- [x] 4.2 Make "Next" button text customizable (default: "Next Card")
- [x] 4.3 Add optional `showMeaningButton` prop to `CardRevealScreen`

## 5. Testing & Polish
- [x] 5.1 Test card picking flow end-to-end
- [x] 5.2 Test modal opening/closing behavior
- [x] 5.3 Test back navigation to home
- [x] 5.4 Test "Next Card" flow (returning to picker with updated deck)
- [x] 5.5 Verify neumorphic styling consistency
- [x] 5.6 Test responsive behavior on mobile/tablet/desktop
- [x] 5.7 Verify accessibility (keyboard navigation, ARIA labels)
