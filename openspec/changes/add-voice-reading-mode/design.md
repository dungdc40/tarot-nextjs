# Voice Reading Mode - Architecture & Design

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │  Voice Reading   │◄────►│  VoiceAgentManager       │    │
│  │  Page/Components │      │  (Agents + Session)      │    │
│  └──────────────────┘      └───────────┬──────────────┘    │
│           │                             │                    │
│           │ (state updates)             │ (WebRTC)           │
│           ▼                             ▼                    │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │VoiceReadingStore │      │  @openai/agents SDK      │    │
│  │   (Zustand)      │      │  - RealtimeSession       │    │
│  └──────────────────┘      │  - RealtimeAgent (x4)    │    │
│                            │  - WebRTC Transport       │    │
│                            └──────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ WebRTC (Ephemeral Token Auth)
                              │ Audio: Automatic (SDK)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│            OpenAI Realtime API                               │
│  • Model: gpt-realtime-mini-2025-12-15                       │
│  • WebRTC for browser clients                                │
│  • Agent handoffs for phase transitions                      │
│  • Tool calling (draw_card)                                  │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │ Ephemeral Token Generation
                              │
┌──────────────────────────────────────────────────────────────┐
│                  Backend (Next.js API)                       │
├──────────────────────────────────────────────────────────────┤
│  POST /api/voice/token                                       │
│  • Calls OpenAI: POST /v1/realtime/client_secrets            │
│  • Returns ephemeral token (60s TTL default)                 │
│  • Rate-limited per session                                  │
└──────────────────────────────────────────────────────────────┘
```

## Agent Handoff Architecture

### Agent Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Voice Reading Flow                         │
└──────────────────────────────────────────────────────────────┘

Session starts with Intent Agent
         │
         ▼
┌─────────────────────────┐
│  Intent Assessment      │  Collects user's question
│  Agent                  │  Clarifies intent
│                         │  Extracts hidden concerns
└───────────┬─────────────┘
            │ Handoff when intent is clear
            ▼
┌─────────────────────────┐
│  Spread Generation      │  Determines optimal spread
│  Agent                  │  Explains position meanings
│  [draw_card tool]       │  Guides card selection
└───────────┬─────────────┘
            │ Tool calls draw_card for each position
            │ (User selects cards from UI)
            │ Handoff when all cards drawn
            ▼
┌─────────────────────────┐
│  Reading Agent          │  Interprets each card
│                         │  Provides synthesis
│                         │  Offers advice
└───────────┬─────────────┘
            │ Handoff when reading complete
            ▼
┌─────────────────────────┐
│  Followup Agent         │  Answers questions
│  [draw_card tool]       │  May request clarification cards
│                         │  Continues until satisfied
└─────────────────────────┘
            │
            └─ Stays active (no further handoffs)
```

### Context Preservation

**Automatic Context Transfer:**
- Voice agent handoffs automatically preserve full conversation history
- Each agent has access to all prior messages and tool calls
- No need for explicit context passing

**What Each Agent Sees:**

```typescript
// Intent Agent sees:
// - User's initial greeting
// - Their questions/clarifications

// Spread Agent sees (after handoff):
// - All intent agent conversation
// - Intent summary extracted from context

// Reading Agent sees (after handoff):
// - All intent agent conversation
// - All spread agent conversation
// - All draw_card tool calls with card results

// Followup Agent sees (after handoff):
// - Complete conversation history
// - All cards drawn
// - Full reading interpretation
```

## Authentication Flow

### Ephemeral Token Generation

```typescript
// Security model: Never expose OpenAI API key to browser

1. User initiates voice reading
   ↓
2. Frontend: POST /api/voice/token
   {
     sessionId: uuid() // Client-generated session ID
   }
   ↓
3. Backend validates request (rate limit check)
   ↓
4. Backend → OpenAI API: POST https://api.openai.com/v1/realtime/client_secrets
   Headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
   Body: {
     // Optional: configure TTL, other params
   }
   ↓
5. OpenAI returns ephemeral token:
   {
     client_secret: {
       value: "ek_...",
       expires_at: 1234567890
     }
   }
   ↓
6. Backend → Frontend:
   {
     token: "ek_...",
     expiresAt: 1234567890
   }
   ↓
7. Frontend initializes session:
   const session = new RealtimeSession(intentAgent);
   await session.connect({ apiKey: token });
```

