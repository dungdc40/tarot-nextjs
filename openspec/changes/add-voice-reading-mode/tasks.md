# Implementation Tasks

## Phase 1: Dependencies & Environment Setup ✅

### 1.1 Package Installation ✅
- [x] 1.1.1 Install `@openai/agents` package (production dependency)
- [x] 1.1.2 Install or upgrade `zod` to v3 (required by SDK) - Already at v4.1.12
- [x] 1.1.3 Update `package.json` with new dependencies
- [x] 1.1.4 Run `npm install` to install packages
- [x] 1.1.5 Verify TypeScript types are available from `@openai/agents`

### 1.2 Environment Configuration ✅
- [x] 1.2.1 Add `OPENAI_VOICE_ENABLED` to `.env.local.example` (default: false)
- [x] 1.2.2 Add `VOICE_TOKEN_TTL` to `.env.local.example` (default: 60)
- [x] 1.2.3 Add `VOICE_MAX_SESSION_DURATION` to `.env.local.example` (default: 1800)
- [x] 1.2.4 Update environment validation to check voice config when enabled
- [x] 1.2.5 Document voice API configuration in README/ENV_SETUP.md
- [x] 1.2.6 Ensure `OPENAI_API_KEY` is documented for voice usage

## Phase 2: Backend Infrastructure ✅

### 2.1 Ephemeral Token API Endpoint ✅
- [x] 2.1.1 Create `app/api/voice/token/route.ts`
- [x] 2.1.2 Implement POST handler with session ID validation
- [x] 2.1.3 Add rate limiting middleware (1 request per 30s per session)
- [x] 2.1.4 Integrate OpenAI ephemeral token API client (placeholder for now)
  - Call OpenAI's ephemeral token endpoint (TODO: update when API available)
  - Pass configurable TTL (default 60 seconds)
  - Handle authentication with `OPENAI_API_KEY`
- [x] 2.1.5 Return token, expiration time, and WebRTC configuration
- [x] 2.1.6 Add error handling for OpenAI API failures (401, 429, 503)
- [x] 2.1.7 Add request/response logging
- [x] 2.1.8 Test token generation with valid/invalid API keys
- [x] 2.1.9 Test rate limiting enforcement

## Phase 3: Voice Agent Tools ✅

### 3.1 draw_card Tool Implementation ✅
- [x] 3.1.1 Create `lib/tools/drawCardTool.ts`
- [x] 3.1.2 Import `tool` function from `@openai/agents`
- [x] 3.1.3 Import `z` from `zod` for schema validation
- [x] 3.1.4 Define Zod schema for parameters
  - [x] 3.1.4.1 `positionLabel: z.string().describe(...)`
  - [x] 3.1.4.2 `promptRole: z.string().describe(...)`
- [x] 3.1.5 Implement async `execute()` function
  - [x] 3.1.5.1 Call `voiceReadingStore.requestCardDraw(positionLabel, promptRole)`
  - [x] 3.1.5.2 Wait for user card selection (Promise-based)
  - [x] 3.1.5.3 Return `{ cardId, cardName, reversed }`
- [x] 3.1.6 Add clear tool description for agent
- [x] 3.1.7 Add error handling for UI failures
- [x] 3.1.8 Export `drawCardTool`

### 3.2 show_card Tool Implementation ✅
- [x] 3.2.1 Create `lib/tools/showCardTool.ts`
- [x] 3.2.2 Import `tool` function from `@openai/agents`
- [x] 3.2.3 Import `z` from `zod` for schema validation
- [x] 3.2.4 Define Zod schema for parameters
  - [x] 3.2.4.1 `cardId: z.string().describe(...)`
  - [x] 3.2.4.2 `reversed: z.boolean().describe(...)`
- [x] 3.2.5 Implement async `execute()` function
  - [x] 3.2.5.1 Call `voiceReadingStore.showCard(cardId, reversed)`
  - [x] 3.2.5.2 Wait for display animation to complete
  - [x] 3.2.5.3 Return `{ success: true, cardId, reversed }`
- [x] 3.2.6 Add clear tool description for agent
- [x] 3.2.7 Add error handling for card not found or UI failures
- [x] 3.2.8 Export `showCardTool`

## Phase 4: Voice Agent Definitions ✅

