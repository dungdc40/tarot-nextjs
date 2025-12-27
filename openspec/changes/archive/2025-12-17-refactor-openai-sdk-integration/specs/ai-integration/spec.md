# AI Integration Capability

## ADDED Requirements

### Requirement: OpenAI SDK Client Usage
The system SHALL use the official OpenAI Node.js SDK for all OpenAI API interactions instead of manual HTTP requests.

#### Scenario: Initialize OpenAI client with configuration
- **WHEN** the application starts
- **THEN** an OpenAI client instance is created with API key and base URL from environment variables

#### Scenario: Client configuration supports custom base URL
- **WHEN** `OPENAI_BASE_URL` environment variable is set
- **THEN** the OpenAI client uses the custom base URL for all API requests

### Requirement: Responses API Integration
The system SHALL use the OpenAI SDK's Responses API methods to interact with stored prompts.

#### Scenario: Create response with stored prompt
- **WHEN** calling the Responses API with a prompt ID
- **THEN** the SDK's `openai.responses.create()` method is invoked with the prompt ID and user input

#### Scenario: Chain responses with previous context
- **WHEN** a `previousResponseId` is provided
- **THEN** the SDK includes `previous_response_id` parameter to maintain conversation continuity

#### Scenario: Extract text content from response
- **WHEN** a response is received from the Responses API
- **THEN** the system extracts assistant output text from the SDK's typed response object structure

### Requirement: Type-Safe API Interactions
The system SHALL leverage TypeScript types from the OpenAI SDK for request and response handling.

#### Scenario: Request parameters are type-checked
- **WHEN** constructing a Responses API request
- **THEN** TypeScript validates all parameters against SDK type definitions

#### Scenario: Response objects have type safety
- **WHEN** parsing API responses
- **THEN** the SDK's typed response interfaces prevent runtime type errors

### Requirement: Error Handling with SDK Error Types
The system SHALL handle OpenAI API errors using the SDK's structured error types.

#### Scenario: Handle API authentication errors
- **WHEN** the OpenAI API returns a 401 authentication error
- **THEN** the SDK throws an `APIError` with status code 401 and the system returns a 500 status to the client

#### Scenario: Handle rate limit errors
- **WHEN** the OpenAI API returns a 429 rate limit error
- **THEN** the SDK throws an `APIError` with status code 429 and the system returns a 500 status to the client

#### Scenario: Handle model refusals
- **WHEN** the OpenAI model refuses to respond due to safety policies
- **THEN** the system detects the refusal in the SDK response and throws an appropriate error

#### Scenario: Automatic retry on transient failures
- **WHEN** the OpenAI API returns a transient error (5xx)
- **THEN** the SDK automatically retries the request with exponential backoff

### Requirement: Response ID Tracking
The system SHALL extract and return OpenAI response IDs for conversation continuity.

#### Scenario: Extract response ID from API response
- **WHEN** a successful response is received from the Responses API
- **THEN** the system extracts the `id` field from the SDK response object

#### Scenario: Return response ID to caller
- **WHEN** `callOpenAIResponsesAPI()` completes successfully
- **THEN** the function returns both the content string and the response ID

### Requirement: Backward Compatibility with Existing API Routes
The system SHALL maintain the existing function signature and return format of `callOpenAIResponsesAPI()`.

#### Scenario: Function signature remains unchanged
- **WHEN** API routes call `callOpenAIResponsesAPI()`
- **THEN** the function accepts `input`, `promptId`, and optional `previousResponseId` parameters

#### Scenario: Return format matches existing contract
- **WHEN** `callOpenAIResponsesAPI()` completes
- **THEN** it returns an object with `content: string` and `responseId: string` properties

#### Scenario: Error behavior is preserved
- **WHEN** an API error occurs
- **THEN** the function throws an Error with a descriptive message, maintaining existing error handling behavior

### Requirement: OpenAI Configuration Validation
The system SHALL validate required OpenAI configuration at application startup.

#### Scenario: Validate API key is present
- **WHEN** the application initializes OpenAI configuration
- **THEN** the system throws an error if `OPENAI_API_KEY` is not set

#### Scenario: Validate prompt IDs are present
- **WHEN** the application initializes OpenAI configuration
- **THEN** the system throws an error if any required prompt ID environment variables are missing

### Requirement: Console Logging for Debugging
The system SHALL log OpenAI API request and response details for debugging purposes.

#### Scenario: Log request parameters
- **WHEN** calling the Responses API
- **THEN** the system logs the input, prompt ID, and previous response ID (if present)

#### Scenario: Log response data
- **WHEN** receiving a response from the Responses API
- **THEN** the system logs the response object for debugging

#### Scenario: Log API errors
- **WHEN** an OpenAI API error occurs
- **THEN** the system logs the full error details including status code and message