**Security Considerations:**
- Tokens expire after 60 seconds by default (configurable)
- Backend enforces rate limiting (1 token per session every 30s)
- Tokens are single-use for session connection
- No API key exposure to client
- Session IDs prevent token reuse across different users

## Agent Definitions

### 1. Intent Assessment Agent

```typescript
// lib/agents/intentAgent.ts

import { RealtimeAgent } from '@openai/agents';

export const intentAgent = new RealtimeAgent({
  name: 'IntentAssessmentAgent',
  model: 'gpt-realtime-mini-2025-12-15',

  instructions: `You are a professional tarot reader beginning a voice reading session.

Your role is to understand the user's question through warm, conversational dialogue.

Guidelines:
- Greet the user warmly: "Welcome. What brings you to the cards today?"
- If their intent is unclear, ask ONE clarifying question at a time
- Listen for both the surface question and deeper concerns
- Keep your responses concise (2-3 sentences maximum)
- Use a mystical, welcoming tone with phrases like "I sense..." or "The cards are ready to explore..."

Important: When you have a CLEAR understanding of:
1. Their question or situation
2. Any deeper concerns or needs
3. The general topic area
4. Any relevant timeframe

Then hand off to the Spread Generation Agent.

Do not proceed to spread generation if you're uncertain about their intent.`,

  // Handoff defined when creating spread agent (to avoid circular reference)
  handoffs: [], // Will be set to [spreadAgent] after spreadAgent is created
});
```

### 2. Spread Generation Agent

```typescript
// lib/agents/spreadAgent.ts

import { RealtimeAgent } from '@openai/agents';
import { drawCardTool } from '../tools/drawCardTool';

export const spreadAgent = new RealtimeAgent({
  name: 'SpreadGenerationAgent',
  model: 'gpt-realtime-mini-2025-12-15',

  instructions: `You are a tarot reader selecting the optimal spread and guiding card selection.

Your role is to choose the right spread for the user's intent and guide them through drawing cards.

Spread Selection:
- Choose 1-10 cards based on question complexity
- Simple yes/no: 1-3 cards
- Situational analysis: 3-5 cards
- Complex decisions: 5-7 cards
- Life path questions: 7-10 cards

Process for each position:
1. Announce the spread type and why it suits their question
2. For each position:
   a. Describe what this position represents
   b. Call the draw_card tool with positionLabel and promptRole
   c. Wait for the tool to return the card
   d. Acknowledge the card: "Interesting, [CardName]. Let's continue..."
3. When all cards are drawn, hand off to the Reading Agent

Example:
"Based on your question about career direction, I'm using a Three Card Spread. The first position represents your current situation. Please draw a card for the present moment."

[call draw_card tool with positionLabel="Present", promptRole="Current career situation"]
[tool returns: The Fool]

"The Fool appears in your present. Let's draw the next card for challenges ahead..."

When all positions are filled, say: "Your spread is complete. Let me now interpret what the cards reveal..."
Then hand off to the Reading Agent.`,

  tools: [drawCardTool],
  handoffs: [], // Will be set to [readingAgent]
});
```

### 3. Reading Agent

```typescript
// lib/agents/readingAgent.ts

import { RealtimeAgent } from '@openai/agents';
import { showCardTool } from '../tools/showCardTool';

