## ADDED Requirements

### Requirement: User Registration
The system SHALL allow users to create accounts using email/password, Google OAuth, or Facebook OAuth.

#### Scenario: Email/password registration success
- **WHEN** a user provides a valid email and password
- **THEN** the system creates a new user account
- **AND** redirects the user to the reading page

#### Scenario: Google OAuth registration
- **WHEN** a user clicks "Sign in with Google"
- **THEN** the system redirects to Google OAuth consent screen
- **AND** creates account upon successful authentication

#### Scenario: Facebook OAuth registration
- **WHEN** a user clicks "Sign in with Facebook"
- **THEN** the system redirects to Facebook OAuth consent screen
- **AND** creates account upon successful authentication

#### Scenario: Duplicate email registration
- **WHEN** a user attempts to register with an existing email
- **THEN** the system displays an error message
- **AND** does not create a duplicate account

### Requirement: User Authentication
The system SHALL authenticate users and maintain secure sessions.

#### Scenario: Email/password login success
- **WHEN** a user provides valid credentials
- **THEN** the system creates an authenticated session
- **AND** redirects to the reading page

#### Scenario: Invalid credentials
- **WHEN** a user provides incorrect email or password
- **THEN** the system displays an error message
- **AND** does not create a session

#### Scenario: Session persistence
- **WHEN** an authenticated user refreshes the page
- **THEN** the session persists
- **AND** the user remains authenticated

### Requirement: Route Protection
The system SHALL protect routes requiring authentication and redirect unauthenticated users.

#### Scenario: Unauthenticated access to reading page
- **WHEN** an unauthenticated user navigates to /reading
- **THEN** the system redirects to /sign-in
- **AND** preserves the original URL for post-auth redirect

#### Scenario: Unauthenticated access to journal
- **WHEN** an unauthenticated user navigates to /journal
- **THEN** the system redirects to /sign-in

#### Scenario: Authenticated access to protected routes
- **WHEN** an authenticated user navigates to /reading or /journal
- **THEN** the system allows access
- **AND** displays the requested page

#### Scenario: Public route access
- **WHEN** any user navigates to / or /decks
- **THEN** the system allows access without authentication

### Requirement: API Route Authorization
The system SHALL verify authentication and ownership for all journal API endpoints.

#### Scenario: Authenticated journal list request
- **WHEN** an authenticated user requests GET /api/journal
- **THEN** the system returns only that user's journal entries
- **AND** does not include entries from other users

#### Scenario: Unauthenticated journal list request
- **WHEN** an unauthenticated user requests GET /api/journal
- **THEN** the system returns 401 Unauthorized
- **AND** does not return any journal data

#### Scenario: Create journal entry with authentication
- **WHEN** an authenticated user posts to /api/journal
- **THEN** the system creates an entry with the user's userId
- **AND** returns 201 Created with the entry data

#### Scenario: Access own journal entry
- **WHEN** an authenticated user requests their own journal entry by ID
- **THEN** the system returns the entry data

#### Scenario: Access other user's journal entry
- **WHEN** an authenticated user requests another user's journal entry ID
- **THEN** the system returns 404 Not Found
- **AND** does not reveal whether the entry exists

#### Scenario: Delete own journal entry
- **WHEN** an authenticated user deletes their own journal entry
- **THEN** the system removes the entry
- **AND** returns 200 OK

#### Scenario: Delete other user's journal entry
- **WHEN** an authenticated user attempts to delete another user's entry
- **THEN** the system returns 404 Not Found
- **AND** does not delete the entry

### Requirement: User Session Management
The system SHALL provide session management including sign-out functionality.

#### Scenario: User sign-out
- **WHEN** an authenticated user clicks sign out
- **THEN** the system destroys the session
- **AND** redirects to the home page
- **AND** removes authentication cookies

#### Scenario: Session expiration
- **WHEN** a user's session expires (after 7 days by default)
- **THEN** the system treats the user as unauthenticated
- **AND** redirects to sign-in on protected route access

