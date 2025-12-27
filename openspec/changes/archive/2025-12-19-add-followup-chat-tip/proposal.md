# Add Follow-up Chat Tip Notification

## Why

Users engaging in the follow-up (clarification) phase sometimes continue lengthy conversations within a single reading session that was designed for one focused question. This can lead to confusion as the AI's context becomes diluted and the reading loses its original focus. We need to gently guide users toward opening new sessions when they have new concerns, while respecting those who genuinely need extended clarification on their original question.

A well-timed tip that appears after 3 follow-up messages will help users understand the intended design pattern while maintaining a polite, mystical tone appropriate for a tarot reading experience.

## What Changes

### Core Changes
- Add popup notification system that displays a tip after user sends 3 follow-up messages during the clarification phase
- Track tip display state persistently in the database to ensure it only appears once per user
- Create a new JSONB column in the JournalEntry table to store tip-related user preferences/states
- Design the tip message to be polite, professional, and thematically aligned with tarot reading context
- Implement "Ok" button to dismiss the popup and record that the tip has been shown

### User Experience
- Tip message: "The cards speak clearest to one concern at a time. If you have a new one to explore, consider opening a new reading session to receive the most focused guidance."
- Popup appears only during `followUps` state after exactly 3 user messages
- Dismissing the popup sets a permanent flag in the database
- Non-intrusive modal overlay with mystical styling consistent with app theme

### Database Schema
- Create new `User` table to store user-specific preferences and states
- User table fields:
  - `id` (String, Primary Key) - Clerk user ID
  - `tipsShown` (JSON/JSONB type) - Tracks which tips have been shown
  - `createdAt` (DateTime) - Timestamp of user record creation
  - `updatedAt` (DateTime) - Timestamp of last update
- `tipsShown` structure: `{ "followupChatTip": boolean }` (extensible for future tips)
- This allows tracking multiple tip states per user without schema migrations for each new tip
- User record is created on first reading session or first tip dismissal (lazy initialization)

### Technical Approach
- Count user messages in current session during `followUps` state
- Query `User` table by Clerk userId to check `tipsShown.followupChatTip` flag before displaying
- Modal component with backdrop, centered card, and single action button
- Update database via API endpoint when user dismisses tip (upsert User record if needed)
- Graceful degradation if database update fails (tip won't show again in current session but may reappear in future sessions)

## Impact

**Affected specs:**
- `specs/user-experience/spec.md` (NEW) - Add tip notification requirements

**Affected code:**
- `prisma/schema.prisma` - Create new User model with tipsShown JSON field
- `app/reading/page.tsx` - Add tip display logic during followUps state (fetch User record)
- `components/reading/FollowupChatTipModal.tsx` (NEW) - Modal component
- `app/api/user/update-tip-state/route.ts` (NEW) - API endpoint to upsert User record and update tip state
- `types/user.ts` (NEW) - Add type definitions for User and tip state

**Migration considerations:**
- User records are lazily created (on first tip dismissal or explicit initialization)
- Non-existent User records are treated as no tips shown (default state)
- Non-breaking change: tip system is purely additive
- Database migration required to create new User table
- No impact on existing JournalEntry records