export const readingAgent = new RealtimeAgent({
  name: 'ReadingAgent',
  model: 'gpt-realtime-mini-2025-12-15',

  instructions: `You are a tarot reader providing the interpretation of the drawn cards.

You have access to:
- The user's intent and question
- The spread layout and position meanings
- All drawn cards with their positions

Your interpretation process for EACH card:
1. Call the show_card tool with the card's ID
2. Wait for the tool to complete (this displays the card on screen)
3. Then speak your interpretation of that card

Your interpretation should:
1. Interpret each card in its position context
   - Consider upright vs. reversed
   - Relate to the position's meaning
   - Connect to the user's question

2. Note patterns and interactions
   - Major vs. Minor Arcana balance
   - Suit patterns
   - Numerical sequences
   - Thematic connections

3. Provide synthesis
   - Tie all cards together into a coherent narrative
   - Address the user's original question directly
   - Offer practical, actionable insights

4. Delivery style
   - Pace your interpretation for spoken comprehension
   - Use pauses between cards
   - Speak conversationally, not like reading text
   - Maintain mystical, professional tone

When you've completed the full reading (all cards + synthesis + advice), say something like:
"This completes your reading. Do you have any questions or would you like clarification on anything?"

Then hand off to the Followup Agent.`,

  tools: [showCardTool],
  handoffs: [], // Will be set to [followupAgent]
});
```

### 4. Followup Agent

```typescript
// lib/agents/followupAgent.ts

import { RealtimeAgent } from '@openai/agents';
import { drawCardTool } from '../tools/drawCardTool';
import { showCardTool } from '../tools/showCardTool';

export const followupAgent = new RealtimeAgent({
  name: 'FollowupAgent',
  model: 'gpt-realtime-mini-2025-12-15',

  instructions: `You are a tarot reader answering follow-up questions about a completed reading.

You have access to:
- The complete conversation history
- The original intent and question
- All cards that were drawn
- The full reading interpretation

Your role:
1. Answer questions using the existing spread when possible
   - Refer back to specific cards
   - Expand on interpretations
   - Make new connections

2. Only request new cards when truly necessary
   - If the question requires additional insight beyond the current spread
   - Maximum 1-3 cards at a time
   - Use draw_card tool with clear position meanings

3. When you draw new cards, ALWAYS call show_card before interpreting
   - First: draw_card to request the card
   - Then: show_card to display it
   - Finally: speak your interpretation

4. Keep the conversation flowing
   - Be conversational and warm
   - Provide concise, focused answers
   - Ask if they need anything else

When to call draw_card:
- User asks something the current cards don't address
- They want to explore a new angle or timeframe
- Clarification requires additional perspective

Format: "To answer that question, let's draw a clarification card..."
[call draw_card with appropriate positionLabel and promptRole]
[call show_card with the returned cardId]
[speak interpretation]

You stay active until the user indicates they're satisfied or ends the session.
No handoffs from this agent - this is the final conversational phase.`,

  tools: [drawCardTool, showCardTool],
  // No handoffs - stays active
});
```

## Tool Implementation

### Tool 1: Draw Card Tool

```typescript
// lib/tools/drawCardTool.ts

import { tool } from '@openai/agents';
import { z } from 'zod';
import { voiceReadingStore } from '../stores/voiceReadingStore';

export const drawCardTool = tool({
  name: 'draw_card',
  description: `Request the user to draw a tarot card for a specific position in the spread.

  Call this tool when you need the user to select a card. The UI will display the card picker
  (similar to text reading mode), the user will select a card from the shuffled deck, the card
  will be revealed, and the tool will return the card details.

  You should call this once for each position in your spread layout.`,

  parameters: z.object({
    positionLabel: z.string().describe(
      'The name of this position in the spread (e.g., "Past", "Present", "Future", "Outcome", "Advice"). ' +
      'This is shown to the user so they know what they\'re drawing for.'
    ),
    promptRole: z.string().describe(
      'A brief description of what this position represents in the reading. ' +
      'Example: "This card represents your current situation" or "This reveals the hidden influences"'
    ),
  }),

  execute: async ({ positionLabel, promptRole }) => {
    // Update store to show card picker UI (similar to text reading mode)
    voiceReadingStore.setState({
      cardPickerVisible: true,
      currentPosition: {
        label: positionLabel,
        role: promptRole,
      },
    });

    // Wait for user to select a card
    // This creates a Promise that resolves when the user picks a card
    const card = await new Promise((resolve) => {
      voiceReadingStore.setState({
        onCardSelected: (selectedCard) => {
          resolve(selectedCard);
          voiceReadingStore.setState({
            cardPickerVisible: false,
            currentPosition: null,
          });
        },
      });
    });

    // After selection, card is revealed (similar to text reading mode)
    // Then return card details to the agent
    return {
      cardId: card.id,
      cardName: card.name,
      reversed: card.reversed,
      success: true,
    };
  },
});
```

### Tool 2: Show Card Tool

```typescript
// lib/tools/showCardTool.ts