#### Scenario: Multi-tab session synchronization
- **WHEN** a user signs out in one browser tab
- **THEN** all other tabs reflect the signed-out state
- **AND** redirect to sign-in if on protected routes

### Requirement: User Interface Authentication State
The system SHALL display authentication-aware UI components based on user state.

#### Scenario: Unauthenticated home page
- **WHEN** an unauthenticated user views the home page
- **THEN** the system displays "Get Started" and "Sign In" buttons
- **AND** does not show user menu or avatar

#### Scenario: Authenticated home page
- **WHEN** an authenticated user views the home page
- **THEN** the system displays "Start Your Reading" button
- **AND** shows user avatar with dropdown menu

#### Scenario: User menu options
- **WHEN** an authenticated user clicks their avatar
- **THEN** the system displays a menu with Journal and Sign Out options

### Requirement: Journal Entry Ownership
The system SHALL associate all journal entries with the creating user and enforce ownership.

#### Scenario: Save reading to journal
- **WHEN** an authenticated user saves a reading
- **THEN** the system creates a journal entry with the user's userId
- **AND** the entry is only visible to that user

#### Scenario: View personal journal
- **WHEN** an authenticated user views /journal
- **THEN** the system displays only entries created by that user
- **AND** does not include any other users' entries

#### Scenario: Journal entry count
- **WHEN** User A has 5 entries and User B has 3 entries
- **THEN** User A sees exactly 5 entries in their journal
- **AND** User B sees exactly 3 entries in their journal

### Requirement: Authentication UI Styling
The system SHALL style authentication components to match the neumorphic design system.

#### Scenario: Sign-in page appearance
- **WHEN** a user views the sign-in page
- **THEN** the form uses neumorphic shadows and rounded borders
- **AND** matches the app's blue pastel color palette
- **AND** uses Playfair Display and Inter fonts

#### Scenario: User button styling
- **WHEN** an authenticated user views the user avatar button
- **THEN** the button uses neumorphic raised shadow effect
- **AND** the dropdown menu uses neumorphic card styling

### Requirement: Database Schema Migration
The system SHALL migrate the database schema to support user authentication.

#### Scenario: JournalEntry schema update
- **WHEN** the migration runs
- **THEN** the journal_entries table has a userId column of type String
- **AND** a composite index exists on (userId, createdAt)

#### Scenario: Existing data handling
- **WHEN** the migration runs on a database with existing journal entries
- **THEN** all existing entries are deleted
- **AND** the table is empty with the new schema

### Requirement: Environment Configuration
The system SHALL require Clerk API credentials via environment variables.

#### Scenario: Missing Clerk credentials
- **WHEN** the application starts without CLERK_SECRET_KEY
- **THEN** authentication features do not function
- **AND** the application logs configuration errors

#### Scenario: Valid Clerk configuration
- **WHEN** all required Clerk environment variables are set
- **THEN** authentication features work correctly
- **AND** OAuth providers are available

### Requirement: Local Development Setup
The system SHALL provide clear instructions for developers to set up authentication in their local environment.

#### Scenario: Environment variables documentation
- **WHEN** a developer views .env.local.example
- **THEN** the file includes all required Clerk environment variables
- **AND** includes comments explaining where to obtain each value
- **AND** includes example values or placeholders

#### Scenario: Clerk account setup for development
- **WHEN** a developer needs to run the app locally
- **THEN** they can create a free Clerk development account
- **AND** obtain NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from the Clerk dashboard
- **AND** obtain CLERK_SECRET_KEY from the Clerk dashboard
- **AND** configure the development instance URLs

#### Scenario: Development mode authentication
- **WHEN** a developer runs the app locally with valid Clerk credentials
- **THEN** authentication works on localhost:3000
- **AND** sign-in/sign-up flows function correctly
- **AND** OAuth providers work with development redirect URLs

#### Scenario: Local database with authentication
- **WHEN** a developer runs migrations locally
- **THEN** the userId field exists in journal_entries table
- **AND** they can create and test authenticated journal entries
- **AND** data isolation works correctly in development
