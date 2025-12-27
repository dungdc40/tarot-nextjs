# Add Voice Reading Mode

## Why

Currently, the application only supports text-based tarot readings through a chat interface. Users must type their questions and read AI-generated text responses. While effective, this approach:
- Requires manual typing, which can be slower and less natural for some users
- Lacks the intimate, conversational feel of a traditional in-person tarot reading
- Doesn't leverage modern voice AI capabilities for more immersive experiences
- Limits accessibility for users who prefer or need voice-based interactions

Adding a voice reading mode will:
- Enable hands-free, conversational tarot readings using real-time voice
- Provide a more immersive and ritualistic experience similar to in-person readings
- Leverage OpenAI's Realtime API with GPT-4o-mini-realtime for low-latency voice interaction
- Maintain the same reading flow (intent → spread → cards → interpretation → follow-ups) but through natural conversation
- Offer users choice between text chat and voice modes based on their preference and context

## What Changes

### Core Changes
- Add voice mode selection on `/reading` page (text chat vs. voice)
- Integrate OpenAI Realtime API with WebRTC for low-latency voice communication
- Use OpenAI Agents SDK (`@openai/agents`) for agent orchestration and session management
- Create ephemeral token authentication system for secure client-side connections
- Implement agent handoff architecture with 4 specialized agents (Intent, Spread, Reading, Followup)
- Design voice reading UI with push-to-talk interaction and phase-aware display
- Implement `draw_card` tool for user card selection during spread and clarifications
- Use stored prompts (cloud-based, similar to current text mode prompts) for each agent
- Add voice-specific state management tracking agent transitions
- Leverage WebRTC for automatic audio capture and playback (handled by SDK)

### Voice Mode Flow with Agent Handoffs

The voice reading uses **4 specialized agents** connected via handoffs. Each agent focuses on one phase of the reading:

```
Intent Agent → Spread Agent → Reading Agent → Followup Agent
```

#### 1. Intent Assessment Agent
- **Role**: Collect and clarify user's question through conversation
- **Behavior**:
  - Asks clarifying questions if intent is unclear
  - Extracts hidden concerns and deeper needs
  - Maintains warm, conversational tone
- **Handoff Trigger**: When intent is clear and complete
- **Handoff To**: Spread Generation Agent
- **Context Passed**: Intent summary, hidden concern, topic, timeframe

#### 2. Spread Generation Agent
- **Role**: Generate optimal spread and guide card selection
- **Behavior**:
  - Determines spread type based on intent (1-10 cards)
  - Explains spread layout and position meanings
  - Guides user through drawing each card
- **Tool Available**: `draw_card(positionLabel, promptRole)`
  - Called for each position in the spread
  - UI shows card carousel, user selects card
  - Returns: `{ cardId, cardName, reversed }`
- **Handoff Trigger**: When all spread positions have cards drawn
- **Handoff To**: Reading Agent
- **Context Passed**: Intent, spread layout, all drawn cards

#### 3. Reading Agent
- **Role**: Interpret cards and provide complete reading
- **Behavior**:
  - Has access to all cards drawn in previous phase
  - For each card: calls `show_card(cardId)` before interpreting
  - Interprets each card in its position context
  - Considers card interactions and patterns
  - Provides synthesis tying everything together
  - Offers actionable advice
- **Tool Available**: `show_card(cardId)`
  - Called before interpreting each card
  - UI displays the card visually
  - Agent waits for tool to complete before speaking interpretation
- **Handoff Trigger**: When complete reading is delivered
- **Handoff To**: Followup Agent
- **Context Passed**: Full reading with all interpretations

#### 4. Followup Agent
- **Role**: Answer follow-up questions and provide clarifications
- **Behavior**:
  - Answers questions based on existing spread
  - Requests additional cards only when necessary
  - Maintains conversation until user is satisfied
- **Tools Available**:
  - `draw_card(positionLabel, promptRole)` - Request user to draw additional card(s)
    - Called when clarification requires new cards (1-3 max)
    - UI shows card picker, user selects card
    - Returns card details to agent
  - `show_card(cardId)` - Display a card before interpreting
    - Called before interpreting newly drawn cards
    - UI displays the card visually
- **Handoff Trigger**: None - remains active for entire followup phase
- **Context Passed**: All previous context (cumulative spread)

### Authentication Strategy
- Backend endpoint (`POST /api/voice/token`) generates ephemeral client secrets from OpenAI
- Tokens are short-lived (60 seconds default, configurable)
- Frontend requests token before initializing RealtimeSession
- Token authenticates the WebRTC connection without exposing API key
- Each reading session uses a fresh ephemeral token

### Agent and Tool Architecture

#### Agent Definitions (using OpenAI Agents SDK):

