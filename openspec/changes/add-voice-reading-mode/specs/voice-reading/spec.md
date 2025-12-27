# voice-reading Specification

## Purpose
Defines the voice reading capability that enables users to conduct tarot readings through natural voice conversation using OpenAI's Realtime API. This capability provides an alternative to text-based chat, allowing hands-free, real-time spoken interaction while maintaining the same reading flow (intent assessment, spread generation, card selection, interpretation, and follow-ups) through specialized agent handoffs.

## ADDED Requirements

### Requirement: Voice Mode Selection
The system SHALL provide users with a choice between text chat and voice modes when starting a reading.

#### Scenario: Mode selection UI on reading page
- **GIVEN** a user navigates to `/reading`
- **WHEN** the reading page loads
- **THEN** the user is presented with two options: "Text Chat" and "Voice Reading"
- **AND** selecting "Text Chat" initiates the existing text-based flow
- **AND** selecting "Voice Reading" navigates to `/reading/voice` (or initiates voice mode)

#### Scenario: Voice mode availability check
- **GIVEN** voice mode is selected
- **WHEN** the browser does not support required APIs (WebRTC, MediaDevices)
- **THEN** the system displays an error message
- **AND** falls back to text chat mode
- **AND** logs the compatibility issue

### Requirement: Agent Handoff Architecture
The system SHALL implement a multi-agent architecture using OpenAI's agent handoff mechanism to manage different phases of the voice reading.

#### Scenario: Four specialized agents
- **GIVEN** voice mode is initialized
- **WHEN** the RealtimeSession is created
- **THEN** the system SHALL define 4 specialized agents:
  1. **Intent Assessment Agent** - Collects and clarifies user's question
  2. **Spread Generation Agent** - Determines spread and guides card selection
  3. **Reading Agent** - Interprets cards and provides complete reading
  4. **Followup Agent** - Answers follow-up questions and handles clarifications
- **AND** each agent SHALL have specialized instructions optimized for its role
- **AND** agents SHALL be connected via handoffs in sequence

#### Scenario: Intent Assessment Agent handoff
- **GIVEN** the Intent Assessment Agent is active
- **WHEN** the agent determines the user's intent is clear and complete
- **THEN** the agent SHALL hand off to the Spread Generation Agent
- **AND** SHALL pass intent summary, hidden concern, topic, and timeframe as context
- **AND** the UI SHALL update to reflect the phase transition

#### Scenario: Spread Generation Agent handoff
- **GIVEN** the Spread Generation Agent is active
- **WHEN** all cards in the spread have been drawn via the `draw_card` tool
- **THEN** the agent SHALL hand off to the Reading Agent
- **AND** SHALL pass intent, spread layout, and all drawn cards as context
- **AND** the UI SHALL update to the reading phase

#### Scenario: Reading Agent handoff
- **GIVEN** the Reading Agent is active
- **WHEN** the complete reading interpretation has been delivered
- **THEN** the agent SHALL hand off to the Followup Agent
- **AND** SHALL pass the full reading with all interpretations as context
- **AND** the UI SHALL update to the follow-ups phase
- **AND** the speaker button SHALL be re-enabled for user questions

#### Scenario: Followup Agent persistence
- **GIVEN** the Followup Agent is active
- **WHEN** handling follow-up questions
- **THEN** the agent SHALL remain active (no further handoffs)
- **AND** SHALL maintain access to complete conversation history
- **AND** SHALL handle unlimited follow-up questions until session ends

### Requirement: Agent Tool Allocation
The system SHALL provide specialized tools to agents based on their phase responsibilities.

#### Scenario: Intent Assessment Agent tools
- **GIVEN** the Intent Assessment Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the agent SHALL have NO tools
- **AND** SHALL rely solely on conversation to collect intent
- **AND** SHALL hand off when intent is clear

#### Scenario: Spread Generation Agent tools
- **GIVEN** the Spread Generation Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the agent SHALL have access to the `draw_card` tool
- **AND** SHALL use `draw_card` for each position in the spread
- **AND** SHALL NOT have access to `show_card` (cards are not yet interpreted)

#### Scenario: Reading Agent tools
- **GIVEN** the Reading Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the agent SHALL have access to the `show_card` tool
- **AND** SHALL NOT have access to `draw_card` (already has all cards from previous phase)
- **AND** SHALL call `show_card` before interpreting each card