import { tool } from '@openai/agents';
import { z } from 'zod';
import { voiceReadingStore } from '../stores/voiceReadingStore';

export const showCardTool = tool({
  name: 'show_card',
  description: `Display a card on screen before interpreting it.

  Call this tool before speaking your interpretation of each card. This shows the card
  visually to the user. The tool will wait for the display animation to complete before
  returning.

  IMPORTANT: Call this for EACH card before interpreting it.`,

  parameters: z.object({
    cardId: z.string().describe(
      'The ID of the card to display (e.g., "the-fool", "the-magician"). ' +
      'This should be the cardId from the cards drawn in previous phases.'
    ),
    reversed: z.boolean().describe(
      'Whether the card is reversed (upside down). This affects how the card is displayed.'
    ),
  }),

  execute: async ({ cardId, reversed }) => {
    // Show the card visually on screen
    // Agent waits for this to complete before speaking
    await voiceReadingStore.showCard(cardId, reversed);

    return {
      success: true,
      cardId,
      reversed,
    };
  },
});
```

### Tool Execution Flows

#### draw_card Flow (Spread & Followup Agents)

```
1. Spread Agent calls draw_card("Present", "Your current situation")
   ↓
2. Tool execute() function runs
   ↓
3. Store updates: cardPickerVisible = true
   ↓
4. React component renders card carousel (watches store)
   ↓
5. User selects card from shuffled deck
   ↓
6. Card is revealed (flip animation, similar to text mode)
   ↓
7. Component calls voiceReadingStore.onCardSelected(card)
   ↓
8. Promise resolves with card data
   ↓
9. Tool returns card to agent
   ↓
10. Agent receives: { cardId: "the-fool", cardName: "The Fool", reversed: false }
   ↓
11. Agent acknowledges: "The Fool appears..." and continues
```

#### show_card Flow (Reading & Followup Agents)

```
1. Reading Agent calls show_card("the-fool", false)
   ↓
2. Tool execute() function runs
   ↓
3. Store shows card visually on screen (upright orientation)
   ↓
4. Display animation plays (if applicable)
   ↓
5. Promise resolves when display is complete
   ↓
6. Tool returns: { success: true, cardId: "the-fool", reversed: false }
   ↓
7. Agent receives confirmation
   ↓
8. Agent speaks interpretation: "The Fool in the present position..."
```

#### Combined Flow (Followup Agent - Drawing New Cards)

```
1. User asks follow-up question requiring new cards
   ↓
2. Agent calls draw_card("Clarification", "Additional insight")
   ↓
3. User selects card, card is revealed
   ↓
4. Tool returns: { cardId: "the-tower", cardName: "The Tower", reversed: true }
   ↓
5. Agent calls show_card("the-tower", true)
   ↓
6. Card displays on screen (reversed orientation)
   ↓
7. Tool returns: { success: true, cardId: "the-tower", reversed: true }
   ↓
8. Agent speaks: "The Tower reversed appears as clarification..."
```

## WebRTC Transport (Handled by SDK)

The OpenAI Agents SDK automatically handles WebRTC transport in browser environments:

```typescript
// SDK handles this automatically:
// 1. Microphone permission request
// 2. Audio capture from mic
// 3. WebRTC peer connection establishment
// 4. Audio encoding and streaming
// 5. Audio decoding and playback
// 6. Voice Activity Detection (VAD)

// We just connect:
const session = new RealtimeSession(intentAgent);
await session.connect({ apiKey: ephemeralToken });

// SDK automatically:
// - Requests mic permission
// - Sets up WebRTC connection
// - Starts capturing audio
// - Plays back agent responses
```

### Manual Audio Control (if needed)

```typescript
// Optional: Custom media stream
const customStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  }
});

const session = new RealtimeSession(intentAgent, {
  transport: new OpenAIRealtimeWebRTC({
    mediaStream: customStream,
  })
});
```

## State Management

### Voice Reading Store

```typescript
// lib/stores/voiceReadingStore.ts