### 4.1 Intent Assessment Agent ✅
- [x] 4.1.1 Create `lib/agents/intentAgent.ts`
- [x] 4.1.2 Import `RealtimeAgent` from `@openai/agents-realtime`
- [x] 4.1.3 Define agent with:
  - [x] 4.1.3.1 `name: 'IntentAssessmentAgent'`
  - [x] 4.1.3.2 No model parameter (set at session level)
  - [x] 4.1.3.3 Voice-optimized instructions (inline string)
    - Warm, conversational tone
    - 2-3 sentences max
    - ONE question at a time
    - Greet user and ask what brings them to the cards
    - Mystical, welcoming tone
    - Instruction to hand off when intent is clear
  - [x] 4.1.3.4 No tools
  - [x] 4.1.3.5 `handoffs: []` (configured in session manager)
- [x] 4.1.4 Export `intentAgent`

### 4.2 Spread Generation Agent ✅
- [x] 4.2.1 Create `lib/agents/spreadAgent.ts`
- [x] 4.2.2 Import `RealtimeAgent` from `@openai/agents-realtime`
- [x] 4.2.3 Import `drawCardTool` from `lib/tools/drawCardTool`
- [x] 4.2.4 Define agent with:
  - [x] 4.2.4.1 `name: 'SpreadGenerationAgent'`
  - [x] 4.2.4.2 No model parameter (set at session level)
  - [x] 4.2.4.3 Voice-optimized instructions (inline string)
    - Determine optimal spread (1-10 cards) based on intent
    - Announce spread type and explain why it suits the question
    - Describe each position's meaning before calling draw_card
    - Guide user patiently through each draw
    - Instruction to hand off when all cards are drawn
  - [x] 4.2.4.4 `tools: [drawCardTool]`
  - [x] 4.2.4.5 `handoffs: []` (configured in session manager)
- [x] 4.2.5 Export `spreadAgent`

### 4.3 Reading Agent ✅
- [x] 4.3.1 Create `lib/agents/readingAgent.ts`
- [x] 4.3.2 Import `RealtimeAgent` from `@openai/agents-realtime`
- [x] 4.3.3 Import `showCardTool` from `lib/tools/showCardTool`
- [x] 4.3.4 Define agent with:
  - [x] 4.3.4.1 `name: 'ReadingAgent'`
  - [x] 4.3.4.2 No model parameter (set at session level)
  - [x] 4.3.4.3 Voice-optimized instructions (inline string)
    - Note that agent has all cards from previous phase
    - Instruct to call show_card before interpreting each card
    - Wait for tool completion before speaking
    - Interpret each card in position context
    - Consider card interactions and patterns
    - Provide synthesis and actionable advice
    - Pace delivery for spoken comprehension
    - Instruction to hand off when reading is complete
  - [x] 4.3.4.4 `tools: [showCardTool]`
  - [x] 4.3.4.5 `handoffs: []` (configured in session manager)
- [x] 4.3.5 Export `readingAgent`

### 4.4 Followup Agent ✅
- [x] 4.4.1 Create `lib/agents/followupAgent.ts`
- [x] 4.4.2 Import `RealtimeAgent` from `@openai/agents-realtime`
- [x] 4.4.3 Import `drawCardTool` and `showCardTool`
- [x] 4.4.4 Define agent with:
  - [x] 4.4.4.1 `name: 'FollowupAgent'`
  - [x] 4.4.4.2 No model parameter (set at session level)
  - [x] 4.4.4.3 Voice-optimized instructions (inline string)
    - Answer questions using existing spread when possible
    - Only use draw_card if question truly requires new cards (1-3 max)
    - Call show_card before interpreting newly drawn cards
    - Keep responses conversational and concise
    - Stay active (no handoffs)
    - Maintain conversation history
  - [x] 4.4.4.4 `tools: [drawCardTool, showCardTool]`
  - [x] 4.4.4.5 No handoffs (stays active)
- [x] 4.4.5 Export `followupAgent`

## Phase 5: Voice Reading State Management ✅

