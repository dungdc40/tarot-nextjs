# ai-integration Specification Delta

## ADDED Requirements

### Requirement: OpenAI Realtime API Integration
The system SHALL integrate with OpenAI's Realtime API using the OpenAI Agents SDK for real-time voice-based tarot readings.

#### Scenario: Ephemeral token generation
- **GIVEN** a POST request to `/api/voice/token` with a session ID
- **WHEN** the backend processes the request
- **THEN** it SHALL call OpenAI's ephemeral token endpoint
- **AND** SHALL include TTL parameter (configurable, default 60 seconds)
- **AND** SHALL return the ephemeral token and expiration time to the client
- **AND** SHALL return WebRTC connection configuration

#### Scenario: Token API error handling
- **GIVEN** the OpenAI token API request fails
- **WHEN** an error response is received (401, 429, 503, etc.)
- **THEN** the backend SHALL log the error details
- **AND** SHALL return an appropriate error to the client
- **AND** SHALL NOT expose internal API details in the error message

#### Scenario: Token rate limiting
- **GIVEN** multiple token requests from the same session
- **WHEN** requests exceed rate limits (1 per 30 seconds per session)
- **THEN** the backend SHALL reject the request with a 429 status
- **AND** SHALL include retry-after information
- **AND** SHALL log the rate limit violation

### Requirement: OpenAI Agents SDK Integration
The system SHALL use the OpenAI Agents SDK (@openai/agents) for TypeScript to build and manage voice agents.

#### Scenario: RealtimeAgent definition
- **GIVEN** a voice agent needs to be created
- **WHEN** defining the agent
- **THEN** the agent SHALL use the `RealtimeAgent` class from `@openai/agents`
- **AND** SHALL specify agent name (e.g., "IntentAssessmentAgent")
- **AND** SHALL specify model: `gpt-realtime-mini-2025-12-15`
- **AND** SHALL include instructions optimized for voice conversation
- **AND** SHALL define tools (if applicable)
- **AND** SHALL define handoffs (if applicable)

#### Scenario: RealtimeSession initialization
- **GIVEN** voice mode is initiated
- **WHEN** creating the session
- **THEN** a `RealtimeSession` SHALL be created with the initial agent (Intent Assessment Agent)
- **AND** SHALL connect using ephemeral token as API key
- **AND** SHALL automatically establish WebRTC connection
- **AND** SHALL automatically handle microphone and speaker

#### Scenario: Agent handoff execution
- **GIVEN** an agent needs to transition to another agent
- **WHEN** the agent decides to hand off
- **THEN** the handoff SHALL be triggered automatically by the SDK
- **AND** SHALL pass conversation context to the next agent
- **AND** SHALL maintain conversation history
- **AND** SHALL update the UI to reflect the new agent

### Requirement: Tool Registration and Execution
The system SHALL register tools with agents using the OpenAI Agents SDK tool() function and Zod schema validation.

#### Scenario: Tool definition with Zod schema
- **GIVEN** a tool needs to be created
- **WHEN** defining the tool
- **THEN** the tool SHALL use the `tool()` function from `@openai/agents`
- **AND** SHALL include a descriptive name (e.g., "draw_card", "show_card")
- **AND** SHALL include a clear description of when to call it
- **AND** SHALL use Zod schema for parameter validation
- **AND** SHALL implement an async `execute()` function

#### Scenario: draw_card tool registration
- **GIVEN** the Spread Generation Agent or Followup Agent is defined
- **WHEN** registering tools
- **THEN** the `draw_card` tool SHALL be included in the agent's tools array
- **AND** SHALL have parameters: `positionLabel` (string), `promptRole` (string)
- **AND** SHALL execute by displaying card picker UI and returning selected card
- **AND** SHALL return: `{ cardId, cardName, reversed }`

#### Scenario: show_card tool registration
- **GIVEN** the Reading Agent or Followup Agent is defined
- **WHEN** registering tools
- **THEN** the `show_card` tool SHALL be included in the agent's tools array
- **AND** SHALL have parameters: `cardId` (string), `reversed` (boolean)
- **AND** SHALL execute by displaying the card on screen with correct orientation
- **AND** SHALL return: `{ success, cardId, reversed }`

#### Scenario: Tool execution by agent
- **GIVEN** an agent calls a tool during conversation
- **WHEN** the tool is invoked
- **THEN** the SDK SHALL automatically call the tool's execute() function
- **AND** SHALL pass validated parameters to the function
- **AND** SHALL wait for the function to complete (Promise resolution)
- **AND** SHALL return the result to the agent
- **AND** the agent SHALL continue conversation with the tool result

#### Scenario: Tool execution error handling
- **GIVEN** a tool's execute() function throws an error
- **WHEN** the error is caught
- **THEN** the SDK SHALL return an error object to the agent
- **AND** the agent SHALL handle the error according to its instructions
- **AND** the error SHALL be logged for debugging
- **AND** the agent MAY retry the tool call

### Requirement: WebRTC Audio Transport
The system SHALL use WebRTC for real-time audio transport, automatically managed by the OpenAI Agents SDK.

