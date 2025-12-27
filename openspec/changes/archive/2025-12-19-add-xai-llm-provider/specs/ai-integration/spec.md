# AI Integration Spec - Delta for add-xai-llm-provider

## ADDED Requirements

### Requirement: LLM Provider Abstraction
The system SHALL provide an abstraction layer that supports multiple LLM providers (OpenAI, Xai) with a unified interface for making API calls.

#### Scenario: OpenAI provider instantiation
- **GIVEN** environment variable `LLM_PROVIDER=openai`
- **AND** valid OpenAI API key is configured
- **WHEN** the server starts
- **THEN** the `OpenAIProvider` instance SHALL be created and used for all AI API calls

#### Scenario: Xai provider instantiation
- **GIVEN** environment variable `LLM_PROVIDER=xai`
- **AND** valid Xai API key is configured
- **WHEN** the server starts
- **THEN** the `XaiProvider` instance SHALL be created and used for all AI API calls
- **AND** the Xai client SHALL be configured with base URL `https://api.x.ai/v1`
- **AND** the Xai client SHALL use timeout of 360000ms for reasoning models

#### Scenario: Default provider selection
- **GIVEN** no `LLM_PROVIDER` environment variable is set
- **WHEN** the server starts
- **THEN** the system SHALL default to `OpenAIProvider`

#### Scenario: Invalid provider name
- **GIVEN** environment variable `LLM_PROVIDER=invalid-provider`
- **WHEN** the server starts
- **THEN** the system SHALL throw a validation error
- **AND** the error message SHALL list valid provider options

### Requirement: In-Code Prompt Definitions
The system SHALL support defining prompts in code with associated JSON schemas and validators, enabling LLM providers that don't support stored prompts.

#### Scenario: Prompt definition structure
- **GIVEN** a prompt definition file (e.g., `lib/prompts/intent-prompt.ts`)
- **WHEN** the prompt definition is imported
- **THEN** it SHALL export a `PromptDefinition` object containing:
  - `systemPrompt`: string with AI instructions
  - `jsonSchema`: JSON Schema for structured output
  - `validator`: Zod schema for runtime validation

#### Scenario: Intent assessment prompt
- **GIVEN** the `INTENT_PROMPT` definition from `lib/prompts/intent-prompt.ts`
- **WHEN** used with Xai provider
- **THEN** the prompt SHALL produce `IntentAssessment` responses matching the schema
- **AND** responses SHALL validate against the Zod schema

#### Scenario: Spread selection prompt
- **GIVEN** the `SPREAD_PROMPT` definition from `lib/prompts/spread-prompt.ts`
- **WHEN** used with Xai provider
- **THEN** the prompt SHALL produce `SpreadSelectionResult` responses matching the schema

#### Scenario: Reading generation prompt
- **GIVEN** the `READING_PROMPT` definition from `lib/prompts/reading-prompt.ts`
- **WHEN** used with Xai provider
- **THEN** the prompt SHALL produce `ReadingResponse` responses matching the schema

#### Scenario: Explanation request prompt
- **GIVEN** the `EXPLANATION_PROMPT` definition from `lib/prompts/explanation-prompt.ts`
- **WHEN** used with Xai provider
- **THEN** the prompt SHALL produce `ChatResponse` responses matching the schema

#### Scenario: Clarification handling prompt
- **GIVEN** the `CLARIFICATION_PROMPT` definition from `lib/prompts/clarification-prompt.ts`
- **WHEN** used with Xai provider
- **THEN** the prompt SHALL produce `ClarificationResult` responses matching the schema

### Requirement: Provider Interface Contract
The system SHALL define a `LLMProvider` interface that all provider implementations must conform to.

#### Scenario: Provider interface shape
- **GIVEN** a provider implementation (OpenAI or Xai)
- **WHEN** the provider is used
- **THEN** it SHALL implement a `callAPI()` method accepting:
  - `input`: string (user input text)
  - `promptId?`: string (for stored prompts like OpenAI)
  - `promptDefinition?`: PromptDefinition (for in-code prompts like Xai)
  - `previousResponseId?`: string (for conversation context)