### 5.1 Voice Reading Store ✅
- [x] 5.1.1 Create `lib/stores/voiceReadingStore.ts`
- [x] 5.1.2 Define `VoiceReadingState` interface
  - [x] 5.1.2.1 `currentAgentName: string` (e.g., "IntentAssessmentAgent")
  - [x] 5.1.2.2 `connectionStatus: VoiceConnectionStatus`
  - [x] 5.1.2.3 Intent data (summary, concern, topic, timeframe)
  - [x] 5.1.2.4 Spread layout
  - [x] 5.1.2.5 Drawn cards array
  - [x] 5.1.2.6 Audio state (isListening, isSpeaking)
  - [x] 5.1.2.7 Transcript data (messages, visibility)
  - [x] 5.1.2.8 Card picker state (visible, position, prompt)
  - [x] 5.1.2.9 Currently displayed card ID
- [x] 5.1.3 Implement Zustand store with actions
  - [x] 5.1.3.1 `setCurrentAgent(agentName)`
  - [x] 5.1.3.2 `setConnectionStatus(status)`
  - [x] 5.1.3.3 `setIntentData({...})`
  - [x] 5.1.3.4 `setSpread(spread)`
  - [x] 5.1.3.5 `addDrawnCard(card)`
  - [x] 5.1.3.6 `setListening(isListening)`
  - [x] 5.1.3.7 `setSpeaking(isSpeaking)`
  - [x] 5.1.3.8 `addTranscriptMessage(message)`
  - [x] 5.1.3.9 `toggleTranscript()`
  - [x] 5.1.3.10 `requestCardDraw(positionLabel, promptRole)` - Returns Promise<Card>
  - [x] 5.1.3.11 `showCard(cardId)` - Returns Promise<void>
  - [x] 5.1.3.12 `reset()` to clear state
- [x] 5.1.4 Add initial state defaults
- [x] 5.1.5 Add TypeScript strict mode compliance
- [x] 5.1.6 Export store and selectors

### 5.2 Voice Reading Types ✅
- [x] 5.2.1 Create `lib/types/voice.ts`
- [x] 5.2.2 Define `VoiceAgentName` union type
  - "IntentAssessmentAgent" | "SpreadGenerationAgent" | "ReadingAgent" | "FollowupAgent"
- [x] 5.2.3 Define `TranscriptMessage` interface (role, content, timestamp)
- [x] 5.2.4 Define `VoiceConnectionStatus` type
  - "disconnected" | "connecting" | "connected" | "error"
- [x] 5.2.5 Define `CardDrawRequest` interface (positionLabel, promptRole, resolve, reject)
- [x] 5.2.6 Export all voice-specific types

## Phase 6: Voice Session Management ✅

### 6.1 RealtimeSession Manager ✅
- [x] 6.1.1 Create `lib/services/VoiceSessionManager.ts`
- [x] 6.1.2 Import `RealtimeSession` from `@openai/agents-realtime`
- [x] 6.1.3 Import all 4 agent definitions
- [x] 6.1.4 Implement `VoiceSessionManager` class
  - [x] 6.1.4.1 `private session: RealtimeSession | null`
  - [x] 6.1.4.2 `async connect(ephemeralToken)` method
    - Create RealtimeSession with intentAgent
    - Call `session.connect({ apiKey: ephemeralToken })`
    - Set up event listeners (simplified placeholder)
    - Update store with connection status
  - [x] 6.1.4.3 `disconnect()` method
    - Uses session.close() method
    - Clean up event listeners
    - Update store
  - [x] 6.1.4.4 Handle agent handoff events (placeholder for SDK stability)
  - [x] 6.1.4.5 Handle tool execution events (SDK-managed)
  - [x] 6.1.4.6 Handle audio state events (placeholder for SDK stability)
  - [x] 6.1.4.7 Handle connection errors
- [x] 6.1.5 Add TypeScript types for events (simplified)
- [x] 6.1.6 Export `VoiceSessionManager`

### 6.2 React Hook for Voice Session ✅
- [x] 6.2.1 Create `lib/hooks/useVoiceSession.ts`
- [x] 6.2.2 Implement custom hook
  - [x] 6.2.2.1 Initialize VoiceSessionManager on mount
  - [x] 6.2.2.2 Connect to voice reading store
  - [x] 6.2.2.3 Request ephemeral token from `/api/voice/token`
  - [x] 6.2.2.4 Call `sessionManager.connect(token)` on token receipt
  - [x] 6.2.2.5 Handle connection errors
  - [x] 6.2.2.6 Clean up on unmount