import { create } from 'zustand';

interface VoiceReadingState {
  // Session state
  sessionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  currentAgent: 'intent' | 'spread' | 'reading' | 'followup' | null;

  // Reading data
  intent: {
    summary: string | null;
    hiddenConcern: string | null;
    topic: string | null;
    timeframe: string | null;
  };

  spread: {
    type: string | null;
    positions: Array<{
      label: string;
      role: string;
      card: {
        id: string;
        name: string;
        reversed: boolean;
      } | null;
    }>;
  };

  // Card picker state (for draw_card tool)
  cardPickerVisible: boolean;
  currentPosition: {
    label: string;
    role: string;
  } | null;
  shuffledDeck: string[]; // Card IDs
  onCardSelected: ((card: Card) => void) | null;

  // Transcript
  transcriptVisible: boolean;
  messages: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
    agentName?: string;
  }>;

  // Audio state
  isMuted: boolean;
  isAgentSpeaking: boolean;

  // Actions
  setSessionStatus: (status: VoiceReadingState['sessionStatus']) => void;
  setCurrentAgent: (agent: VoiceReadingState['currentAgent']) => void;
  requestCardDraw: (label: string, role: string) => Promise<Card>;
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  toggleMute: () => void;
  toggleTranscript: () => void;
  reset: () => void;
}

export const voiceReadingStore = create<VoiceReadingState>((set, get) => ({
  // Initial state...
  sessionStatus: 'idle',
  currentAgent: null,
  intent: {
    summary: null,
    hiddenConcern: null,
    topic: null,
    timeframe: null,
  },
  spread: {
    type: null,
    positions: [],
  },
  cardPickerVisible: false,
  currentPosition: null,
  shuffledDeck: [],
  onCardSelected: null,
  transcriptVisible: false,
  messages: [],
  isMuted: false,
  isAgentSpeaking: false,

  // Actions...
  setSessionStatus: (status) => set({ sessionStatus: status }),
  setCurrentAgent: (agent) => set({ currentAgent: agent }),

  requestCardDraw: async (label, role) => {
    // Called by draw_card tool
    return new Promise((resolve) => {
      set({
        cardPickerVisible: true,
        currentPosition: { label, role },
        onCardSelected: (card) => {
          resolve(card);
          set({
            cardPickerVisible: false,
            currentPosition: null,
            onCardSelected: null,
          });
        },
      });
    });
  },

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, timestamp: new Date() }],
  })),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleTranscript: () => set((state) => ({ transcriptVisible: !state.transcriptVisible })),

  reset: () => set({
    sessionStatus: 'idle',
    currentAgent: null,
    intent: { summary: null, hiddenConcern: null, topic: null, timeframe: null },
    spread: { type: null, positions: [] },
    messages: [],
    isMuted: false,
    isAgentSpeaking: false,
  }),
}));
```

## UI Component Architecture

```
VoiceReadingPage
├── VoiceAgentManager (initializes agents, manages session)
├── VoiceReadingInterface
│   ├── VoiceAgentIndicator (shows current agent)
│   ├── VoiceTranscript (optional, toggleable)
│   ├── VoiceCardPicker (shown when cardPickerVisible=true)
│   └── VoiceControls
│       ├── BackButton
│       ├── MuteToggle
│       └── TranscriptToggle
└── (Session event handlers for transcript updates)
```

### React Hook for Session Management

```typescript
// lib/hooks/useVoiceSession.ts

import { useEffect, useState } from 'react';
import { RealtimeSession } from '@openai/agents';
import { voiceReadingStore } from '../stores/voiceReadingStore';
import { intentAgent } from '../agents/intentAgent';