#### Scenario: Followup Agent tools
- **GIVEN** the Followup Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the agent SHALL have access to BOTH `draw_card` and `show_card` tools
- **AND** SHALL use `draw_card` to request additional clarification cards (1-3 max)
- **AND** SHALL use `show_card` before interpreting newly drawn cards

### Requirement: draw_card Tool Implementation
The system SHALL provide a `draw_card` tool that enables agents to request user card selection from the shuffled deck.

#### Scenario: draw_card tool definition
- **GIVEN** the `draw_card` tool is registered
- **WHEN** an agent calls the tool
- **THEN** the tool SHALL accept parameters:
  - `positionLabel` (string, required): Name of the position (e.g., "Past", "Present")
  - `promptRole` (string, required): What this position represents in the reading
- **AND** SHALL have a clear description of when to call it
- **AND** SHALL use Zod schema for parameter validation

#### Scenario: draw_card tool execution flow
- **GIVEN** the Spread Generation Agent or Followup Agent calls `draw_card`
- **WHEN** the tool executes
- **THEN** the system SHALL:
  1. Display the card picker UI (similar to text reading mode)
  2. Show shuffled deck of remaining cards
  3. Wait for user to select a card
  4. Reveal the selected card to the user
  5. Return card details to the agent: `{ cardId, cardName, reversed }`
- **AND** the agent SHALL receive the card data before continuing

#### Scenario: draw_card tool response format
- **GIVEN** a card has been selected and revealed
- **WHEN** the tool returns the result to the agent
- **THEN** the response SHALL include:
  - `cardId` (string): Unique card identifier (e.g., "the-fool")
  - `cardName` (string): Full card name (e.g., "The Fool")
  - `reversed` (boolean): Whether the card is reversed
- **AND** the agent SHALL use this data for its next action (spread building or interpretation)

#### Scenario: draw_card tool error handling
- **GIVEN** the `draw_card` tool execution fails (network error, UI error, validation error)
- **WHEN** the error is caught
- **THEN** the tool SHALL return an error object to the agent
- **AND** the agent SHALL apologize and ask the user to retry
- **AND** SHALL NOT transition to a new phase
- **AND** the error SHALL be logged for debugging

### Requirement: show_card Tool Implementation
The system SHALL provide a `show_card` tool that enables agents to display a card on screen before interpreting it.

#### Scenario: show_card tool definition
- **GIVEN** the `show_card` tool is registered
- **WHEN** an agent needs to display a card
- **THEN** the tool SHALL accept parameters:
  - `cardId` (string, required): The ID of the card to display (e.g., "the-fool")
  - `reversed` (boolean, required): Whether the card is reversed (upside down)
- **AND** SHALL have a clear description: "Display a card on screen before interpreting it"
- **AND** SHALL use Zod schema for parameter validation

#### Scenario: show_card tool execution flow
- **GIVEN** the Reading Agent or Followup Agent calls `show_card`
- **WHEN** the tool executes
- **THEN** the system SHALL:
  1. Retrieve the card by `cardId` from the voice reading store
  2. Display the card visually on screen with the correct orientation based on `reversed` parameter
  3. Play display animation (if applicable)
  4. Wait for display to complete
  5. Return success confirmation to the agent
- **AND** the agent SHALL wait for tool completion before speaking interpretation

#### Scenario: show_card before interpretation (Reading Agent)
- **GIVEN** the Reading Agent has all cards from the Spread Agent
- **WHEN** interpreting each card in the spread
- **THEN** the agent SHALL:
  1. Call `show_card(cardId, reversed)` for the card
  2. Wait for the tool to complete
  3. Speak the interpretation of that card
- **AND** this pattern SHALL repeat for each card in the spread
- **AND** the user SHALL see each card before hearing its interpretation

#### Scenario: show_card before interpretation (Followup Agent)
- **GIVEN** the Followup Agent has drawn new cards via `draw_card`
- **WHEN** interpreting the newly drawn clarification cards
- **THEN** the agent SHALL:
  1. Call `show_card(cardId, reversed)` for each new card
  2. Wait for the tool to complete
  3. Speak the interpretation
- **AND** SHALL NOT call `show_card` for cards already shown earlier in the reading

#### Scenario: show_card tool response format
- **GIVEN** a card has been displayed on screen
- **WHEN** the tool returns the result to the agent
- **THEN** the response SHALL include:
  - `success` (boolean): true if display succeeded
  - `cardId` (string): The ID of the card that was displayed
  - `reversed` (boolean): The reversed status of the displayed card