- [x] 6.2.3 Expose hook interface
  - [x] 6.2.3.1 `connectionStatus` (from store)
  - [x] 6.2.3.2 `currentAgent` (from store)
  - [x] 6.2.3.3 `isListening` (from store)
  - [x] 6.2.3.4 `isSpeaking` (from store)
  - [x] 6.2.3.5 `disconnect()` method
  - [x] 6.2.3.6 `error` state
- [x] 6.2.4 Add loading states
- [x] 6.2.5 Export hook

## Phase 7: Voice UI Components ✅

### 7.1 Agent Indicator Component ✅
- [x] 7.1.1 Create `components/voice/VoiceAgentIndicator.tsx`
- [x] 7.1.2 Display current agent name (friendly labels)
  - IntentAssessmentAgent → "Intent Assessment"
  - SpreadGenerationAgent → "Spread Generation"
  - ReadingAgent → "Reading"
  - FollowupAgent → "Followup"
- [x] 7.1.3 Show subtle indicator (top of screen, not intrusive)
- [x] 7.1.4 Update immediately on agent transitions
- [x] 7.1.5 Add smooth transition animations
- [x] 7.1.6 Add ARIA live region for screen readers
- [x] 7.1.7 Export component

### 7.2 Voice Card Picker Component ✅
- [x] 7.2.1 Create `components/voice/VoiceCardPicker.tsx`
- [x] 7.2.2 Reuse CardPicker component from text reading mode
- [x] 7.2.3 Display position label and prompt role
- [x] 7.2.4 Show shuffled deck of remaining cards
- [x] 7.2.5 Handle card selection
  - [x] 7.2.5.1 Call store.resolveCardDraw() to resolve Promise
  - [x] 7.2.5.2 Generate card name from ID
  - [x] 7.2.5.3 Hide picker after selection (handled by store)
- [x] 7.2.6 Add loading state while waiting for selection
- [x] 7.2.7 Add keyboard accessibility
- [x] 7.2.8 Export component

### 7.3 Voice Transcript Component ✅
- [x] 7.3.1 Create `components/voice/VoiceTranscript.tsx`
- [x] 7.3.2 Implement scrollable message list
- [x] 7.3.3 Display user messages (right-aligned, blue)
- [x] 7.3.4 Display agent messages (left-aligned, gray)
- [x] 7.3.5 Add auto-scroll to latest message
- [x] 7.3.6 Add toggle button to show/hide transcript
- [x] 7.3.7 Style consistent with chat interface from text mode
- [x] 7.3.8 Make optional (accessibility best practice)
- [x] 7.3.9 Export component

### 7.4 Voice Reading Interface ✅
- [x] 7.4.1 Create `components/voice/VoiceReadingInterface.tsx`
- [x] 7.4.2 Import all voice components
- [x] 7.4.3 Connect to voice reading store via useVoiceSession hook
- [x] 7.4.4 Implement agent-based conditional rendering
  - [x] 7.4.4.1 IntentAssessmentAgent: Push-to-talk button + optional transcript
  - [x] 7.4.4.2 SpreadGenerationAgent: Card picker (when draw_card called) + guidance
  - [x] 7.4.4.3 ReadingAgent: Card display (when show_card called) + optional transcript
  - [x] 7.4.4.4 FollowupAgent: Push-to-talk button + optional transcript + card picker (if draw_card called)
  - [x] 7.4.4.5 Error state: Error message + recovery options
- [x] 7.4.5 Add back button (top-left corner)
- [x] 7.4.6 Add confirmation dialog on back button press
- [x] 7.4.7 Add agent indicator at top
- [x] 7.4.8 Handle cleanup on unmount (via useVoiceSession)
- [x] 7.4.9 Export component

### 7.5 Push-to-Talk Button ✅
- [x] 7.5.1 Create `components/voice/PushToTalkButton.tsx`
- [x] 7.5.2 Design large circular button (center of screen)
- [x] 7.5.3 Add visual states
  - [x] 7.5.3.1 Default: "Hold to Speak" hint
  - [x] 7.5.3.2 Pressing: Expand animation, "Listening..." text
  - [x] 7.5.3.3 Speaking: Different color, "AI is speaking..." text, pulsing animation
  - [x] 7.5.3.4 Disabled: Grayed out
- [x] 7.5.4 Implement mouse press-and-hold interaction
  - [x] 7.5.4.1 Placeholder for session interaction (SDK-managed)
  - [x] 7.5.4.2 Visual feedback on press/release
