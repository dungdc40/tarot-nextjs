# user-experience Specification

## Purpose
TBD - created by archiving change add-followup-chat-tip. Update Purpose after archive.
## Requirements
### Requirement: Follow-up Chat Tip Notification
The system SHALL display a one-time educational tip to users when they send 3 follow-up messages during the clarification phase of a reading session. The tip SHALL guide users to open new reading sessions for new concerns while maintaining a polite, mystical tone appropriate for tarot readings.

#### Scenario: Tip appears after 3rd follow-up message
- **WHEN** user is in the followUps state AND has sent exactly 3 user messages AND the tip has not been shown before
- **THEN** a modal popup displays with the message "The cards speak clearest to one question at a time. If you have a new concern to explore, consider opening a new reading session to receive the most focused guidance."

#### Scenario: Tip does not appear if already shown
- **WHEN** user is in the followUps state AND has sent 3 or more user messages AND the tip has been shown before (tipsShown.followupChatTip is true)
- **THEN** the tip modal does not appear

#### Scenario: User dismisses tip
- **WHEN** user clicks the "Ok" button on the tip modal
- **THEN** the modal closes AND an API call updates the database to set tipsShown.followupChatTip to true AND the tip will never appear again for this user

#### Scenario: Tip is dismissed with keyboard
- **WHEN** user presses ESC key or uses Enter/Space on the "Ok" button while tip modal is focused
- **THEN** the modal closes AND the database is updated (same as clicking "Ok")

### Requirement: Tip State Persistence
The system SHALL persist tip display states in the database using a User table with a JSON column to track which tips have been shown to each user across all reading sessions.

#### Scenario: Store tip state in User table
- **WHEN** user dismisses a tip notification
- **THEN** the system upserts a User record keyed by Clerk userId AND updates the User.tipsShown JSON field with {followupChatTip: true}

#### Scenario: Handle non-existent User record
- **WHEN** checking if a tip has been shown AND no User record exists for the userId
- **THEN** the system treats this as no tips have been shown (default state)

#### Scenario: Handle null tipsShown field
- **WHEN** User record exists but tipsShown field is null or undefined
- **THEN** the system treats this as no tips have been shown (default state)

#### Scenario: Extensible tip tracking per user
- **WHEN** new tip types are added in the future
- **THEN** they can be added to the User.tipsShown JSON object without schema migration (e.g., {followupChatTip: true, anotherTip: false})

#### Scenario: User record is lazily created
- **WHEN** a new user dismisses their first tip AND no User record exists
- **THEN** the system creates a new User record with id=Clerk userId and tipsShown={followupChatTip: true}

### Requirement: Tip Modal Accessibility
The system SHALL ensure the tip modal is accessible to all users including keyboard-only users and screen reader users.

#### Scenario: Modal has proper focus management
- **WHEN** the tip modal opens
- **THEN** focus moves to the modal AND focus is trapped within the modal until dismissed

#### Scenario: Modal supports keyboard navigation
- **WHEN** user interacts with modal using keyboard
- **THEN** ESC key dismisses modal AND Tab/Shift+Tab navigate within modal AND Enter/Space on "Ok" button dismisses modal

#### Scenario: Modal has ARIA labels
- **WHEN** screen reader user encounters the tip modal
- **THEN** the modal has role="dialog" AND aria-labelledby pointing to title AND aria-describedby pointing to content

### Requirement: Tip API Endpoint
The system SHALL provide an API endpoint to upsert User records and update tip state with proper authentication and validation.

#### Scenario: Authenticated user updates tip state
- **WHEN** authenticated user sends PATCH request to /api/user/update-tip-state with tipType
- **THEN** the system upserts the User record using Clerk userId AND updates the tipsShown field AND returns success response

#### Scenario: Unauthenticated request is rejected
- **WHEN** unauthenticated user attempts to update tip state
- **THEN** the system returns 401 Unauthorized error

#### Scenario: Create User record on first tip dismissal
- **WHEN** authenticated user dismisses a tip AND no User record exists for their userId
- **THEN** the system creates a new User record with id=Clerk userId and appropriate tipsShown state

#### Scenario: Update existing User record
- **WHEN** authenticated user dismisses a tip AND User record already exists
- **THEN** the system updates the existing User record's tipsShown field

### Requirement: Graceful Error Handling
The system SHALL handle API failures gracefully when updating tip state without blocking the user's reading experience.

#### Scenario: API call fails during tip dismissal
- **WHEN** tip dismissal API call fails (network error, server error, etc.)
- **THEN** the modal still closes AND error is logged to console AND user can continue their reading session AND tip may reappear in future sessions

#### Scenario: Database is temporarily unavailable
- **WHEN** attempting to update tip state AND database connection fails
- **THEN** the system logs the error AND returns 500 error to client AND modal still closes on frontend

### Requirement: Follow-up Message Counting
The system SHALL accurately count user messages sent during the followUps state to determine when to display the tip. Follow-up messages are defined as user messages sent AFTER the reading (ReadingMainData message) has been generated.

#### Scenario: Count only user messages after ReadingMainData
- **WHEN** counting messages for tip trigger
- **THEN** the system:
  1. Finds the first message in session.messages with data type ReadingMainData (using isReadingMainData type guard)
  2. Gets the index of that reading message
  3. Counts only user messages (isUser === true AND typeof data === 'string') that appear AFTER the reading message index and stores in userFollowupMessageCount
  4. Does NOT count intent collection messages or any messages before the reading

#### Scenario: Messages from intentCollecting phase are not counted
- **WHEN** user sends messages during intentCollecting state (before reading is generated)
- **THEN** those messages do NOT count toward the 3-message threshold for the tip
- **BECAUSE** followUps phase only begins after the ReadingMainData message is added to session

#### Scenario: Explanation messages (Why feature) are excluded
- **WHEN** counting user followup messages
- **THEN** messages with ExplanationMessageData type are NOT counted as user messages
- **BECAUSE** these are AI-generated explanations, not user questions

#### Scenario: Reset count on new session
- **WHEN** user starts a new reading session
- **THEN** the follow-up message counter resets to zero