- **AND** the agent SHALL proceed with spoken interpretation after receiving success

#### Scenario: show_card tool error handling
- **GIVEN** the `show_card` tool execution fails (card not found, UI error)
- **WHEN** the error is caught
- **THEN** the tool SHALL return an error object to the agent
- **AND** the agent SHALL apologize and skip that card or ask to retry
- **AND** the error SHALL be logged for debugging
- **AND** the agent SHALL continue with remaining cards if possible

### Requirement: Ephemeral Token Authentication
The system SHALL generate short-lived tokens for secure client-side voice connections without exposing the OpenAI API key.

#### Scenario: Token generation endpoint
- **GIVEN** a POST request to `/api/voice/token`
- **WHEN** the request includes a valid session ID
- **THEN** the backend SHALL call OpenAI's ephemeral token endpoint
- **AND** SHALL return an ephemeral token with expiration time
- **AND** SHALL return configuration for WebRTC connection

#### Scenario: Token expiration time
- **GIVEN** a token generation request
- **WHEN** the OpenAI API creates a token
- **THEN** the token SHALL have configurable TTL (default 60 seconds)
- **AND** the expiration time SHALL be included in the response
- **AND** the token SHALL be single-use for establishing WebRTC connection

#### Scenario: Token security validation
- **GIVEN** a token generation request
- **WHEN** processing the request
- **THEN** the OpenAI API key SHALL NOT be sent to the client
- **AND** the token SHALL authenticate the WebRTC connection
- **AND** expired tokens SHALL be rejected by OpenAI

### Requirement: WebRTC Connection via OpenAI Agents SDK
The system SHALL establish WebRTC connection using the OpenAI Agents SDK, which handles audio capture and playback automatically.

#### Scenario: RealtimeSession initialization
- **GIVEN** an ephemeral token is obtained
- **WHEN** the voice session starts
- **THEN** a `RealtimeSession` SHALL be created with the Intent Assessment Agent
- **AND** SHALL connect using the ephemeral token as API key
- **AND** the SDK SHALL automatically handle WebRTC connection establishment
- **AND** SHALL automatically manage microphone and speaker

#### Scenario: Automatic audio handling
- **GIVEN** the RealtimeSession is connected
- **WHEN** the session is active
- **THEN** the SDK SHALL automatically:
  - Capture audio from microphone
  - Encode audio for transmission
  - Decode received audio
  - Play audio through speakers
- **AND** the application SHALL NOT need manual MediaRecorder or AudioContext management

#### Scenario: Push-to-talk implementation
- **GIVEN** the RealtimeSession is active
- **WHEN** implementing push-to-talk
- **THEN** the application SHALL use session.interrupt() or mute controls
- **AND** SHALL NOT need to manually start/stop MediaRecorder
- **AND** the SDK SHALL handle audio streaming automatically

#### Scenario: Connection error handling
- **GIVEN** a WebRTC connection attempt
- **WHEN** the connection fails (network error, invalid token, etc.)
- **THEN** the system SHALL display an error message to the user
- **AND** SHALL offer options to retry or switch to text mode
- **AND** SHALL log the error details

### Requirement: Voice Reading State Management
The system SHALL manage voice reading state using Zustand, tracking agent transitions, cards, and audio state.

#### Scenario: Voice reading store initialization
- **GIVEN** voice mode is selected
- **WHEN** the voice reading component mounts
- **THEN** the voice reading store SHALL be initialized with:
  - Current agent name (e.g., "IntentAssessmentAgent")
  - Connection status
  - Intent data
  - Spread layout
  - Drawn cards array
  - Audio state (isListening, isSpeaking)
- **AND** SHALL be isolated from the text reading store

#### Scenario: Agent transition tracking
- **GIVEN** an agent handoff occurs
- **WHEN** the new agent becomes active
- **THEN** the voice reading store SHALL update the current agent name
- **AND** SHALL trigger UI re-render to show agent-appropriate components
- **AND** SHALL log the agent transition for debugging

#### Scenario: Card drawing state management
- **GIVEN** the `draw_card` tool is called
- **WHEN** the tool execute function runs
- **THEN** the store SHALL:
  - Set card picker visibility to true
  - Store position label and prompt role
  - Wait for user selection via Promise
  - Add selected card to drawn cards array
  - Return card details to agent
- **AND** SHALL maintain card order for spread positions

#### Scenario: Card display state management
- **GIVEN** the `show_card` tool is called
- **WHEN** the tool execute function runs
- **THEN** the store SHALL:
  - Set currently displayed card ID
  - Trigger card display animation
  - Wait for animation completion
  - Return success to agent