- [x] 7.5.5 Implement touch press-and-hold interaction (mobile)
- [x] 7.5.6 Implement keyboard interaction (Space/Enter)
- [x] 7.5.7 Add ARIA labels for accessibility
- [x] 7.5.8 Style with modern design system
- [x] 7.5.9 Export component

## Phase 8: Voice Reading Page & Mode Selection ✅

### 8.1 Voice Reading Page ✅
- [x] 8.1.1 Create `app/reading/voice/page.tsx`
- [x] 8.1.2 Implement page component
- [x] 8.1.3 Check browser WebRTC compatibility (handled by SDK)
- [x] 8.1.4 Use `useVoiceSession` hook via VoiceReadingInterface
- [x] 8.1.5 Render VoiceReadingInterface
- [x] 8.1.6 Add page metadata (title, description)
- [x] 8.1.7 Handle navigation away (cleanup via useVoiceSession)
- [x] 8.1.8 Show loading state while connecting (in VoiceReadingInterface)
- [x] 8.1.9 Show error state on connection failure (in VoiceReadingInterface)

### 8.2 Mode Selection on Reading Page ✅
- [x] 8.2.1 Update `app/reading/page.tsx`
- [x] 8.2.2 Add mode selection UI before reading starts
  - [x] 8.2.2.1 "Text Chat" button (existing flow)
  - [x] 8.2.2.2 "Voice Reading" button (navigate to `/reading/voice`)
  - [x] 8.2.2.3 Feature flag check (`NEXT_PUBLIC_VOICE_ENABLED`)
- [x] 8.2.3 Add descriptions for each mode
- [x] 8.2.4 Style mode selection with modern cards
- [x] 8.2.5 Add icons for each mode (MessageSquare, Mic)
- [x] 8.2.6 Make responsive for mobile

### 8.3 Feature Flag Integration ✅
- [x] 8.3.1 Add client-side check for `NEXT_PUBLIC_VOICE_ENABLED`
- [x] 8.3.2 Pass feature flag to ModeSelection component
- [x] 8.3.3 Hide voice option if disabled
- [x] 8.3.4 Add feature flag documentation in .env.local.example

## Phase 9: Error Handling & Recovery ✅

### 9.1 Browser Compatibility Errors ✅
- [x] 9.1.1 Detect missing WebRTC support
- [x] 9.1.2 Detect missing MediaDevices API
- [x] 9.1.3 Display specific error messages
- [x] 9.1.4 Offer fallback to text mode
- [x] 9.1.5 Log compatibility issues

### 9.2 Connection Errors ✅
- [x] 9.2.1 Handle token generation failures
- [x] 9.2.2 Handle WebRTC connection failures
- [x] 9.2.3 Handle network interruptions
- [x] 9.2.4 Handle OpenAI service unavailable (503)
- [x] 9.2.5 Display user-friendly error messages
- [x] 9.2.6 Offer retry and fallback options

### 9.3 Tool Execution Errors ✅
- [x] 9.3.1 Handle draw_card tool failures
  - [x] 9.3.1.1 Log error details
  - [x] 9.3.1.2 Return error to agent
  - [x] 9.3.1.3 Agent instructs user to retry
- [x] 9.3.2 Handle show_card tool failures
  - [x] 9.3.2.1 Log error details
  - [x] 9.3.2.2 Return error to agent
  - [x] 9.3.2.3 Agent may skip card or retry
- [x] 9.3.3 Add Zod validation error handling
  - [x] 9.3.3.1 Capture validation errors (handled by tools)
  - [x] 9.3.3.2 Return specific error details to agent
  - [x] 9.3.3.3 Allow agent to retry with corrected arguments

### 9.4 Agent Errors ✅
- [x] 9.4.1 Handle agent handoff failures
  - [x] 9.4.1.1 Log handoff error (placeholder in VoiceSessionManager)
  - [x] 9.4.1.2 Display error to user
  - [x] 9.4.1.3 Offer retry or text mode options
- [x] 9.4.2 Handle agent timeout (unusually long without handoff)
  - [x] 9.4.2.1 Log warning after threshold (implemented via session duration tracking)
  - [x] 9.4.2.2 Optionally prompt agent to proceed