export function useVoiceSession() {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const connect = async () => {
    try {
      voiceReadingStore.setState({ sessionStatus: 'connecting' });

      // Get ephemeral token from backend
      const response = await fetch('/api/voice/token', { method: 'POST' });
      const { token } = await response.json();

      // Create session
      const newSession = new RealtimeSession(intentAgent);

      // Listen for events
      newSession.on('agent_updated', (agent) => {
        const agentName = agent.name.replace('Agent', '').toLowerCase();
        voiceReadingStore.setCurrentAgent(agentName as any);
      });

      newSession.on('response.audio.delta', () => {
        voiceReadingStore.setState({ isAgentSpeaking: true });
      });

      newSession.on('response.audio.done', () => {
        voiceReadingStore.setState({ isAgentSpeaking: false });
      });

      // Connect with token
      await newSession.connect({ apiKey: token });

      setSession(newSession);
      voiceReadingStore.setState({ sessionStatus: 'connected', currentAgent: 'intent' });
    } catch (err) {
      setError(err as Error);
      voiceReadingStore.setState({ sessionStatus: 'error' });
    }
  };

  const disconnect = async () => {
    if (session) {
      await session.close();
      setSession(null);
      voiceReadingStore.reset();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (session) {
        session.close();
      }
    };
  }, [session]);

  return {
    session,
    connect,
    disconnect,
    error,
  };
}
```

## Error Handling

### Connection Errors

```typescript
// Session connection failures
try {
  await session.connect({ apiKey: token });
} catch (error) {
  if (error.message.includes('permission')) {
    // Microphone permission denied
    showError('Microphone access is required. Please enable it in your browser settings.');
  } else if (error.message.includes('token')) {
    // Invalid or expired token
    showError('Session token expired. Please try again.');
  } else {
    // Generic connection error
    showError('Unable to connect to voice service. Please check your internet connection.');
  }
}
```

### Tool Execution Errors

```typescript
// In drawCardTool execute function
execute: async ({ positionLabel, promptRole }) => {
  try {
    const card = await voiceReadingStore.requestCardDraw(positionLabel, promptRole);
    return {
      cardId: card.id,
      cardName: card.name,
      reversed: card.reversed,
      success: true,
    };
  } catch (error) {
    // Return error to agent
    return {
      success: false,
      error: 'Unable to select card. Please try again.',
    };
  }
}
```

## Performance Considerations

### Latency Optimization

- OpenAI Realtime API: ~300-800ms response time
- WebRTC: ~50-100ms network latency
- Total user-to-response: ~400-900ms (sub-1-second)

### Resource Management

```typescript
// Cleanup on component unmount
useEffect(() => {
  return () => {
    session?.close();
    voiceReadingStore.reset();
  };
}, []);
```

### Session Duration Limits

```typescript
// Track session duration
const SESSION_MAX_DURATION = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_TIME = 25 * 60 * 1000; // 25 minutes

useEffect(() => {
  if (sessionStatus === 'connected') {
    const warningTimer = setTimeout(() => {
      showNotification('Your session will end in 5 minutes');
    }, SESSION_WARNING_TIME);

    const maxTimer = setTimeout(() => {
      disconnect();
      showNotification('Session ended after 30 minutes');
    }, SESSION_MAX_DURATION);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(maxTimer);
    };
  }
}, [sessionStatus]);
```

## Testing Strategy

### Unit Tests
- Agent instruction clarity
- Tool parameter validation
- State management actions

### Integration Tests
- Agent handoff flow
- Tool execution and UI updates
- Session lifecycle

### Manual Testing
- End-to-end voice reading flow
- Agent transitions
- Card selection via tool calls
- Error scenarios

## Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "@openai/agents": "^latest",
    "zod": "^3.0.0"
  }
}
```

### Environment Variables
```bash
# OpenAI Realtime API
OPENAI_API_KEY=sk-...
OPENAI_VOICE_ENABLED=true
OPENAI_VOICE_MODEL=gpt-realtime-mini-2025-12-15
OPENAI_VOICE_NAME=nova  # or shimmer, alloy, echo, fable, onyx
OPENAI_VOICE_TOKEN_TTL=60  # seconds

# Later: Stored Prompt IDs (when migrating from inline instructions)
# OPENAI_PROMPT_VOICE_INTENT_ID=...
# OPENAI_PROMPT_VOICE_SPREAD_ID=...
# OPENAI_PROMPT_VOICE_READING_ID=...
# OPENAI_PROMPT_VOICE_FOLLOWUP_ID=...
```