#### Scenario: Automatic microphone access
- **GIVEN** the RealtimeSession is connected
- **WHEN** audio capture is needed
- **THEN** the SDK SHALL automatically request microphone permission
- **AND** SHALL handle permission grant/deny
- **AND** SHALL configure audio capture (16kHz, mono, PCM16)
- **AND** SHALL stream audio to OpenAI automatically

#### Scenario: Automatic audio playback
- **GIVEN** the voice agent generates a response
- **WHEN** audio arrives from OpenAI
- **THEN** the SDK SHALL automatically decode the audio
- **AND** SHALL play audio through speakers
- **AND** SHALL handle audio queueing and streaming
- **AND** SHALL provide playback state events

#### Scenario: Push-to-talk control
- **GIVEN** the application implements push-to-talk
- **WHEN** controlling audio input
- **THEN** the application SHALL use SDK mute controls or session.interrupt()
- **AND** SHALL NOT need manual MediaRecorder management
- **AND** the SDK SHALL handle audio streaming start/stop

### Requirement: Voice Agent Instructions
The system SHALL provide voice-optimized instructions for each agent, designed for natural spoken conversation.

#### Scenario: Intent Assessment Agent instructions
- **GIVEN** the Intent Assessment Agent is defined
- **WHEN** setting agent instructions
- **THEN** the instructions SHALL:
  - Instruct for warm, conversational tone
  - Limit responses to 2-3 sentences
  - Ask ONE clarifying question at a time
  - Greet user and ask what brings them to the cards
  - Use mystical, welcoming tone
  - Instruct to hand off when intent is clear

#### Scenario: Spread Generation Agent instructions
- **GIVEN** the Spread Generation Agent is defined
- **WHEN** setting agent instructions
- **THEN** the instructions SHALL:
  - Determine optimal spread (1-10 cards) based on intent
  - Announce spread type and explain why it suits the question
  - Describe each position's meaning before calling draw_card
  - Guide user patiently through each draw
  - Instruct to hand off when all cards are drawn

#### Scenario: Reading Agent instructions
- **GIVEN** the Reading Agent is defined
- **WHEN** setting agent instructions
- **THEN** the instructions SHALL:
  - Note that agent has all cards from previous phase
  - Instruct to call show_card before interpreting each card
  - Interpret each card in position context
  - Consider card interactions and patterns
  - Provide synthesis and actionable advice
  - Pace delivery for spoken comprehension
  - Instruct to hand off when reading is complete

#### Scenario: Followup Agent instructions
- **GIVEN** the Followup Agent is defined
- **WHEN** setting agent instructions
- **THEN** the instructions SHALL:
  - Answer questions using existing spread when possible
  - Only use draw_card if question truly requires new cards (1-3 max)
  - Call show_card before interpreting newly drawn cards
  - Keep responses conversational and concise
  - Stay active (no handoffs)
  - Maintain conversation history

### Requirement: Voice API Configuration
The system SHALL validate and manage OpenAI Realtime API configuration separately from text-based LLM configuration.

#### Scenario: Voice API key validation
- **GIVEN** voice mode is enabled (OPENAI_VOICE_ENABLED=true or OPENAI_API_KEY is set)
- **WHEN** the server starts
- **THEN** the system SHALL validate OpenAI API key is present
- **AND** SHALL throw an error if missing
- **AND** SHALL log the validation failure

#### Scenario: Voice feature flag
- **GIVEN** the environment variable `OPENAI_VOICE_ENABLED` is set
- **WHEN** the reading page loads
- **THEN** the voice mode option SHALL be shown only if enabled
- **AND** SHALL be hidden if disabled or if the variable is false/missing
- **AND** text mode SHALL always remain available

#### Scenario: Voice session limits configuration
- **GIVEN** voice mode configuration
- **WHEN** the backend initializes
- **THEN** the system SHALL read `VOICE_TOKEN_TTL` (default 60 seconds)
- **AND** SHALL read `VOICE_MAX_SESSION_DURATION` (default 1800 seconds)
- **AND** SHALL enforce session duration limits
- **AND** SHALL terminate sessions exceeding the maximum duration

### Requirement: Voice Model Configuration
The system SHALL use the gpt-realtime-mini-2025-12-15 model for all voice agents.

#### Scenario: Model specification
- **GIVEN** a RealtimeAgent is being defined
- **WHEN** specifying the model
- **THEN** the model SHALL be set to: `gpt-realtime-mini-2025-12-15`
- **AND** SHALL be consistent across all 4 agents
- **AND** SHALL NOT be configurable via environment variables (hardcoded for now)

#### Scenario: Model pricing awareness
- **GIVEN** voice mode is in use
- **WHEN** calculating costs
- **THEN** the system SHALL track connection minutes
- **AND** SHALL log session duration for cost estimation
- **AND** SHALL use OpenAI's published pricing for gpt-4o-realtime-mini

### Requirement: Voice Error Handling
The system SHALL handle voice-specific errors with appropriate fallbacks and user feedback.

#### Scenario: Voice API unavailable
- **GIVEN** a token generation or WebRTC connection attempt
- **WHEN** OpenAI Realtime API returns a 503 (service unavailable)
- **THEN** the system SHALL display: "Voice service temporarily unavailable"
- **AND** SHALL offer to switch to text mode
- **AND** SHALL log the service availability issue