- [x] 9.4.3 Preserve conversation history when possible

## Phase 10: Testing & Validation

### 10.1 Unit Tests
- [ ] 10.1.1 Test drawCardTool with mock store
- [ ] 10.1.2 Test showCardTool with mock store
- [ ] 10.1.3 Test voice reading store actions and state updates
- [ ] 10.1.4 Test Zod schema validation for tool parameters
- [ ] 10.1.5 Test VoiceSessionManager connection lifecycle

### 10.2 Integration Tests
- [ ] 10.2.1 Test token generation flow (mock OpenAI API)
- [ ] 10.2.2 Test RealtimeSession connection (mock SDK)
- [ ] 10.2.3 Test agent transitions via handoffs
- [ ] 10.2.4 Test tool execution flow (draw_card, show_card)
- [ ] 10.2.5 Test error recovery flows
- [ ] 10.2.6 Test cleanup on component unmount

### 10.3 Manual End-to-End Testing
- [ ] 10.3.1 Test complete voice reading flow
  - Intent Assessment → Spread Generation → Reading → Followup
- [ ] 10.3.2 Test draw_card tool in Spread Generation phase
- [ ] 10.3.3 Test show_card tool in Reading phase
- [ ] 10.3.4 Test clarification cards in Followup phase (both tools)
- [ ] 10.3.5 Test push-to-talk interaction
- [ ] 10.3.6 Test agent handoffs and transitions
- [ ] 10.3.7 Test error scenarios (permission denied, connection failed, etc.)
- [ ] 10.3.8 Test on Chrome (desktop)
- [ ] 10.3.9 Test on Firefox (desktop)
- [ ] 10.3.10 Test on Safari (desktop)
- [ ] 10.3.11 Test on iOS Safari (mobile)
- [ ] 10.3.12 Test on Android Chrome (mobile)

### 10.4 Performance Testing
- [ ] 10.4.1 Measure user-to-response latency (target: <2s)
- [ ] 10.4.2 Monitor audio playback smoothness (SDK-managed)
- [ ] 10.4.3 Test WebRTC connection stability
- [ ] 10.4.4 Test resource cleanup (no memory leaks)
- [ ] 10.4.5 Monitor agent transition performance

### 10.5 Accessibility Testing
- [ ] 10.5.1 Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] 10.5.2 Test keyboard navigation (Tab, Space, Enter)
- [ ] 10.5.3 Verify ARIA labels on all interactive elements
- [ ] 10.5.4 Test focus management across agent transitions
- [ ] 10.5.5 Verify announcements for connection status, agent changes, tool execution, errors

## Phase 11: Polish & Optimization

### 11.1 Agent Instructions Refinement
- [ ] 11.1.1 Test Intent Assessment Agent conversational flow
- [ ] 11.1.2 Tune response lengths (ensure 2-3 sentences max)
- [ ] 11.1.3 Adjust handoff timing (not too early/late)
- [ ] 11.1.4 Test Spread Generation Agent guidance quality
- [ ] 11.1.5 Test Reading Agent interpretation pacing and show_card usage
- [ ] 11.1.6 Test Followup Agent question handling and tool usage
- [ ] 11.1.7 Iterate based on user testing feedback

### 11.2 UI/UX Polish
- [ ] 11.2.1 Add smooth transitions between agent phases
- [ ] 11.2.2 Refine button animations (expand, pulse)
- [ ] 11.2.3 Add subtle sound effects (optional, configurable)
- [ ] 11.2.4 Improve loading states and spinners
- [ ] 11.2.5 Add visual feedback for connection status
- [ ] 11.2.6 Optimize mobile layout and touch targets
- [ ] 11.2.7 Add dark mode support (if not already present)

### 11.3 Error Message Refinement
- [ ] 11.3.1 Review all error messages for clarity
- [ ] 11.3.2 Add specific recovery instructions
- [ ] 11.3.3 Provide helpful context without technical jargon
- [ ] 11.3.4 Add support links or help documentation

### 11.4 Performance Optimization
- [ ] 11.4.1 Lazy-load voice components (code splitting)
- [ ] 11.4.2 Optimize re-renders with React.memo and useMemo
- [ ] 11.4.3 Monitor and reduce bundle size
- [ ] 11.4.4 Minimize state updates and re-renders

