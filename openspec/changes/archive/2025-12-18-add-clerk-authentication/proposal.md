# Add Clerk Authentication

## Why
The application currently has no authentication system, allowing anyone to access all journal entries globally. Users cannot have private readings, and there's no way to track ownership of journal entries. This creates security vulnerabilities and prevents the app from being production-ready.

## What Changes
- **BREAKING**: Require authentication for all reading and journal functionality
- Add Clerk as managed authentication service supporting Email/Password, Google OAuth, and Facebook OAuth
- Add `userId` field to `JournalEntry` database model to track ownership
- Protect all journal API routes with authentication checks
- Add sign-in and sign-up pages with pre-built Clerk components
- Update UI to show user menu and authentication-aware navigation
- Delete all existing journal entries (fresh start migration strategy)
- Add middleware to protect routes requiring authentication
- Document local development setup with Clerk credentials in .env.local.example

## Impact
- **Affected specs**: New `authentication` capability
- **Affected code**:
  - Database: `prisma/schema.prisma` - Add userId to JournalEntry
  - API Routes: `app/api/journal/route.ts`, `app/api/journal/[id]/route.ts` - Add auth checks
  - Database layer: `lib/db/journal.ts` - Add userId parameter to all functions
  - Root layout: `app/layout.tsx` - Add ClerkProvider
  - Middleware: `middleware.ts` (new) - Route protection
  - Auth pages: `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx` (new)
  - Home page: `app/page.tsx` - Auth-aware UI
  - Reading page: `app/reading/page.tsx` - Protected, update save handler
  - Config: `.env.local` - Add Clerk environment variables
- **Breaking**: All users must sign in to take readings. No anonymous access.
- **Data loss**: All existing journal entries will be deleted during migration.
