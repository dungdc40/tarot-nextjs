# quick-draw Specification

## Purpose
TBD - created by archiving change add-just-draw-feature. Update Purpose after archive.
## Requirements
### Requirement: Quick Card Draw Access
The system SHALL provide a "Just Draw" feature accessible from the home page without requiring authentication, allowing users to draw single tarot cards for quick guidance.

#### Scenario: Access from home page
- **WHEN** user views the home page
- **THEN** a "Just Draw" button is displayed alongside "Start Your Reading"
- **AND** the button is accessible without signing in

#### Scenario: Navigate to quick draw
- **WHEN** user clicks "Just Draw" button
- **THEN** user is navigated to `/quick-draw` page
- **AND** card picking screen is displayed

### Requirement: Card Picking Interface
The system SHALL present a card picking interface that allows users to select a single card from a shuffled deck.

#### Scenario: Display shuffled deck
- **WHEN** user accesses quick draw page
- **THEN** the full 78-card deck is shuffled using a random seed
- **AND** cards are displayed face-down in a scrollable carousel
- **AND** user can scroll and select any card

#### Scenario: Back navigation
- **WHEN** user is on card picking screen
- **THEN** a back button is displayed in the top-left corner
- **AND** clicking back button returns user to home page

#### Scenario: Select card
- **WHEN** user clicks on a face-down card
- **THEN** card is highlighted as selected
- **AND** "Confirm Selection" button becomes enabled
- **WHEN** user confirms selection
- **THEN** user is navigated to card reveal screen

### Requirement: Card Reveal with Actions
The system SHALL reveal the selected card with options to view detailed meanings or draw another card.

#### Scenario: Reveal selected card
- **WHEN** card is revealed
- **THEN** card flips from back to front with animation
- **AND** card name and orientation (upright/reversed) are displayed
- **AND** card orientation is determined by deck service

#### Scenario: View card meaning
- **WHEN** card is fully revealed
- **THEN** "Meaning" button is displayed
- **WHEN** user clicks "Meaning" button
- **THEN** card detail modal opens showing full card information

#### Scenario: Draw another card
- **WHEN** card is fully revealed
- **THEN** "Next Card" button is displayed
- **WHEN** user clicks "Next Card" button
- **THEN** user returns to card picking screen
- **AND** selected card is removed from available cards
- **AND** remaining cards can be selected

### Requirement: Card Detail Modal
The system SHALL display card meanings and interpretations in a modal popup with similar content to the deck card detail screen.

#### Scenario: Display card information
- **WHEN** card detail modal opens
- **THEN** modal displays card image, name, and orientation
- **AND** modal shows orientation toggle (upright/reversed)
- **AND** modal shows description, keywords, and category meanings
- **AND** modal uses neumorphic design system styling

#### Scenario: Toggle orientation
- **WHEN** user clicks orientation toggle button
- **THEN** displayed meanings update to show upright or reversed interpretations
- **AND** keywords update accordingly
- **AND** category meanings update accordingly

#### Scenario: Close modal
- **WHEN** modal is open
- **THEN** close button (X) is displayed in top-right corner
- **AND** clicking close button closes the modal
- **AND** clicking outside modal area closes the modal
- **AND** pressing Escape key closes the modal

### Requirement: Component Reusability
The system SHALL reuse existing card picking and reveal components from the reading flow for consistency.

#### Scenario: Reuse CardPicker component
- **WHEN** displaying card picking screen
- **THEN** `CardPicker` component from reading flow is used
- **AND** component receives shuffled deck and handles selection
- **AND** component displays without position context (single card)

#### Scenario: Reuse CardRevealScreen component
- **WHEN** revealing selected card
- **THEN** `CardRevealScreen` component from reading flow is used
- **AND** component is configured to show custom action buttons
- **AND** component shows "Meaning" and "Next Card" buttons instead of default "Next"

