# Implementation Tasks

## 1. Setup & Configuration
- [ ] 1.1 Install @clerk/nextjs package
- [ ] 1.2 Create Clerk account and application
- [ ] 1.3 Configure Email/Password authentication in Clerk dashboard
- [ ] 1.4 Configure Google OAuth in Clerk dashboard
- [ ] 1.5 Configure Facebook OAuth in Clerk dashboard
- [ ] 1.6 Add Clerk environment variables to .env.local
- [ ] 1.7 Update .env.local.example with Clerk variable documentation and setup instructions
- [ ] 1.8 Document local development setup process in README or docs

## 2. Database Migration
- [ ] 2.1 Update Prisma schema with userId field in JournalEntry
- [ ] 2.2 Add composite index on userId and createdAt
- [ ] 2.3 Run Prisma migration: `npx prisma migrate dev --name add_authentication`
- [ ] 2.4 Verify migration in Prisma Studio

## 3. Core Authentication Integration
- [ ] 3.1 Wrap app with ClerkProvider in app/layout.tsx
- [ ] 3.2 Create middleware.ts with route protection
- [ ] 3.3 Create sign-in page at app/sign-in/[[...sign-in]]/page.tsx
- [ ] 3.4 Create sign-up page at app/sign-up/[[...sign-up]]/page.tsx
- [ ] 3.5 Style Clerk components with neumorphic theme
- [ ] 3.6 Update lib/db/journal.ts functions to accept userId parameter
- [ ] 3.7 Add auth() checks to app/api/journal/route.ts
- [ ] 3.8 Add auth() checks and ownership verification to app/api/journal/[id]/route.ts

## 4. UI Integration
- [ ] 4.1 Update app/page.tsx with SignedIn/SignedOut components
- [ ] 4.2 Add UserButton to header in home page
- [ ] 4.3 Create UserMenu component (optional)
- [ ] 4.4 Update app/reading/page.tsx save handler
- [ ] 4.5 Add auth error handling to reading page

## 5. Testing
- [ ] 5.1 Test sign-up with email/password
- [ ] 5.2 Test sign-in with email/password
- [ ] 5.3 Test Google OAuth sign-in
- [ ] 5.4 Test Facebook OAuth sign-in
- [ ] 5.5 Test sign-out functionality
- [ ] 5.6 Test unauthenticated access redirects to /sign-in
- [ ] 5.7 Test reading creation and save to journal
- [ ] 5.8 Test journal displays only user's entries
- [ ] 5.9 Test cannot access other users' journal entries
- [ ] 5.10 Test API routes return 401 for unauthenticated requests
- [ ] 5.11 Test session persistence across page refreshes
- [ ] 5.12 Test multi-tab session synchronization