- **AND** SHALL clear display state after tool completes

### Requirement: Voice User Interface Components
The system SHALL provide a voice-specific UI with agent-aware displays and visual feedback.

#### Scenario: Agent indicator display
- **GIVEN** voice mode is active
- **WHEN** the UI renders
- **THEN** the current agent name SHALL be displayed (e.g., "Intent Assessment", "Spread Generation", "Reading", "Followup")
- **AND** SHALL show a subtle indicator (not intrusive)
- **AND** SHALL update immediately when agent transitions occur

#### Scenario: Speaker button for Intent and Followup phases
- **GIVEN** the Intent Assessment Agent or Followup Agent is active
- **WHEN** the UI renders
- **THEN** a large circular speaker button SHALL be displayed
- **AND** SHALL be centered both vertically and horizontally
- **AND** SHALL show "Hold to Speak" hint when idle
- **AND** SHALL have a back button in the top-left corner

#### Scenario: Card picker display during draw_card
- **GIVEN** the `draw_card` tool is called by Spread or Followup agent
- **WHEN** the tool executes
- **THEN** the card picker UI SHALL appear (reused from text reading mode)
- **AND** SHALL show shuffled deck of remaining cards
- **AND** SHALL display position label and prompt role
- **AND** SHALL allow user to select a card
- **AND** SHALL reveal the card after selection
- **AND** SHALL hide after card is returned to agent

#### Scenario: Card display during show_card
- **GIVEN** the `show_card` tool is called by Reading or Followup agent
- **WHEN** the tool executes
- **THEN** the card SHALL be displayed prominently on screen
- **AND** SHALL show card image, name, and orientation (upright/reversed)
- **AND** SHALL remain visible while agent speaks interpretation
- **AND** SHALL animate smoothly when transitioning between cards

#### Scenario: Transcript display toggle
- **GIVEN** voice mode is active
- **WHEN** the user clicks a transcript toggle button
- **THEN** the transcript view SHALL show/hide
- **AND** SHALL display conversation messages (user and agent)
- **AND** SHALL auto-scroll to the latest message
- **AND** SHALL be optional (accessibility best practice)

#### Scenario: Back button navigation
- **GIVEN** voice mode is active
- **WHEN** the user clicks the back button
- **THEN** the system SHALL prompt for confirmation (to prevent accidental exits)
- **AND** if confirmed, SHALL disconnect the RealtimeSession
- **AND** SHALL stop audio capture and playback (via SDK)
- **AND** SHALL navigate back to the reading mode selection screen

### Requirement: Voice-Optimized Agent Instructions
The system SHALL provide each agent with instructions optimized for natural spoken conversation.

#### Scenario: Intent Assessment Agent instructions
- **GIVEN** the Intent Assessment Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the instructions SHALL:
  - Instruct for warm, conversational tone
  - Limit responses to 2-3 sentences
  - Ask ONE clarifying question at a time
  - Listen for both surface question and deeper concerns
  - Use mystical, welcoming tone
  - Instruct when to hand off to Spread Generation Agent

#### Scenario: Spread Generation Agent instructions
- **GIVEN** the Spread Generation Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the instructions SHALL:
  - Determine optimal spread (1-10 cards) based on intent
  - Announce spread type and explain why it suits the question
  - Describe each position's meaning before calling `draw_card`
  - Guide user patiently through each draw
  - Instruct when to hand off to Reading Agent (when all cards drawn)

#### Scenario: Reading Agent instructions
- **GIVEN** the Reading Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the instructions SHALL:
  - Note that agent has access to all cards from previous phase
  - Instruct to call `show_card` before interpreting each card
  - Instruct to wait for tool completion before speaking
  - Interpret each card in its position context
  - Consider card interactions and patterns
  - Provide synthesis tying everything together
  - Offer actionable advice
  - Pace delivery for spoken comprehension
  - Instruct when to hand off to Followup Agent (when reading is complete)

#### Scenario: Followup Agent instructions
- **GIVEN** the Followup Agent is defined
- **WHEN** the agent configuration is created
- **THEN** the instructions SHALL:
  - Answer questions using existing spread when possible
  - Only use `draw_card` if question truly requires new cards (1-3 max)
  - Call `show_card` before interpreting newly drawn cards
  - Keep responses conversational and concise
  - Stay active until user indicates satisfaction (no handoffs)
  - Maintain access to complete conversation history

