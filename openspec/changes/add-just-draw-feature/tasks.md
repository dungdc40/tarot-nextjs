# Implementation Tasks

## 1. UI Components
- [ ] 1.1 Create `CardDetailModal.tsx` component with card meaning popup UI
- [ ] 1.2 Add orientation toggle (upright/reversed) in modal
- [ ] 1.3 Display card description, keywords, and category meanings
- [ ] 1.4 Add close button and click-outside-to-close behavior
- [ ] 1.5 Apply neumorphic design system to modal

## 2. Quick Draw Page
- [ ] 2.1 Create `app/quick-draw/page.tsx` with state management
- [ ] 2.2 Implement card picking state using existing `CardPicker` component
- [ ] 2.3 Implement card reveal state using existing `CardRevealScreen` component
- [ ] 2.4 Add back button to return to home page
- [ ] 2.5 Add "Meaning" button on reveal screen to open card detail modal
- [ ] 2.6 Add "Next Card" button on reveal screen to return to picking
- [ ] 2.7 Generate random seed for deck shuffling on page mount
- [ ] 2.8 Handle card orientation (upright/reversed) using deck service

## 3. Home Page Integration
- [ ] 3.1 Add "Just Draw" button to home page hero section
- [ ] 3.2 Position button alongside existing "Start Your Reading" button
- [ ] 3.3 Use neumorphic button styling consistent with design system
- [ ] 3.4 Add appropriate icon (e.g., Sparkles or similar)
- [ ] 3.5 Ensure button is accessible without authentication

## 4. Component Modifications
- [ ] 4.1 Update `CardRevealScreen` to accept optional custom buttons via props
- [ ] 4.2 Make "Next" button text customizable (default: "Next Card")
- [ ] 4.3 Add optional `showMeaningButton` prop to `CardRevealScreen`

## 5. Testing & Polish
- [ ] 5.1 Test card picking flow end-to-end
- [ ] 5.2 Test modal opening/closing behavior
- [ ] 5.3 Test back navigation to home
- [ ] 5.4 Test "Next Card" flow (returning to picker with updated deck)
- [ ] 5.5 Verify neumorphic styling consistency
- [ ] 5.6 Test responsive behavior on mobile/tablet/desktop
- [ ] 5.7 Verify accessibility (keyboard navigation, ARIA labels)