- **AND** the method SHALL return a Promise resolving to:
  - `content`: string (AI response content)
  - `responseId`: string (for tracking conversation context)

#### Scenario: OpenAI provider uses stored prompts
- **GIVEN** `OpenAIProvider.callAPI()` is called with `promptId` and `promptDefinition`
- **WHEN** the API call is made
- **THEN** the provider SHALL use the `promptId` parameter
- **AND** the provider SHALL ignore the `promptDefinition` parameter
- **AND** the provider SHALL reference OpenAI's stored prompt

#### Scenario: Xai provider uses in-code prompts
- **GIVEN** `XaiProvider.callAPI()` is called with `promptId` and `promptDefinition`
- **WHEN** the API call is made
- **THEN** the provider SHALL use the `promptDefinition` parameter
- **AND** the provider SHALL ignore the `promptId` parameter
- **AND** the provider SHALL inject the system prompt into the API request

### Requirement: Xai API Integration
The system SHALL integrate with Xai's API using the OpenAI SDK with Xai-specific configuration.

#### Scenario: Xai client configuration
- **GIVEN** Xai provider is selected
- **WHEN** the Xai client is instantiated
- **THEN** the client SHALL be configured with:
  - `apiKey`: from `XAI_API_KEY` environment variable
  - `baseURL`: `https://api.x.ai/v1`
  - `timeout`: 360000ms (6 minutes for reasoning models)

#### Scenario: Xai API call with in-code prompt
- **GIVEN** a call to `XaiProvider.callAPI()` with `INTENT_PROMPT` definition
- **WHEN** the API request is made
- **THEN** the system SHALL inject the prompt's `systemPrompt` into the request
- **AND** the system SHALL include the JSON schema in the request
- **AND** the system SHALL parse the JSON response
- **AND** the system SHALL validate the response against the Zod schema

#### Scenario: Xai conversation context tracking
- **GIVEN** a previous Xai API response with `responseId`
- **WHEN** a follow-up call is made with `previousResponseId`
- **THEN** the system SHALL include the previous response ID in the new request
- **AND** Xai SHALL have access to the conversation history

#### Scenario: Xai timeout handling
- **GIVEN** a Xai API call for a reasoning task
- **WHEN** the response time exceeds 360000ms
- **THEN** the system SHALL timeout the request
- **AND** return an error indicating timeout

### Requirement: Provider-Agnostic API Routes
The system SHALL update all AI API routes to use the provider abstraction without provider-specific logic.

#### Scenario: Intent assessment route uses provider abstraction
- **GIVEN** a POST request to `/api/ai/assess-intent`
- **WHEN** the route handler processes the request
- **THEN** it SHALL call `provider.callAPI()` with both `promptId` and `promptDefinition`
- **AND** the active provider SHALL select the appropriate prompt parameter

#### Scenario: Spread generation route uses provider abstraction
- **GIVEN** a POST request to `/api/ai/generate-spread`
- **WHEN** the route handler processes the request
- **THEN** it SHALL call `provider.callAPI()` with both prompt parameters
- **AND** the response SHALL be identical regardless of provider

#### Scenario: Reading generation route uses provider abstraction
- **GIVEN** a POST request to `/api/ai/generate-reading`
- **WHEN** the route handler processes the request
- **THEN** it SHALL call `provider.callAPI()` with both prompt parameters

#### Scenario: Explanation request route uses provider abstraction
- **GIVEN** a POST request to `/api/ai/request-explanation`
- **WHEN** the route handler processes the request
- **THEN** it SHALL call `provider.callAPI()` with both prompt parameters

#### Scenario: Clarification handling route uses provider abstraction
- **GIVEN** a POST request to `/api/ai/handle-clarification`
- **WHEN** the route handler processes the request
- **THEN** it SHALL call `provider.callAPI()` with both prompt parameters

