# Add Xai LLM Provider Support

## Why

Currently, the application exclusively uses OpenAI's GPT models with stored prompts (referenced by prompt_id). We need to add support for Xai's Grok 4.1 fast reasoning model as an alternative LLM provider. This will:
- Provide flexibility to leverage different LLM capabilities (Xai's reasoning specialization)
- Reduce vendor lock-in and enable cost optimization
- Establish an extensible pattern for adding more LLM providers in the future

Since Xai doesn't support OpenAI's stored prompts feature, we need to migrate prompts to be defined in-code while maintaining backward compatibility with OpenAI's existing stored prompts.

## What Changes

### Core Changes
- Add extensible LLM provider abstraction layer to support multiple providers (OpenAI, Xai, future providers)
- Add startup-time LLM provider configuration via `LLM_PROVIDER` environment variable
- Create feature-specific in-code prompt definitions for Xai (since it doesn't support stored prompts)
- Maintain backward compatibility with OpenAI's stored prompts during migration
- Configure Xai client to use `https://api.x.ai/v1` with extended timeout (360000ms for reasoning models)
- Update all AI API routes to use the new provider abstraction
- Add comprehensive type definitions for prompts, schemas, and provider responses
- Add environment variable validation for provider-specific configuration

### Provider Selection Strategy
- Provider is selected once at server startup via `LLM_PROVIDER` env variable (`openai` or `xai`)
- Simplifies API routes (no per-request provider logic)
- Requires server restart to switch providers

### Prompt Management Strategy
- **OpenAI**: Continue using stored prompts referenced by prompt_id (existing behavior)
- **Xai**: Use feature-specific in-code prompt definitions (e.g., `lib/prompts/intent-prompt.ts`)
- Provider abstraction handles prompt resolution transparently

### API Integration Strategy
Both providers use the OpenAI SDK's Responses API with different prompt strategies:

**OpenAI Implementation:**
```typescript
// Uses Responses API with stored prompts referenced by ID
const response = await openai.responses.create({
  model: 'gpt-4o-mini',
  input: userInput,
  prompt: {
    id: promptId, // Reference to stored prompt in OpenAI platform
  },
  previous_response_id: previousResponseId, // For conversation continuity
})
// Extract content using extractAssistantOutputText() helper
```

**Xai Implementation:**
```typescript
// Uses Responses API with system prompt in input messages array
const response = await xai.responses.create({
  model: 'grok-2-latest',
  input: [
    {
      role: 'system',
      content: systemPrompt, // System prompt passed as message (not instructions)
    },
    {
      role: 'user',
      content: userInput,
    },
  ],
  text: {
    format: {
      type: 'json_schema',
      name: 'response',
      schema: jsonSchema, // From in-code prompt definition
      strict: true,
    },
  },
  previous_response_id: previousResponseId, // For conversation continuity
})
// Extract content using extractAssistantOutputText() helper (same as OpenAI)
```

**Key Points:**
- **Both use Responses API** (`openai.responses.create()` and `xai.responses.create()`)
- **OpenAI**: Uses `prompt.id` for stored prompts
- **Xai**: Passes system prompt as message in `input` array (xAI doesn't support `instructions` with `previous_response_id`)
- Both use `extractAssistantOutputText()` helper for consistent response parsing
- Both support conversation continuity via `previous_response_id`
- Both support JSON schema validation via `text.format` parameter
- Xai client configured with `https://api.x.ai/v1` base URL and extended timeout (360s for reasoning models)

### In-Code Prompt Structure
Each prompt file will define:
1. System prompt text (instructions for the AI)
2. JSON schema for structured output
3. TypeScript type definitions matching the schema
4. Validation logic using Zod

### Files to Create/Modify

**New Files:**
- `lib/config/llm-provider.ts` - Provider abstraction and factory
- `lib/prompts/intent-prompt.ts` - Intent assessment prompt + schema
- `lib/prompts/spread-prompt.ts` - Spread selection prompt + schema
- `lib/prompts/reading-prompt.ts` - Reading generation prompt + schema
- `lib/prompts/explanation-prompt.ts` - Explanation request prompt + schema
- `lib/prompts/clarification-prompt.ts` - Clarification handling prompt + schema
- `lib/types/prompts.ts` - Shared prompt type definitions
- `lib/utils/xai-responses.ts` - Xai-specific Responses API handler (mirrors openai-responses.ts structure)

**Modified Files:**
- `lib/config/openai.ts` - Refactor into provider-agnostic configuration
- `lib/utils/openai-responses.ts` - Update to work with provider abstraction
- All API routes in `app/api/ai/*` - Use provider abstraction instead of direct OpenAI calls
- `.env.local.example` - Add Xai configuration examples

### Breaking Changes
**NONE** - This is a backward-compatible addition. Existing OpenAI usage continues to work without changes when `LLM_PROVIDER=openai` (default).

## Impact

**Affected specs:**
- `specs/ai-integration/spec.md` - Add provider abstraction requirements

**Affected code:**
- `lib/config/openai.ts` - Configuration layer refactoring
- `lib/utils/openai-responses.ts` - Integration with provider abstraction
- All API routes (`app/api/ai/*`) - Consume provider abstraction
- Environment configuration (`.env.local.example`)

**Migration path:**
1. Add new provider abstraction and prompt definitions
2. Update configuration to support both providers
3. Refactor API routes to use abstraction
4. Test with both OpenAI (stored prompts) and Xai (in-code prompts)
5. Update documentation and environment examples

**No immediate code changes required for users:**
- Defaults to OpenAI with existing stored prompts
- Opt-in to Xai by setting `LLM_PROVIDER=xai` and adding Xai API key
