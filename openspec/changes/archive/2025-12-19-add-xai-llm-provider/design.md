# Design Document: Add Xai LLM Provider Support

## Context

The tarot reading application currently uses OpenAI's GPT models exclusively, with prompts stored in OpenAI's platform and referenced by prompt_id. We need to add support for Xai's Grok 4.1 fast reasoning model while:
1. Maintaining backward compatibility with existing OpenAI stored prompts
2. Supporting Xai's in-code prompt requirement (no stored prompts support)
3. Creating an extensible architecture for future LLM providers
4. Minimizing changes to existing API routes

**Key Constraints:**
- Xai requires all prompts to be defined in code (no stored prompt feature)
- Xai uses the same OpenAI SDK with different base URL (`https://api.x.ai/v1`)
- Xai reasoning models need extended timeout (360000ms vs default ~60000ms)
- Provider selection should be startup-time configuration, not per-request

**Stakeholders:**
- Development team (implementation and maintenance)
- End users (transparent provider switching, no UX changes)

## Goals / Non-Goals

**Goals:**
- Add Xai as a second LLM provider option selectable via environment variable
- Create extensible provider abstraction for future providers (Anthropic, Cohere, etc.)
- Maintain 100% backward compatibility with existing OpenAI usage
- Support both stored prompts (OpenAI) and in-code prompts (Xai) transparently
- Centralize LLM provider logic to minimize changes across API routes

**Non-Goals:**
- Runtime per-request provider switching (startup config only)
- Multi-provider load balancing or fallback logic
- Prompt migration tooling (manual port acceptable)
- Provider-specific optimizations beyond Xai's timeout requirement
- UI for provider selection (server-side config only)

## Decisions

### Decision 1: Provider Abstraction with Factory Pattern

**What:** Create a `LLMProvider` interface with `callAPI()` method, implemented by `OpenAIProvider` and `XaiProvider` classes. Use factory function to instantiate the correct provider at startup.

**Why:**
- Enables adding new providers by implementing the interface
- Centralizes provider-specific logic (timeouts, URL, response parsing)
- API routes only interact with the abstraction, not provider details
- Factory pattern allows startup-time provider selection via environment variable

**Alternatives considered:**
- Strategy pattern with runtime switching: Rejected because per-request provider logic adds complexity and isn't required
- Direct if/else checks in each API route: Rejected because it scatters provider logic across many files
- Single function with provider parameter: Rejected because it doesn't scale well to provider-specific configurations

**Interface Design:**
```typescript
interface LLMProvider {
  callAPI(params: {
    input: string
    promptId?: string          // For OpenAI stored prompts
    promptDefinition?: Prompt  // For in-code prompts
    previousResponseId?: string
  }): Promise<{ content: string; responseId: string }>
}
```

### Decision 2: Feature-Specific Prompt Files

**What:** Organize in-code prompts by feature in `lib/prompts/` directory:
- `lib/prompts/intent-prompt.ts`
- `lib/prompts/spread-prompt.ts`
- `lib/prompts/reading-prompt.ts`
- `lib/prompts/explanation-prompt.ts`
- `lib/prompts/clarification-prompt.ts`

Each file exports a `PromptDefinition` object with system prompt, JSON schema, and Zod validator.

**Why:**
- Encapsulation: Each prompt lives near its feature domain
- Discoverability: Clear file naming makes prompts easy to find
- Type safety: Co-locating prompt text with TypeScript types ensures consistency
- Validation: Zod schemas enable runtime response validation

**Alternatives considered:**
- Single `lib/config/prompts.ts` file: Rejected because single 500+ line file is harder to maintain
- Prompts in API route files: Rejected because it couples routing logic with prompt content
- JSON files for prompts: Rejected because TypeScript files provide better type safety and IDE support

**Prompt Definition Structure:**
```typescript
export const INTENT_PROMPT: PromptDefinition = {
  systemPrompt: `You are an AI assistant for tarot reading intent assessment...`,
  jsonSchema: {
    type: 'object',
    properties: {
      needsClarification: { type: 'boolean' },
      intentSummary: { type: 'string' },
      // ... full schema
    },
    required: ['needsClarification']
  },
  validator: IntentAssessmentSchema  // Zod schema
}
```

### Decision 3: Parallel OpenAI and Xai Support

**What:** Both OpenAI (with stored prompts) and Xai (with in-code prompts) work simultaneously. `OpenAIProvider` uses `promptId` parameter, `XaiProvider` uses `promptDefinition` parameter.

**Why:**
- Zero-downtime migration: Can switch providers by changing env variable only
- A/B testing: Can compare provider quality on same prompts
- Rollback safety: Easy to revert to OpenAI if Xai has issues
- No immediate prompt migration required