### Requirement: Environment Configuration Validation
The system SHALL validate LLM provider configuration at startup and provide clear error messages for missing or invalid configuration.

#### Scenario: Missing Xai API key
- **GIVEN** environment variable `LLM_PROVIDER=xai`
- **AND** `XAI_API_KEY` is not set
- **WHEN** the server starts
- **THEN** the system SHALL throw a validation error
- **AND** the error message SHALL indicate "Missing required environment variable: XAI_API_KEY"

#### Scenario: Missing OpenAI API key
- **GIVEN** environment variable `LLM_PROVIDER=openai` (or not set, defaulting to OpenAI)
- **AND** `OPENAI_API_KEY` is not set
- **WHEN** the server starts
- **THEN** the system SHALL throw a validation error
- **AND** the error message SHALL indicate "Missing required environment variable: OPENAI_API_KEY"

#### Scenario: Missing OpenAI prompt IDs
- **GIVEN** environment variable `LLM_PROVIDER=openai`
- **AND** any of the required prompt ID environment variables are missing
- **WHEN** the server starts
- **THEN** the system SHALL throw a validation error
- **AND** the error message SHALL list the missing prompt IDs

#### Scenario: Xai doesn't require prompt IDs
- **GIVEN** environment variable `LLM_PROVIDER=xai`
- **AND** `XAI_API_KEY` is set
- **AND** OpenAI prompt ID environment variables are not set
- **WHEN** the server starts
- **THEN** the system SHALL start successfully
- **AND** SHALL NOT throw validation errors for missing prompt IDs

### Requirement: Backward Compatibility with OpenAI
The system SHALL maintain 100% backward compatibility with existing OpenAI integration when `LLM_PROVIDER=openai` or is not set.

#### Scenario: OpenAI as default provider
- **GIVEN** no `LLM_PROVIDER` environment variable is set
- **AND** all required OpenAI configuration is present
- **WHEN** any AI API endpoint is called
- **THEN** the behavior SHALL be identical to pre-Xai implementation
- **AND** OpenAI stored prompts SHALL be used

#### Scenario: OpenAI stored prompts continue to work
- **GIVEN** `LLM_PROVIDER=openai`
- **WHEN** any AI feature is used
- **THEN** the system SHALL reference stored prompts by `PROMPTS.INTENT`, `PROMPTS.SPREAD`, etc.
- **AND** responses SHALL be identical to previous implementation

#### Scenario: No changes to API response format
- **GIVEN** either OpenAI or Xai provider
- **WHEN** an AI API endpoint returns a response
- **THEN** the response JSON structure SHALL be identical
- **AND** client code SHALL not need to know which provider was used

### Requirement: Type Safety for Provider System
The system SHALL provide comprehensive TypeScript types for the provider abstraction, prompt definitions, and responses.

#### Scenario: Provider interface type checking
- **GIVEN** a provider implementation (OpenAI or Xai)
- **WHEN** the TypeScript compiler checks the code
- **THEN** the provider SHALL satisfy the `LLMProvider` interface contract
- **AND** method signatures SHALL match the interface exactly

#### Scenario: Prompt definition type checking
- **GIVEN** a prompt definition file
- **WHEN** the TypeScript compiler checks the code
- **THEN** the definition SHALL satisfy the `PromptDefinition` type
- **AND** the `jsonSchema` SHALL be type-safe
- **AND** the `validator` SHALL match the expected response type

#### Scenario: API route type safety
- **GIVEN** an API route calling `provider.callAPI()`
- **WHEN** the TypeScript compiler checks the code
- **THEN** all parameters SHALL be correctly typed
- **AND** the return type SHALL match the expected response shape
- **AND** no type assertions or `any` types SHALL be used

## MODIFIED Requirements

(None - this change only adds new capabilities without modifying existing requirements)

## REMOVED Requirements

(None - this change is purely additive and maintains full backward compatibility)
