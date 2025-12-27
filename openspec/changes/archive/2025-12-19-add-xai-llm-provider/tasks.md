# Implementation Tasks

## 1. Foundation - Provider Abstraction

- [x] 1.1 Create `lib/types/prompts.ts` with shared type definitions
  - [x] 1.1.1 Define `PromptDefinition` interface for in-code prompts
  - [x] 1.1.2 Define `LLMProviderConfig` type
  - [x] 1.1.3 Define `LLMResponse` normalized response type
- [x] 1.2 Create `lib/config/llm-provider.ts` with provider abstraction
  - [x] 1.2.1 Implement `LLMProvider` interface with `callAPI()` method
  - [x] 1.2.2 Implement `OpenAIProvider` class wrapping existing OpenAI logic
  - [x] 1.2.3 Implement `XaiProvider` class for Xai integration
  - [x] 1.2.4 Implement `createLLMProvider()` factory based on env variable
  - [x] 1.2.5 Export singleton provider instance
- [x] 1.3 Add environment variable validation
  - [x] 1.3.1 Add `LLM_PROVIDER` enum validation (`openai` | `xai`)
  - [x] 1.3.2 Validate provider-specific API keys (conditional based on provider)
  - [x] 1.3.3 Update error messages to indicate missing provider config

## 2. Prompt Definitions - In-Code Prompts for Xai

- [x] 2.1 Create `lib/prompts/intent-prompt.ts`
  - [x] 2.1.1 Define system prompt for intent assessment
  - [x] 2.1.2 Define JSON schema for `IntentAssessment` response
  - [x] 2.1.3 Create Zod validator for response validation
  - [x] 2.1.4 Export `INTENT_PROMPT` definition
- [x] 2.2 Create `lib/prompts/spread-prompt.ts`
  - [x] 2.2.1 Define system prompt for spread selection
  - [x] 2.2.2 Define JSON schema for `SpreadSelectionResult` response
  - [x] 2.2.3 Create Zod validator for response validation
  - [x] 2.2.4 Export `SPREAD_PROMPT` definition
- [x] 2.3 Create `lib/prompts/reading-prompt.ts`
  - [x] 2.3.1 Define system prompt for reading generation
  - [x] 2.3.2 Define JSON schema for `ReadingResponse` response
  - [x] 2.3.3 Create Zod validator for response validation
  - [x] 2.3.4 Export `READING_PROMPT` definition
- [x] 2.4 Create `lib/prompts/explanation-prompt.ts`
  - [x] 2.4.1 Define system prompt for explanation requests
  - [x] 2.4.2 Define JSON schema for `ChatResponse` response
  - [x] 2.4.3 Create Zod validator for response validation
  - [x] 2.4.4 Export `EXPLANATION_PROMPT` definition
- [x] 2.5 Create `lib/prompts/clarification-prompt.ts`
  - [x] 2.5.1 Define system prompt for clarification handling
  - [x] 2.5.2 Define JSON schema for `ClarificationResult` response
  - [x] 2.5.3 Create Zod validator for response validation
  - [x] 2.5.4 Export `CLARIFICATION_PROMPT` definition

## 3. Xai Integration

- [x] 3.1 Create `lib/utils/xai-responses.ts`
  - [x] 3.1.1 Implement `callXaiResponsesAPI()` function
  - [x] 3.1.2 Handle in-code prompt injection into API request
  - [x] 3.1.3 Configure extended timeout (360000ms) for reasoning models
  - [x] 3.1.4 Parse and validate JSON responses
  - [x] 3.1.5 Handle Xai-specific error cases
- [x] 3.2 Update `lib/config/openai.ts`
  - [x] 3.2.1 Rename to `lib/config/llm-config.ts` (or keep name, refactor content)
  - [x] 3.2.2 Add Xai API configuration (base URL: `https://api.x.ai/v1`)
  - [x] 3.2.3 Add conditional export based on `LLM_PROVIDER`
  - [x] 3.2.4 Maintain backward compatibility for OpenAI exports