### 11.5 Analytics & Monitoring
- [ ] 11.5.1 Add session start/end logging
- [ ] 11.5.2 Log agent transitions with timestamps
- [ ] 11.5.3 Log tool executions (draw_card, show_card) with durations
- [ ] 11.5.4 Track error occurrences by type
- [ ] 11.5.5 Calculate latency metrics (p50, p95, p99)
- [ ] 11.5.6 Track cost metrics (connection minutes, estimated cost)

## Phase 12: Documentation & Deployment

### 12.1 Code Documentation
- [ ] 12.1.1 Add JSDoc comments to all public methods
- [ ] 12.1.2 Document agent instructions and rationale
- [ ] 12.1.3 Document tool definitions and schemas
- [ ] 12.1.4 Add inline comments for complex logic
- [ ] 12.1.5 Document WebRTC connection flow via SDK
- [ ] 12.1.6 Add usage examples in comments

### 12.2 User Documentation
- [ ] 12.2.1 Create voice mode user guide
- [ ] 12.2.2 Add troubleshooting section (permissions, compatibility)
- [ ] 12.2.3 Document browser support matrix (WebRTC compatibility)
- [ ] 12.2.4 Add FAQ for common issues
- [ ] 12.2.5 Explain agent handoff flow for users

### 12.3 Developer Documentation
- [ ] 12.3.1 Update README with voice mode setup instructions
- [ ] 12.3.2 Document environment variables in ENV_SETUP.md
- [ ] 12.3.3 Add architecture diagram to design.md (agent handoffs)
- [ ] 12.3.4 Document OpenAI Realtime API integration
- [ ] 12.3.5 Document OpenAI Agents SDK usage
- [ ] 12.3.6 Add testing guide
- [ ] 12.3.7 Document tool implementation pattern
- [ ] 12.3.8 Document agent instructions best practices

### 12.4 Deployment
- [ ] 12.4.1 Update deployment checklist with OpenAI API key
- [ ] 12.4.2 Configure production environment variables
- [ ] 12.4.3 Test in staging environment
- [ ] 12.4.4 Monitor initial production usage
- [ ] 12.4.5 Set up error alerting for voice sessions
- [ ] 12.4.6 Monitor API costs and usage
- [ ] 12.4.7 Document OpenAI Realtime API pricing

## Phase 13: Future Enhancements (Post-MVP)

### 13.1 Stored Prompts Migration
- [ ] 13.1.1 Create prompts in OpenAI platform
- [ ] 13.1.2 Update agent definitions to use `prompt_id` references
- [ ] 13.1.3 Add environment variables for prompt IDs
- [ ] 13.1.4 Implement fallback to inline instructions if prompt ID missing
- [ ] 13.1.5 Document migration process
- [ ] 13.1.6 Test with stored prompts

### 13.2 Advanced Features
- [ ] 13.2.1 Add voice selection option (nova, shimmer, etc.)
- [ ] 13.2.2 Implement session duration warnings (e.g., at 25 minutes)
- [ ] 13.2.3 Add transcript export functionality
- [ ] 13.2.4 Implement session pause/resume
- [ ] 13.2.5 Add voice reading history

## Dependencies

- **Phase 1** must complete before all other phases (dependencies installed)
- **Phase 2** must complete before Phase 6 (token needed for session)
- **Phase 3** must complete before Phase 4 (tools needed for agents)
- **Phase 4** must complete before Phase 6 (agents needed for session)
- **Phase 5** must complete before Phases 6 and 7 (store needed by session and UI)
- **Phase 6** must complete before Phases 7 and 8 (session needed for UI and pages)
- **Phase 7** must complete before Phase 8 (components needed for pages)
- **Phase 9** can run in parallel with Phases 6-8 (error handling integrated throughout)
- **Phase 10** must wait until Phases 1-9 are substantially complete
- **Phase 11** should follow Phase 10 (iterate based on testing)
- **Phase 12** runs last (documentation and deployment)
- **Phase 13** is post-MVP and optional

## Parallel Work Opportunities

- **Phases 3 and 5** can run concurrently (tools and store are independent)
- **Phase 4** (agent definitions) can proceed once Phase 3 is done
- **Phase 7** (UI components) can be built in parallel after Phase 5
- **Phase 9** (error handling) can be integrated incrementally across all phases
- **Phase 12** (documentation) can be written as features are completed