**Alternatives considered:**
- Force immediate migration to in-code prompts: Rejected because it requires risky big-bang deployment
- Maintain only one prompt system: Rejected because it loses OpenAI stored prompt benefits
- Convert OpenAI to in-code prompts: Rejected because stored prompts work well for OpenAI

**Implementation Note:**
The provider abstraction resolves prompts transparently:
- `OpenAIProvider.callAPI()` ignores `promptDefinition`, uses `promptId`
- `XaiProvider.callAPI()` ignores `promptId`, uses `promptDefinition`
- API routes provide both parameters; provider picks what it needs

### Decision 4: Keep OpenAI Responses API Pattern

**What:** Continue using the `responses.create()` API pattern from OpenAI SDK for both providers, maintaining `previousResponseId` for conversation context.

**Why:**
- Consistency: Existing code uses Responses API; keeping same pattern minimizes changes
- Context tracking: `previousResponseId` already implemented for multi-turn conversations
- API parity: Xai supports the same API structure (same SDK, different base URL)

**Alternatives considered:**
- Switch to `chat.completions.create()`: Rejected because it requires refactoring all API routes
- Provider-specific APIs: Rejected because it adds conditional logic in API routes
- Abstract conversation context differently: Rejected because current pattern works well

**Impact:**
- Reuse existing `callOpenAIResponsesAPI()` function structure
- Create parallel `callXaiResponsesAPI()` function with same signature
- Provider classes wrap these functions

### Decision 5: Startup-Time Provider Selection

**What:** LLM provider is selected once at server startup via `LLM_PROVIDER` environment variable. Changing provider requires server restart.

**Why:**
- Simplicity: No per-request provider logic or routing
- Performance: Provider instance created once, not per-request
- Configuration clarity: Single source of truth in environment config
- Reduced complexity: No need for provider switching middleware or context

**Alternatives considered:**
- Per-request provider parameter: Rejected because it adds API surface area and isn't needed
- Provider routing based on endpoint: Rejected because it couples URLs to providers
- Auto-fallback to secondary provider: Rejected because it hides errors and complicates debugging

**Configuration:**
```env
# .env.local
LLM_PROVIDER=xai  # or 'openai' (default)
XAI_API_KEY=xai-api-key-here
OPENAI_API_KEY=openai-api-key-here  # Only needed if LLM_PROVIDER=openai
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Routes Layer                          │
│  /api/ai/assess-intent, /api/ai/generate-spread, etc.           │
│  (No provider-specific logic - just call provider.callAPI())    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Provider Abstraction Layer                     │
│                    lib/config/llm-provider.ts                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  LLMProvider Interface                                      │ │
│  │  - callAPI(input, promptId?, promptDefinition?, ...)       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             ▲                                    │
│              ┌──────────────┴──────────────┐                    │
│              │                              │                    │
│  ┌───────────────────────┐    ┌───────────────────────┐        │
│  │   OpenAIProvider      │    │    XaiProvider        │        │
│  │  - Uses promptId      │    │  - Uses promptDef     │        │
│  │  - Stored prompts     │    │  - In-code prompts    │        │
│  │  - Default timeout    │    │  - 360s timeout       │        │
│  └───────────────────────┘    └───────────────────────┘        │
└──────────────┬──────────────────────────┬──────────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────┐  ┌─────────────────────────┐
│ lib/utils/               │  │ lib/utils/              │
│ openai-responses.ts      │  │ xai-responses.ts        │
│ (Existing OpenAI logic)  │  │ (New Xai integration)   │
└──────────────────────────┘  └─────────────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│                      OpenAI SDK                               │
│  (Same SDK, different base URLs and configurations)          │
└──────────────────────────────────────────────────────────────┘
               │                          │
               ▼                          ▼
    api.openai.com/v1            api.x.ai/v1
```