## 4. API Route Updates

- [x] 4.1 Update `app/api/ai/assess-intent/route.ts`
  - [x] 4.1.1 Replace direct `callOpenAIResponsesAPI` with provider abstraction
  - [x] 4.1.2 Remove hard-coded `PROMPTS.INTENT` reference
  - [x] 4.1.3 Test with both OpenAI and Xai
- [x] 4.2 Update `app/api/ai/generate-spread/route.ts`
  - [x] 4.2.1 Replace direct OpenAI call with provider abstraction
  - [x] 4.2.2 Remove hard-coded `PROMPTS.SPREAD` reference
  - [x] 4.2.3 Test with both OpenAI and Xai
- [x] 4.3 Update `app/api/ai/generate-reading/route.ts`
  - [x] 4.3.1 Replace direct OpenAI call with provider abstraction
  - [x] 4.3.2 Remove hard-coded `PROMPTS.READING` reference
  - [x] 4.3.3 Test with both OpenAI and Xai
- [x] 4.4 Update `app/api/ai/request-explanation/route.ts`
  - [x] 4.4.1 Replace direct OpenAI call with provider abstraction
  - [x] 4.4.2 Remove hard-coded `PROMPTS.EXPLANATION` reference
  - [x] 4.4.3 Test with both OpenAI and Xai
- [x] 4.5 Update `app/api/ai/handle-clarification/route.ts`
  - [x] 4.5.1 Replace direct OpenAI call with provider abstraction
  - [x] 4.5.2 Remove hard-coded `PROMPTS.CLARIFICATION` reference
  - [x] 4.5.3 Test with both OpenAI and Xai

## 5. Configuration & Documentation

- [x] 5.1 Update `.env.local.example`
  - [x] 5.1.1 Add `LLM_PROVIDER` variable with default `openai`
  - [x] 5.1.2 Add `XAI_API_KEY` variable with example
  - [x] 5.1.3 Add comments explaining provider selection
  - [x] 5.1.4 Mark OpenAI prompt IDs as "only required if LLM_PROVIDER=openai"
- [x] 5.2 Update environment variable validation
  - [x] 5.2.1 Make OpenAI prompt IDs conditionally required
  - [x] 5.2.2 Add Xai API key validation when provider is Xai
  - [x] 5.2.3 Provide clear error messages for missing config
- [x] 5.3 Add inline code documentation
  - [x] 5.3.1 Document provider abstraction pattern in `lib/config/llm-provider.ts`
  - [x] 5.3.2 Document prompt definition structure in `lib/types/prompts.ts`
  - [x] 5.3.3 Add usage examples in comments

## 6. Testing & Validation

- [x] 6.1 Manual testing with OpenAI provider
  - [x] 6.1.1 Test intent assessment with stored prompts
  - [x] 6.1.2 Test spread generation with stored prompts
  - [x] 6.1.3 Test reading generation with stored prompts
  - [x] 6.1.4 Test explanation requests with stored prompts
  - [x] 6.1.5 Test clarification handling with stored prompts
- [x] 6.2 Manual testing with Xai provider
  - [x] 6.2.1 Test intent assessment with in-code prompts
  - [x] 6.2.2 Test spread generation with in-code prompts
  - [x] 6.2.3 Test reading generation with in-code prompts
  - [x] 6.2.4 Test explanation requests with in-code prompts
  - [x] 6.2.5 Test clarification handling with in-code prompts
- [x] 6.3 Error handling validation
  - [x] 6.3.1 Test missing API key scenarios
  - [x] 6.3.2 Test invalid provider name
  - [x] 6.3.3 Test API timeout handling for Xai
  - [x] 6.3.4 Test malformed JSON response handling
- [x] 6.4 Type safety verification
  - [x] 6.4.1 Run TypeScript compiler with strict mode
  - [x] 6.4.2 Verify all prompt definitions have correct types
  - [x] 6.4.3 Verify provider abstraction has correct interface contracts