#### Scenario: WebRTC incompatibility
- **GIVEN** the browser cannot establish WebRTC connection
- **WHEN** WebRTC connection initialization fails
- **THEN** the system SHALL display an error with browser compatibility details
- **AND** SHALL fall back to text mode
- **AND** SHALL log the specific WebRTC incompatibility

#### Scenario: Tool execution validation error
- **GIVEN** an agent calls a tool with invalid arguments
- **WHEN** Zod validation fails (wrong type, missing required, out of range)
- **THEN** the tool SHALL return an error object to the agent
- **AND** SHALL include specific validation error details
- **AND** SHALL NOT change the current agent
- **AND** SHALL allow the agent to retry with corrected arguments

#### Scenario: Agent handoff failure
- **GIVEN** an agent attempts to hand off to the next agent
- **WHEN** the handoff fails (network error, SDK error)
- **THEN** the system SHALL log the handoff error
- **AND** SHALL display an error to the user
- **AND** SHALL offer options to retry or switch to text mode
- **AND** SHALL preserve conversation history if possible

### Requirement: Voice Metrics and Monitoring
The system SHALL collect metrics on voice mode usage and performance for monitoring and optimization.

#### Scenario: Track voice session metrics
- **GIVEN** a voice session is active
- **WHEN** the session completes or is interrupted
- **THEN** the system SHALL log:
  - Total session duration
  - Number of agent transitions
  - Number of tool calls by type (draw_card, show_card)
  - Number of token refreshes (if implemented)
  - Average latency (user input to agent audio start)
  - Agent durations

#### Scenario: Track voice API costs
- **GIVEN** a voice session is active
- **WHEN** tracking API usage
- **THEN** the system SHALL calculate connection minutes
- **AND** SHALL estimate cost based on OpenAI pricing
- **AND** SHALL log total session cost on completion
- **AND** SHALL aggregate daily/monthly cost totals

#### Scenario: Monitor voice errors
- **GIVEN** voice mode is in use
- **WHEN** errors occur (connection, audio, tool, validation, timeout)
- **THEN** the system SHALL log error type, message, and context
- **AND** SHALL track error frequency by type
- **AND** SHALL alert if error rate exceeds threshold (e.g., 10% of sessions)

### Requirement: Zod Dependency
The system SHALL use Zod v3 for runtime validation of tool parameters.

#### Scenario: Zod package installation
- **GIVEN** voice mode is being implemented
- **WHEN** installing dependencies
- **THEN** Zod v3 SHALL be added to package.json
- **AND** SHALL be listed as a production dependency
- **AND** SHALL be compatible with @openai/agents SDK requirements

#### Scenario: Zod schema definitions
- **GIVEN** a tool is being defined
- **WHEN** specifying parameters
- **THEN** Zod schemas SHALL be used (e.g., `z.object()`, `z.string()`, `z.boolean()`)
- **AND** SHALL include `.describe()` for parameter documentation
- **AND** SHALL validate types at runtime
- **AND** SHALL provide clear error messages on validation failure

### Requirement: Stored Prompts (Future Migration)
The system SHALL initially use inline instructions but be prepared to migrate to stored prompts (cloud-based) in the future.

#### Scenario: Initial inline instructions
- **GIVEN** agents are being defined
- **WHEN** setting instructions
- **THEN** instructions SHALL be provided as inline strings in the code
- **AND** SHALL be comprehensive and voice-optimized
- **AND** SHALL be documented for future migration

#### Scenario: Stored prompt migration path
- **GIVEN** instructions stabilize and are ready for cloud storage
- **WHEN** migrating to stored prompts
- **THEN** instructions SHALL be created in OpenAI platform
- **AND** SHALL use `prompt_id` references in agent definitions
- **AND** SHALL maintain backward compatibility during migration
- **AND** SHALL document the migration process

#### Scenario: Environment variable for prompt references
- **GIVEN** stored prompts are configured
- **WHEN** using prompt IDs
- **THEN** environment variables SHALL store prompt IDs (e.g., `VOICE_INTENT_PROMPT_ID`)
- **AND** SHALL fall back to inline instructions if prompt ID is missing
- **AND** SHALL log which prompt source is being used (inline vs. stored)

### Requirement: SDK Package Installation
The system SHALL install and configure the OpenAI Agents SDK package.

#### Scenario: @openai/agents package installation
- **GIVEN** voice mode is being implemented
- **WHEN** installing dependencies
- **THEN** `@openai/agents` SHALL be added to package.json
- **AND** SHALL be installed as a production dependency
- **AND** SHALL use the latest stable version
- **AND** SHALL be imported in voice-related files

#### Scenario: SDK type definitions
- **GIVEN** TypeScript is used in the project
- **WHEN** importing from @openai/agents
- **THEN** TypeScript types SHALL be available (RealtimeAgent, RealtimeSession, tool)
- **AND** SHALL provide type safety for agent definitions
- **AND** SHALL enable IDE autocomplete for SDK APIs