**Prompt Resolution Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│  API Route: assess-intent                                        │
│  provider.callAPI({                                              │
│    input: userMessage,                                           │
│    promptId: PROMPTS.INTENT,        // For OpenAI               │
│    promptDefinition: INTENT_PROMPT, // For Xai                  │
│    previousResponseId                                            │
│  })                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
┌──────────────────────┐              ┌──────────────────────┐
│  OpenAIProvider      │              │  XaiProvider         │
│  Ignores promptDef   │              │  Ignores promptId    │
│  Uses promptId only  │              │  Uses promptDef only │
└──────────────────────┘              └──────────────────────┘
```

## Risks / Trade-offs

### Risk 1: Prompt Parity Between Providers
**Risk:** In-code prompts for Xai may diverge from OpenAI stored prompts, causing inconsistent AI behavior.

**Mitigation:**
- Initial implementation: Port OpenAI stored prompts to in-code definitions exactly
- Documentation: Clear comments linking in-code prompts to OpenAI stored prompt IDs
- Testing: Side-by-side testing with both providers on same inputs
- Versioning: Add version tags to prompt definitions for tracking changes

### Risk 2: Xai API Compatibility
**Risk:** Xai's API may have subtle differences from OpenAI despite using the same SDK.

**Mitigation:**
- Extensive error handling in `callXaiResponsesAPI()`
- Comprehensive testing during implementation
- Fallback error messages guiding users to check Xai documentation
- Monitor Xai API changelog for breaking changes

### Risk 3: Provider-Specific Timeout Tuning
**Risk:** Hardcoded 360s timeout for Xai may be too aggressive or too conservative.

**Mitigation:**
- Make timeout configurable via environment variable (`XAI_TIMEOUT_MS`)
- Document recommended timeout ranges
- Log request duration metrics for monitoring
- Add timeout to provider configuration interface for future flexibility

### Risk 4: JSON Schema Mismatch
**Risk:** In-code JSON schemas may not match actual OpenAI stored prompt schemas, causing validation failures.

**Mitigation:**
- Extract JSON schemas from OpenAI stored prompts during porting
- Use Zod for strict runtime validation
- Add schema version to prompt definitions
- Test with real API responses during development

## Migration Plan

### Phase 1: Foundation (No User Impact)
1. Create `lib/types/prompts.ts` with type definitions
2. Create `lib/config/llm-provider.ts` with interface and factory
3. Implement `OpenAIProvider` wrapping existing logic
4. Add unit tests for provider abstraction
5. **Validation:** TypeScript compilation, no runtime behavior changes

### Phase 2: Prompt Definitions (No User Impact)
1. Create all 5 prompt definition files in `lib/prompts/`
2. Port system prompts from OpenAI stored prompts
3. Define JSON schemas matching OpenAI response structures
4. Create Zod validators for each prompt
5. **Validation:** Manual inspection, schema correctness checks

### Phase 3: Xai Integration (Feature Flag Protected)
1. Add `XAI_API_KEY` and `LLM_PROVIDER` environment variables
2. Create `lib/utils/xai-responses.ts`
3. Implement `XaiProvider` class
4. Add conditional provider instantiation in factory
5. **Validation:** Test Xai provider in isolation with `LLM_PROVIDER=xai`

### Phase 4: API Route Migration (Backward Compatible)
1. Update all 5 API routes to use provider abstraction
2. Pass both `promptId` and `promptDefinition` to `callAPI()`
3. Test with `LLM_PROVIDER=openai` (default, existing behavior)
4. **Validation:** Full regression testing with OpenAI

### Phase 5: Xai Production Testing (Opt-In)
1. Document Xai setup in `.env.local.example`
2. Test end-to-end reading flow with `LLM_PROVIDER=xai`
3. Compare outputs between OpenAI and Xai
4. Tune Xai-specific configurations (timeout, model parameters)
5. **Validation:** A/B testing, quality assessment

### Phase 6: Documentation & Rollout
1. Update README with provider selection instructions
2. Add inline documentation for provider abstraction
3. Create troubleshooting guide for common issues
4. Announce Xai support to users
5. **Validation:** User feedback, monitoring for errors

### Rollback Plan
If Xai integration causes issues:
1. Set `LLM_PROVIDER=openai` in environment (immediate mitigation)
2. Restart server (no code deployment needed)
3. Investigate and fix Xai-specific issues offline
4. Re-enable Xai after fixes validated

**Zero-downtime guarantee:** OpenAI remains default, Xai is opt-in.

## Open Questions

1. **Prompt Quality:** How do we measure and compare prompt quality between providers?
   - **Proposed Answer:** Manual evaluation on sample inputs, user feedback metrics

2. **Cost Optimization:** Should we add cost tracking per provider to inform provider selection?
   - **Proposed Answer:** Out of scope for MVP; can add in future iteration

3. **Rate Limiting:** Do we need provider-specific rate limiting logic?
   - **Proposed Answer:** Defer to provider APIs' native rate limiting; add if needed

4. **Error Handling:** Should we automatically retry with the alternate provider on failure?
   - **Proposed Answer:** No for MVP (complexity); single provider per request

5. **Monitoring:** What metrics should we track for provider health?
   - **Proposed Answer:** Response times, error rates, token usage (add in future)

## Success Criteria

**MVP Success:**
- [ ] Can switch between OpenAI and Xai by changing one environment variable
- [ ] All 5 AI features work with both providers (intent, spread, reading, explanation, clarification)
- [ ] Zero regression in OpenAI functionality (backward compatibility)
- [ ] Xai responses match OpenAI quality (subjective evaluation)
- [ ] No type errors or runtime crashes
- [ ] Documentation complete for setup and usage

**Long-Term Success:**
- [ ] Easy to add third provider (Anthropic, Cohere) by implementing interface
- [ ] Prompt definitions maintainable and versioned
- [ ] Provider abstraction performance has negligible overhead (<10ms)
- [ ] Users successfully use Xai in production without issues
