# Design: Clerk Authentication Integration

## Context
The tarot reading application needs user authentication to provide private, personalized reading experiences. Currently, all journal entries are globally accessible without any ownership tracking, which is a security vulnerability and prevents production deployment.

### Constraints
- Next.js 16 App Router (requires compatible auth solution)
- PostgreSQL database with Prisma ORM
- Existing neumorphic design system must be maintained
- Fast implementation required (1-2 days target)
- Support for Email/Password, Google OAuth, and Facebook OAuth

### Stakeholders
- End users who want private readings
- Developers maintaining the application

## Goals / Non-Goals

### Goals
- Implement secure, production-ready authentication
- Support multiple authentication providers (email, Google, Facebook)
- Maintain existing user experience and design aesthetic
- Protect all user data with proper authorization
- Fast setup with minimal custom authentication code

### Non-Goals
- Building custom authentication system
- Self-hosting authentication infrastructure
- Supporting additional providers beyond email/Google/Facebook in first release
- Migrating existing anonymous journal entries (fresh start)
- Anonymous reading support (require authentication for all features)

## Decisions

### Decision 1: Clerk over Other Solutions
**Choice**: Use Clerk as managed authentication service

**Why Clerk:**
- Native Next.js 16 App Router support with zero configuration
- Pre-built UI components (SignIn, SignUp, UserButton) speed development
- All 3 required providers built-in (email/password, Google, Facebook)
- Automatic session management with no manual implementation
- Excellent TypeScript support and developer experience
- 10,000 free MAUs covers early growth
- Handles all security concerns (password hashing, token management, CSRF protection)

**Alternatives Considered:**
1. **NextAuth.js**: Self-hosted, more control but requires more setup, database schema management, and manual UI development. Requires `--legacy-peer-deps` with Next.js 16.
2. **Supabase Auth**: Good PostgreSQL integration but more complex SSR patterns, deprecated Auth Helpers package, requires managing separate client instances.
3. **Auth0**: Enterprise focus, expensive scaling ($500+/month after 7,500 users), redirect-based Universal Login only.
4. **AWS Cognito**: Requires AWS expertise, less developer-friendly, reduced free tier (10K MAUs).

**Rationale**: Clerk offers the fastest path to production with excellent DX and minimal custom code. The managed service eliminates authentication complexity while providing enterprise-grade security.

### Decision 2: No Anonymous Access
**Choice**: Require authentication for all reading features

**Why:**
- Simplifies implementation (no mixed auth state handling)
- Better user tracking and analytics
- Ensures all readings are saved and accessible later
- Clear security model (all data belongs to a user)
- Reduces edge cases and testing complexity

**Alternatives Considered:**
- Allow anonymous readings with localStorage: Complex migration logic when users sign up
- Allow anonymous readings without saving: Poor UX, lost data

**Rationale**: Requiring authentication provides the best long-term UX and simplest implementation. Users can still explore cards without authentication.

### Decision 3: Fresh Start Migration
**Choice**: Delete all existing journal entries during migration

**Why:**
- Application is in development with likely only test data
- Simplifies migration (no orphaned entry handling)
- Clean database state for production launch
- Avoids complex data attribution logic

**Alternatives Considered:**
- Keep entries as "anonymous" demo content
- Build migration tool to let users claim entries

**Rationale**: Fresh start is simplest and most appropriate for pre-production app.

### Decision 4: Middleware-Based Route Protection
**Choice**: Use Clerk's `clerkMiddleware()` for route-level protection

**Why:**
- Centralized authentication logic
- Automatic redirects to sign-in for protected routes
- Works at edge (fast, globally distributed)
- Consistent with Next.js 16 App Router patterns

**Implementation:**
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',           // Landing page
  '/decks(.*)',  // Card exploration
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})
```

### Decision 5: Server-Side Session Validation
**Choice**: Use `auth()` helper in API routes and server components

**Why:**
- Secure session validation on server
- Type-safe userId extraction
- Works in both Route Handlers and Server Components
- No client-side session exposure

**Pattern:**
```typescript
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Use userId for database queries
}
```

### Decision 6: Clerk-Managed User Data
**Choice**: Store only Clerk userId as foreign key in our database

**Why:**
- Clerk handles all user profile data in their cloud
- No need for User table in our schema
- Simplified schema with single foreign key
- Clerk provides user management dashboard

**Schema:**
```prisma
model JournalEntry {
  userId String  // Clerk user ID only
  // ... other fields
}
```

## Risks / Trade-offs

### Risk 1: Vendor Lock-in
**Risk**: Dependency on Clerk's continued service and pricing

**Mitigation:**
- Clerk has strong financial backing and customer base
- Standard OAuth patterns make migration possible if needed
- Free tier (10K MAUs) covers significant growth
- Can migrate to NextAuth.js or other solution if required

### Risk 2: Third-Party Service Downtime
**Risk**: Clerk outage prevents user authentication

**Mitigation:**
- Clerk has 99.9% uptime SLA
- Authentication is required for all features, so no partial functionality issue
- Clear error messaging if service unavailable
- Clerk's edge network provides high availability

### Risk 3: OAuth Provider Configuration
**Risk**: Google/Facebook OAuth setup requires external accounts and configuration

**Mitigation:**
- Clerk dashboard guides through OAuth setup
- Can launch with email/password only and add OAuth later
- Clear documentation for OAuth app creation

### Risk 4: Bundle Size Increase
**Risk**: Clerk components may increase bundle size

**Trade-off Accepted:**
- Pre-built components save significant development time
- Modern auth solutions require client-side code regardless
- Can optimize with code splitting if needed
- Development speed prioritized over minimal bundle size

## Migration Plan

### Phase 1: Setup (2-3 hours)
1. Install @clerk/nextjs
2. Create Clerk account and configure application
3. Set up OAuth providers in Clerk dashboard
4. Add environment variables

**Checkpoint**: Clerk dashboard shows configured app

### Phase 2: Database (1 hour)
1. Update Prisma schema with userId field
2. Run migration (will delete existing entries)
3. Verify schema in Prisma Studio

**Checkpoint**: Database has userId column, empty table

### Phase 3: Core Auth (3-4 hours)
1. Add ClerkProvider to root layout
2. Create middleware for route protection
3. Create sign-in and sign-up pages
4. Update database functions with userId parameter
5. Protect API routes

**Checkpoint**: Auth flows work, API protection active

### Phase 4: UI (2-3 hours)
1. Update home page with auth-aware UI
2. Add UserButton navigation
3. Update reading page save handler
4. Style Clerk components

**Checkpoint**: Complete user journey functional

### Phase 5: Testing (2-3 hours)
1. Test all authentication methods
2. Verify route protection
3. Confirm data isolation
4. Check edge cases

**Checkpoint**: All tests pass, ready for deployment

### Rollback Plan
If critical issues arise:
1. Revert database: `npx prisma migrate reset`
2. Revert code changes via git
3. Remove Clerk package
4. Remove environment variables

**Decision Point**: Stop before Phase 2 if Clerk setup issues occur

## Open Questions

### Q1: Should we enable email verification?
**Answer**: Yes, enable in Clerk dashboard for security

### Q2: Session expiration time?
**Answer**: Use Clerk default (7 days), can adjust in dashboard

### Q3: Password requirements?
**Answer**: Clerk's default (8+ characters, complexity rules) is appropriate

### Q4: Rate limiting on auth endpoints?
**Answer**: Clerk handles rate limiting automatically

### Q5: Should /decks be public or protected?
**Answer**: Keep public - allows exploration before sign-up
