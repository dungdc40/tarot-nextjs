# Implementation Tasks

## 1. Update Core OpenAI Integration
- [x] 1.1 Update `lib/utils/openai-responses.ts` to use `openai.responses.create()` instead of manual `fetch()`
- [x] 1.2 Replace `extractAssistantOutputText()` with SDK's typed response structure access
- [x] 1.3 Update error handling to catch and map `OpenAI.APIError` instances
- [x] 1.4 Preserve `previous_response_id` parameter support in SDK call
- [x] 1.5 Maintain existing return format: `{ content: string, responseId: string }`
- [x] 1.6 Update console logging to work with SDK response objects

## 2. Verify Configuration
- [x] 2.1 Confirm `lib/config/openai.ts` OpenAI client instance is properly configured
- [x] 2.2 Verify environment variable validation still works correctly
- [x] 2.3 Test custom base URL configuration (if applicable)

## 3. Update Type Definitions (if needed)
- [x] 3.1 Review `types/` directory for any OpenAI-related type definitions
- [x] 3.2 Update types to align with OpenAI SDK's TypeScript interfaces
- [x] 3.3 Remove custom types that are now provided by the SDK

## 4. Test All API Endpoints
- [ ] 4.1 Test `POST /api/ai/assess-intent` - verify intent assessment works
- [ ] 4.2 Test `POST /api/ai/generate-spread` - verify spread generation works
- [ ] 4.3 Test `POST /api/ai/generate-reading` - verify reading generation works
- [ ] 4.4 Test `POST /api/ai/request-explanation` - verify explanations work
- [ ] 4.5 Test `POST /api/ai/handle-clarification` - verify clarifications work

## 5. Test Error Scenarios
- [ ] 5.1 Test behavior with invalid API key (401 error)
- [ ] 5.2 Test behavior with rate limiting (429 error)
- [ ] 5.3 Test behavior with empty or malformed responses
- [ ] 5.4 Test behavior when model refuses to respond (safety refusal)
- [ ] 5.5 Verify SDK retry logic works on transient failures (5xx errors)

## 6. Test Multi-Turn Conversations
- [ ] 6.1 Test intent assessment with `previousResponseId` chaining
- [ ] 6.2 Verify response IDs are correctly extracted and returned
- [ ] 6.3 Test clarification flow maintains conversation context

## 7. Validation and Code Quality
- [x] 7.1 Run TypeScript type checking: `npm run build`
- [x] 7.2 Run ESLint: `npm run lint`
- [ ] 7.3 Test complete reading flow end-to-end manually
- [ ] 7.4 Review console logs for proper debug information
- [x] 7.5 Remove any unused custom parsing functions or utilities

## 8. Documentation Updates
- [x] 8.1 Update code comments in `lib/utils/openai-responses.ts` to reflect SDK usage
- [ ] 8.2 Update `README.md` if it documents OpenAI integration
- [x] 8.3 Update inline JSDoc comments in affected files