```typescript
import { RealtimeAgent, RealtimeSession, tool } from '@openai/agents';
import { z } from 'zod';

// Tool 1: draw_card (used by Spread and Followup agents)
const drawCardTool = tool({
  name: 'draw_card',
  description: 'Request user to draw a tarot card for a specific spread position',
  parameters: z.object({
    positionLabel: z.string().describe('Name of the position (e.g., "Past", "Present")'),
    promptRole: z.string().describe('What this position represents in the reading'),
  }),
  execute: async ({ positionLabel, promptRole }) => {
    // Show UI card picker (similar to text reading mode)
    // User selects from shuffled deck
    // After selection, card is revealed
    // Return card details to agent
    const card = await voiceReadingStore.requestCardDraw(positionLabel, promptRole);
    return {
      cardId: card.id,
      cardName: card.name,
      reversed: card.reversed,
    };
  },
});

// Tool 2: show_card (used by Reading and Followup agents)
const showCardTool = tool({
  name: 'show_card',
  description: 'Display a card on screen before interpreting it',
  parameters: z.object({
    cardId: z.string().describe('The ID of the card to display (e.g., "the-fool")'),
    reversed: z.boolean().describe('Whether the card is reversed (upside down)'),
  }),
  execute: async ({ cardId, reversed }) => {
    // Show the card visually on screen
    // Agent waits for this to complete before speaking
    await voiceReadingStore.showCard(cardId, reversed);
    return {
      success: true,
    };
  },
});

// 1. Intent Assessment Agent
const intentAgent = new RealtimeAgent({
  name: 'IntentAssessmentAgent',
  model: 'gpt-realtime-mini-2025-12-15',
  instructions: `You are a professional tarot reader beginning a voice reading session.

Your role is to understand the user's question through warm, conversational dialogue.
- Greet the user and ask what brings them to the cards today
- If their intent is unclear, ask ONE clarifying question at a time
- Listen for both the surface question and deeper concerns
- Keep responses concise (2-3 sentences)
- Use mystical, welcoming tone

When you have a clear understanding of their intent, hand off to the Spread Generation Agent.`,
  handoffs: [spreadAgent], // Forward reference
});

// 2. Spread Generation Agent
const spreadAgent = new RealtimeAgent({
  name: 'SpreadGenerationAgent',
  model: 'gpt-realtime-mini-2025-12-15',
  instructions: `You are a tarot reader selecting and guiding card selection for a spread.

Based on the user's intent, determine the optimal spread (1-10 cards).
- Announce the spread type and explain why it suits their question
- Describe each position's meaning before requesting the card
- Use the draw_card tool for each position
- Guide the user patiently through each draw

When all cards are drawn, hand off to the Reading Agent.`,
  tools: [drawCardTool],
  handoffs: [readingAgent], // Forward reference
});

// 3. Reading Agent
const readingAgent = new RealtimeAgent({
  name: 'ReadingAgent',
  model: 'gpt-realtime-mini-2025-12-15',
  instructions: `You are a tarot reader providing the interpretation.

You have access to all cards that were drawn in the previous phase.

For each card in the spread:
1. Call the show_card tool with the card's ID
2. Wait for the tool to complete (card displays on screen)
3. Then speak your interpretation of that card

After all cards are interpreted:
- Note patterns and interactions between cards
- Provide a synthesis tying everything together
- Offer practical, actionable advice
- Pace your delivery for spoken comprehension

When the reading is complete, hand off to the Followup Agent.`,
  tools: [showCardTool],
  handoffs: [followupAgent], // Forward reference
});

// 4. Followup Agent
const followupAgent = new RealtimeAgent({
  name: 'FollowupAgent',
  model: 'gpt-realtime-mini-2025-12-15',
  instructions: `You are a tarot reader answering follow-up questions.

Based on the full reading context:
- Answer questions using the existing spread when possible
- Only use draw_card if the question truly requires new cards (1-3 max)
- When you draw new cards, call show_card before interpreting them
- Keep responses conversational and concise
- Stay in this phase until user indicates they're satisfied

Tool usage:
1. draw_card - Request user to draw additional clarification card(s)
2. show_card - Display a newly drawn card before interpreting it

You have access to the complete conversation history.`,
  tools: [drawCardTool, showCardTool],
  // No handoffs - stays active
});

// Initialize session with first agent
const session = new RealtimeSession(intentAgent);
await session.connect({ apiKey: ephemeralToken });
```

### Voice UI Design

**SDK Handles Audio Automatically:**
- OpenAI Agents SDK with WebRTC automatically manages microphone and speaker
- No manual MediaRecorder or AudioContext needed
- Push-to-talk can be implemented via session.interrupt() or mute controls

**UI States by Agent:**
- **Intent Agent Active**: Microphone active indicator, optional transcript display
- **Spread Agent Active**: Card carousel appears when `draw_card` tool is called
  - Agent announces position → tool executes → UI shows picker → user selects → returns to agent
