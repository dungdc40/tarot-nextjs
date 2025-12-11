# Production Deployment Design

## Context
The tarot-nextjs application is a Next.js 16 App Router application using PostgreSQL with Prisma ORM, Clerk for authentication, and OpenAI for AI features. It needs to be deployed to production infrastructure that supports serverless Next.js applications, managed PostgreSQL databases, and secure authentication flows.

**Current State:**
- Local development with PostgreSQL on localhost:5432
- Test Clerk credentials (`pk_test_*`, `sk_test_*`)
- Development OpenAI API key
- No deployment infrastructure

**Target State:**
- Vercel-hosted production application with automatic deployments
- Neon PostgreSQL database with connection pooling
- Production Clerk authentication with custom domain support
- Production-ready environment variable management

**Stakeholders:**
- End users: Public access to tarot reading application
- Development team: Automated deployment workflow
- Operations: Monitoring, scaling, and maintenance

## Goals / Non-Goals

**Goals:**
- Deploy application to Vercel with automatic CI/CD from git repository
- Migrate database to Neon managed PostgreSQL service
- Configure production Clerk authentication with proper redirect URLs
- Establish secure environment variable management
- Enable serverless function optimization and connection pooling
- Document deployment process and troubleshooting procedures

**Non-Goals:**
- Custom Kubernetes/Docker deployment (using Vercel's managed platform)
- Multi-region deployment (single region sufficient for MVP)
- Database migration of existing local data (fresh production database)
- Custom CDN configuration (using Vercel's built-in CDN)
- Monitoring/observability infrastructure beyond Vercel's built-in analytics
- Load testing or performance benchmarking (address when traffic warrants)

## Decisions

### Decision 1: Vercel for Hosting
**Choice:** Use Vercel as the hosting platform for Next.js application

**Rationale:**
- Native Next.js support with zero-config deployment
- Automatic CI/CD from GitHub/GitLab/Bitbucket
- Built-in CDN, SSL certificates, and edge functions
- Serverless architecture with automatic scaling
- Free hobby tier sufficient for MVP, scalable to production pricing
- Excellent developer experience with preview deployments

**Alternatives Considered:**
- **AWS Amplify/Elastic Beanstalk:** More complex setup, requires AWS expertise, higher operational overhead
- **Railway/Render:** Good alternatives but less mature Next.js support than Vercel
- **Self-hosted (DigitalOcean/Linode):** Requires infrastructure management, SSL setup, and scaling configuration

### Decision 2: Neon for PostgreSQL Database
**Choice:** Use Neon as the managed PostgreSQL provider

**Rationale:**
- Serverless PostgreSQL with connection pooling built-in (critical for Vercel serverless functions)
- Generous free tier (500MB storage, unlimited databases)
- Automatic backups and point-in-time recovery
- Fast cold starts and branching support for development workflows
- PostgreSQL 15+ with full compatibility with Prisma

**Alternatives Considered:**
- **Supabase:** Excellent choice but includes unnecessary features (auth, storage, real-time) since we use Clerk
- **PlanetScale:** MySQL-based, would require schema changes from PostgreSQL
- **AWS RDS:** Requires connection pooling setup via RDS Proxy, more expensive for small workloads
- **Railway PostgreSQL:** Good option but Neon has better serverless optimization

### Decision 3: Continue Using Clerk for Authentication
**Choice:** Keep Clerk as authentication provider, upgrade to production tier if needed

**Rationale:**
- Already integrated in codebase (`add-clerk-authentication` change)
- Simple migration from test to production credentials
- Generous free tier (10,000 MAU)
- Production-ready with custom domain support
- No code changes required, only configuration updates

**Alternatives Considered:**
- **NextAuth.js:** Would require complete rewrite of authentication logic
- **Supabase Auth:** Vendor lock-in and migration effort not justified
- **Custom auth:** Security risks and development time not warranted

### Decision 4: Environment Variable Management
**Choice:** Use Vercel Environment Variables UI with categorization by environment (Production/Preview/Development)

**Rationale:**
- Native Vercel integration with automatic injection at build and runtime
- Separate variables for production, preview, and development environments
- Secure storage of sensitive credentials
- Easy updates without redeployment for runtime variables

**Configuration Strategy:**
- Production environment: Production Clerk keys, Neon production connection string, production OpenAI key
- Preview environment: Test Clerk keys, Neon branch database, development OpenAI key
- Development environment: Local PostgreSQL, test Clerk keys, development OpenAI key

### Decision 5: Database Connection Pooling
**Choice:** Use Neon's built-in connection pooling with Prisma

**Rationale:**
- Vercel serverless functions create new database connections per invocation
- Connection pooling prevents "too many connections" errors
- Neon provides connection pooling URL out of the box
- Simple Prisma configuration change

**Implementation:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // For migrations
}
```

## Risks / Trade-offs

**Risk: OpenAI API Key Exposure**
- **Mitigation:** Store OpenAI API key in Vercel environment variables (encrypted at rest), never commit to git, use `.env.local.example` template without actual keys

**Risk: Database Connection Limits**
- **Mitigation:** Use Neon connection pooling URL in `DATABASE_URL`, implement connection timeout configuration in Prisma client, monitor connection usage in Neon dashboard

**Risk: Clerk Redirect URL Misconfiguration**
- **Mitigation:** Document exact redirect URLs needed (`https://yourdomain.com/sign-in`, `https://yourdomain.com/sign-up`), test authentication flow in preview deployment before production, update Clerk dashboard before deploying

**Risk: Cold Start Latency**
- **Mitigation:** Accept cold start latency for MVP (5-10 seconds), monitor in Vercel analytics, upgrade to paid plan for reduced cold starts if needed, implement loading states in UI

**Risk: Vendor Lock-in**
- **Trade-off:** Accepting Vercel lock-in for significant developer experience and deployment simplicity gains. Application uses standard Next.js patterns, so migration to other platforms is feasible if needed in future.

**Risk: Cost Escalation**
- **Mitigation:** Start with free tiers (Vercel Hobby, Neon Free, Clerk Free), monitor usage dashboards, set up billing alerts, plan for upgrade costs as traffic grows (estimate $20-50/month for moderate traffic)

## Migration Plan

### Phase 1: Infrastructure Setup (No Code Changes)
1. Create Neon account and provision PostgreSQL database
2. Note connection pooling URL and direct URL from Neon dashboard
3. Create production Clerk application and note production keys
4. Create Vercel account and link git repository
5. Configure Vercel environment variables

### Phase 2: Database Migration
1. Run Prisma migrations against Neon database using direct URL
2. Verify schema with `prisma db pull` and `prisma studio`
3. Test database connectivity from local environment using Neon connection string
4. No data migration needed (fresh production database)

### Phase 3: Deployment Configuration
1. Update `prisma/schema.prisma` to use `directUrl` for migrations
2. Create `.env.production.example` documentation
3. Test build locally with `npm run build`
4. Configure Vercel build settings (automatic)
5. Deploy to Vercel preview environment

### Phase 4: Production Deployment
1. Update Clerk redirect URLs in dashboard to production domain
2. Verify all environment variables in Vercel production environment
3. Deploy to production
4. Test authentication flow, database operations, and AI features
5. Monitor Vercel logs and Neon connection metrics

### Phase 5: Documentation
1. Create deployment runbook with troubleshooting steps
2. Document environment variable requirements
3. Add rollback procedures
4. Create incident response guide for common issues

### Rollback Plan
1. Vercel provides instant rollback to previous deployment via dashboard
2. Database schema rollback via Prisma migrations if needed
3. Clerk configuration rollback by reverting redirect URLs
4. Local development environment unaffected and always functional

## Open Questions
1. **Custom domain:** Do we want to configure a custom domain immediately, or use Vercel's generated domain (`project-name.vercel.app`) initially?
2. **OpenAI API key:** Should we use the same development OpenAI API key for production, or provision a separate production key with different rate limits?
3. **Monitoring:** Do we need third-party monitoring (Sentry, LogRocket) immediately, or is Vercel's built-in analytics sufficient for MVP?
4. **Database backups:** Is Neon's automatic backup sufficient, or do we want to implement additional backup procedures?
