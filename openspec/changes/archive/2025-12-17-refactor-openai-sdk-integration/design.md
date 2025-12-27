# Design: Refactor OpenAI SDK Integration

## Context
The application currently makes direct HTTP requests to OpenAI's Responses API using `fetch()` with manual request/response handling. The OpenAI Node.js SDK (v6.9.1) is already installed as a dependency but only used for client instantiation. This refactor aims to fully leverage the SDK's capabilities for the Responses API while maintaining backward compatibility with the existing behavior.

**Current Implementation:**
- Manual `fetch()` to `${OPENAI_BASE_URL}/responses` endpoint
- Custom `extractAssistantOutputText()` function to parse response structure
- Direct Bearer token authentication in request headers
- No retry logic or connection pooling
- Custom error handling for API failures

**Constraints:**
- Must continue using OpenAI's Responses API (not Chat Completions API) with stored prompt IDs
- Must maintain support for `previous_response_id` parameter for conversation continuity
- All five existing API routes must continue to function identically
- No changes to client-side code or API contracts

## Goals / Non-Goals

**Goals:**
- Replace manual `fetch()` calls with SDK's `openai.responses.create()` method
- Leverage SDK's built-in error handling, retry logic, and type safety
- Simplify response parsing by using SDK's typed response objects
- Maintain identical behavior for all API endpoints
- Improve maintainability and reduce custom code

**Non-Goals:**
- Switching from Responses API to Chat Completions API (out of scope)
- Adding streaming support (not currently used)
- Changing API route signatures or response formats
- Migrating away from stored prompts to inline prompts
- Performance optimization beyond SDK defaults

## Decisions

### Decision 1: Use SDK's Responses API Methods
**Choice:** Migrate to `openai.responses.create()` method

**Rationale:**
- The OpenAI SDK v6.x+ includes native support for the Responses API
- Provides type-safe interfaces matching OpenAI's API specification
- Built-in request/response transformation eliminates custom parsing
- Automatic retry with exponential backoff for transient failures
- Better error messages with structured error types

**Alternatives considered:**
- Keep using `fetch()` with SDK only for types: Rejected because it doesn't leverage SDK benefits like retry logic and error handling
- Use SDK's `openai.chat.completions.create()`: Rejected because we specifically need Responses API with stored prompts

### Decision 2: Response Parsing Strategy
**Choice:** Replace `extractAssistantOutputText()` with SDK's native response structure

**Current flow:**
```typescript
response.output[].content[].text (manual traversal)
```

**New flow:**
```typescript
response.output[0].content[0].text (SDK typed access)
```

**Rationale:**
- SDK already parses and validates the response structure
- TypeScript types prevent runtime errors from malformed responses
- Reduces custom code that needs maintenance

**Migration notes:**
- Verify SDK's response object structure matches our expectations
- Preserve existing error handling behavior (refusal detection, empty content checks)
- Maintain `responseId` extraction from `response.id`

### Decision 3: Configuration and Client Instantiation
**Choice:** Continue using the existing `openai` client instance from `lib/config/openai.ts`

**Current setup:**
```typescript
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
})
```

**Changes needed:** None - the existing client is already properly configured

**Rationale:**
- Single client instance avoids connection pool exhaustion
- Configuration already handles custom base URLs (important for testing/proxies)
- Environment variable validation already in place

### Decision 4: Error Handling Approach
**Choice:** Wrap SDK calls in try-catch and map SDK errors to existing error format

**Rationale:**
- API routes already have structured error handling
- SDK throws `APIError` for API failures with rich context
- Need to preserve existing HTTP status codes for client compatibility

**Error mapping:**
```typescript
try {
  const response = await openai.responses.create(...)
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    // Map SDK error to existing error response format
    // Preserve status codes: 400, 401, 429, 500, etc.
  }
  throw error
}
```

### Decision 5: Backward Compatibility for Response Format
**Choice:** Maintain existing response shape: `{ content: string, responseId: string }`

**Rationale:**
- All API routes expect this format from `callOpenAIResponsesAPI()`
- No changes needed to API route handlers
- Keeps migration scope focused on implementation details

## Risks / Trade-offs

### Risk: SDK Response Structure Mismatch
**Description:** OpenAI SDK's response object structure may differ from manual parsing expectations

**Likelihood:** Low - SDK is officially maintained by OpenAI
**Impact:** Medium - could cause runtime errors if structure differs

**Mitigation:**
- Add comprehensive logging during development
- Write tests to validate response parsing
- Review SDK documentation and type definitions before implementation
- Keep fallback to manual parsing if SDK structure is incompatible

### Risk: Breaking Changes in SDK Updates
**Description:** Future SDK updates might introduce breaking changes to Responses API methods

**Likelihood:** Low - OpenAI follows semantic versioning
**Impact:** High - could break all AI features

**Mitigation:**
- Pin SDK version in `package.json` (already at `^6.9.1`)
- Review SDK changelog before upgrading
- Test all API endpoints after SDK updates

### Trade-off: Slightly Larger Bundle Size
**Description:** Using more SDK features increases bundle size marginally

**Impact:** Negligible - server-side only, Next.js doesn't include in client bundle

**Acceptance:** Bundle size increase is acceptable for improved maintainability

### Trade-off: Less Control Over Request/Response
**Description:** SDK abstracts away direct HTTP control

**Impact:** Minor - lose fine-grained request customization (headers, interceptors)

**Acceptance:** SDK's defaults are sufficient for current needs; custom requirements haven't emerged

## Migration Plan

### Phase 1: Implementation (Development)
1. Update `lib/utils/openai-responses.ts`:
   - Replace `fetch()` call with `openai.responses.create()`
   - Update response parsing to use SDK types
   - Map SDK errors to existing error format
   - Preserve `previous_response_id` parameter support

2. Test all five API endpoints:
   - `assess-intent` - verify intent assessment works
   - `generate-spread` - verify spread generation works
   - `generate-reading` - verify reading generation works
   - `request-explanation` - verify explanations work
   - `handle-clarification` - verify clarifications work

3. Update type definitions if needed (likely minimal changes)

### Phase 2: Validation (Pre-Production)
1. Run manual tests for complete reading flow
2. Verify error handling for API failures (invalid keys, rate limits)
3. Check console logging shows SDK errors properly
4. Confirm `previous_response_id` chaining works for multi-turn conversations

### Phase 3: Deployment (Production)
1. Deploy to production with monitoring
2. Watch for any API errors or unexpected behavior
3. No rollback needed - change is internal and doesn't affect data

### Rollback Strategy
If critical issues arise:
1. Revert `lib/utils/openai-responses.ts` to previous manual `fetch()` implementation
2. No database migrations or data changes needed
3. Rollback is safe and instant (single file change)

## Open Questions
None - implementation path is clear and well-defined.