- **Reading Agent Active**: Agent speaks interpretation, optional transcript
- **Followup Agent Active**: Microphone active, optional transcript, may show card picker if `draw_card` called

**Persistent UI Elements:**
- Back button (top-left)
- Current agent indicator (subtle display)
- Mute/unmute microphone toggle
- Transcript toggle (show/hide)

### Files to Create/Modify

**New Files:**
- `app/api/voice/token/route.ts` - Ephemeral token generation endpoint
- `app/reading/voice/page.tsx` - Voice reading mode page
- `components/voice/VoiceReadingInterface.tsx` - Main voice UI container
- `components/voice/VoiceTranscript.tsx` - Optional transcript display
- `components/voice/VoiceCardPicker.tsx` - Card selection UI triggered by `draw_card` tool
- `components/voice/VoiceAgentIndicator.tsx` - Shows current agent and status
- `lib/services/VoiceAgentManager.ts` - Manages agents, session, and handoffs
- `lib/hooks/useVoiceSession.ts` - React hook for voice session lifecycle
- `lib/types/voice.ts` - Voice-specific type definitions
- `lib/stores/voiceReadingStore.ts` - Voice reading state management
- `lib/agents/intentAgent.ts` - Intent Assessment Agent definition
- `lib/agents/spreadAgent.ts` - Spread Generation Agent definition
- `lib/agents/readingAgent.ts` - Reading Agent definition
- `lib/agents/followupAgent.ts` - Followup Agent definition
- `lib/tools/drawCardTool.ts` - Card drawing tool implementation
- `lib/tools/showCardTool.ts` - Card display tool implementation

**Modified Files:**
- `app/reading/page.tsx` - Add mode selection (text vs. voice)
- `lib/types/reading.ts` - Add voice-specific state types
- `.env.local.example` - Add OpenAI Realtime API configuration
- `package.json` - Add `@openai/agents` and `zod@3` dependencies

### Breaking Changes
**NONE** - This is an additive feature. Existing text-based reading mode continues to work unchanged. Voice mode is opt-in.

## Impact

**Affected specs:**
- `specs/ai-integration/spec.md` - Add OpenAI Realtime API integration requirements
- `specs/voice-reading/spec.md` - NEW: Voice reading capability specification

**Affected code:**
- `app/reading/page.tsx` - Mode selection UI
- Card picker components - Reuse for voice card selection
- Reading store patterns - Extended for voice state
- Environment configuration - Add OpenAI Realtime API keys

**Migration path:**
1. Install `@openai/agents` SDK and `zod@3`
2. Implement ephemeral token generation backend
3. Create 4 agent definitions with instructions
4. Implement `draw_card` tool
5. Build voice UI components (interface, transcript, card picker)
6. Create voice session manager and React hooks
7. Test agent handoffs and tool execution
8. Configure stored prompts in OpenAI platform (later migration)
9. Add mode selection to reading page
10. Document voice setup and usage

**User Experience Changes:**
- Users see new "Voice" option on reading page
- Voice readings feel more conversational and immersive
- Same reading quality and flow, different interaction modality
- Opt-in feature - no changes to existing text mode experience

## Open Questions

1. **Transcript Display**: Should voice conversations show a live transcript, or remain purely auditory?
   - **Option A**: Pure audio (more immersive, less distraction)
   - **Option B**: Live transcript (accessibility, review capability)
   - **Recommendation**: Make transcript optional via toggle button (accessibility best practice)

2. **Voice Selection**: OpenAI Realtime API offers multiple voices (alloy, echo, fable, onyx, nova, shimmer). Which should we use?
   - **Recommendation**: Start with "nova" or "shimmer" (warm, clear voices suitable for tarot readings)
   - Make voice configurable via environment variable

3. **Turn Detection**: How aggressive should automatic turn detection be?
   - OpenAI SDK has server-side VAD (Voice Activity Detection) by default
   - Can configure silence duration thresholds
   - **Recommendation**: Use default settings initially, tune based on user feedback

4. **Agent Transition UX**: How should we indicate to users when agents hand off?
   - **Option A**: Silent transition (seamless)
   - **Option B**: Brief visual indicator
   - **Option C**: Agent announces transition verbally
   - **Recommendation**: Option B - subtle UI indicator showing current agent

5. **Error Recovery**: How to handle tool execution failures (e.g., `draw_card` fails)?
   - Tool returns error object to agent
   - Agent should apologize and retry or ask user to retry
   - **Recommendation**: Include error handling in agent instructions

6. **Session Duration Limits**: How long should a voice session last?
   - OpenAI Realtime API charges per audio minute
   - **Recommendation**: Set max session duration (e.g., 30 minutes) with warning at 25 minutes

7. **Stored Prompts Migration**: When to migrate from inline instructions to stored prompts?
   - **Recommendation**: Start with inline for faster iteration, migrate to stored prompts once instructions stabilize