### Requirement: Error Handling and Recovery
The system SHALL handle errors gracefully and provide recovery options for voice mode failures.

#### Scenario: Unsupported browser error
- **GIVEN** the browser lacks required APIs (WebRTC, MediaDevices)
- **WHEN** voice mode is initiated
- **THEN** the system SHALL detect the missing APIs
- **AND** SHALL display an error: "Your browser doesn't support voice readings"
- **AND** SHALL offer a button to switch to text chat mode
- **AND** SHALL log the specific missing API

#### Scenario: WebRTC connection failure
- **GIVEN** a WebRTC connection attempt fails
- **WHEN** the error occurs (network issue, invalid token, server error)
- **THEN** the system SHALL display an error message appropriate to the error type
- **AND** SHALL offer a "Retry" button
- **AND** SHALL offer a "Switch to Text Mode" button
- **AND** SHALL log the error details for debugging

#### Scenario: Tool execution failure
- **GIVEN** a tool call (`draw_card` or `show_card`) fails
- **WHEN** the tool execute function throws an error
- **THEN** the tool SHALL return an error object to the agent
- **AND** the agent SHALL apologize and ask user to retry or skip
- **AND** SHALL NOT transition phases
- **AND** the error SHALL be logged
- **AND** the agent MAY retry the tool call with same or corrected parameters

#### Scenario: Agent timeout (no handoff)
- **GIVEN** an agent has been active for an unusually long time without handoff
- **WHEN** a timeout threshold is exceeded (e.g., 10 minutes in Spread phase)
- **THEN** the system SHALL log a warning
- **AND** MAY prompt the agent with a system message to proceed
- **AND** SHALL NOT forcibly terminate the session

### Requirement: Accessibility and Compatibility
The system SHALL ensure voice mode is accessible and compatible across supported browsers and devices.

#### Scenario: Browser compatibility check
- **GIVEN** a user attempts to use voice mode
- **WHEN** the page loads
- **THEN** the system SHALL check for WebRTC and MediaDevices support
- **AND** SHALL enable voice mode only if supported
- **AND** SHALL show compatibility error with browser recommendations if unsupported

#### Scenario: Screen reader compatibility
- **GIVEN** a screen reader is active
- **WHEN** voice mode UI is rendered
- **THEN** all interactive elements SHALL have ARIA labels
- **AND** agent transitions SHALL be announced
- **AND** tool execution states SHALL be announced (e.g., "Drawing card for Past position")
- **AND** error messages SHALL be announced immediately

#### Scenario: Keyboard accessibility
- **GIVEN** voice mode is active
- **WHEN** the user navigates with keyboard
- **THEN** the speaker button SHALL be focusable with Tab
- **AND** SHALL activate with Space or Enter key
- **AND** all controls (back button, transcript toggle) SHALL be keyboard accessible

### Requirement: Analytics and Logging
The system SHALL log voice mode usage, agent transitions, and errors for monitoring and debugging.

#### Scenario: Voice session start logging
- **GIVEN** a user initiates voice mode
- **WHEN** the RealtimeSession is established
- **THEN** the system SHALL log:
  - Session ID
  - Timestamp
  - Initial agent name
  - Token expiration time
  - User agent and device info

#### Scenario: Agent transition logging
- **GIVEN** an agent handoff occurs
- **WHEN** the new agent becomes active
- **THEN** the system SHALL log:
  - Previous agent name
  - New agent name
  - Timestamp
  - Duration in previous agent
  - Context passed (summary, not full data)

#### Scenario: Tool execution logging
- **GIVEN** a tool is called by an agent
- **WHEN** the tool executes
- **THEN** the system SHALL log:
  - Tool name (`draw_card` or `show_card`)
  - Agent name that called it
  - Parameters
  - Execution result (success or error)
  - Timestamp
  - Duration

#### Scenario: Error logging
- **GIVEN** an error occurs in voice mode
- **WHEN** the error is caught
- **THEN** the system SHALL log:
  - Error type (connection, tool, validation, timeout, etc.)
  - Error message
  - Stack trace
  - Current agent name
  - Connection status
  - Timestamp

#### Scenario: Performance metrics logging
- **GIVEN** a voice reading session completes
- **WHEN** the session ends
- **THEN** the system SHALL log:
  - Total session duration
  - Number of agent transitions
  - Number of tool calls by type
  - Total cards drawn
  - Average tool execution time
  - Agent durations
