# Refactor OpenAI SDK Integration

## Why
The current implementation uses manual `fetch()` calls to OpenAI's Responses API (`/v1/responses` endpoint) with custom response parsing logic. While functional, this approach bypasses the official OpenAI Node.js SDK (`openai` package v6.9.1, already installed) which provides type-safe methods, built-in error handling, retry logic, and automatic support for new API features. Using the SDK reduces maintenance burden, improves reliability, and ensures compatibility with OpenAI's evolving API surface.

## What Changes
- Replace manual `fetch()` calls in `lib/utils/openai-responses.ts` with OpenAI SDK's native Responses API methods
- Migrate `callOpenAIResponsesAPI()` function to use `openai.responses.create()` method
- Update response parsing to use SDK's typed response objects instead of custom `extractAssistantOutputText()` logic
- Maintain existing functionality: stored prompt IDs, previous response ID chaining, and error handling
- Update type definitions to align with SDK's TypeScript interfaces
- Ensure all five API routes continue to work identically from the client's perspective

## Impact
- **Affected code:**
  - `lib/utils/openai-responses.ts` - Core API interaction logic (complete refactor)
  - `lib/config/openai.ts` - Already has `openai` instance, may need configuration adjustments
  - All API routes (`app/api/ai/*/route.ts`) - No changes needed, only import updates
  - Type definitions in `types/` - May need alignment with SDK types
- **Affected specs:** `ai-integration` (new capability spec)
- **Breaking changes:** None - this is an internal implementation detail with no external API changes
- **Benefits:**
  - Better error messages and automatic retry logic
  - Type safety improvements with SDK's TypeScript definitions
  - Reduced custom code maintenance
  - Automatic support for OpenAI API updates
  - Built-in request/response logging and debugging capabilities
