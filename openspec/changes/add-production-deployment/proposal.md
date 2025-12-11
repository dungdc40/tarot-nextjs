# Add Production Deployment

## Why
The application is currently only running in local development mode with local PostgreSQL and test Clerk credentials. To make the app publicly accessible and production-ready, we need to deploy it to cloud infrastructure with production-grade database, authentication, and hosting services. This enables real users to access the tarot reading experience and establishes a scalable, maintainable deployment architecture.

## What Changes
- Configure Vercel deployment for Next.js application hosting with automatic CI/CD
- Migrate database from local PostgreSQL to Neon managed PostgreSQL service
- Update Clerk authentication to use production credentials and domain
- Add environment variable configuration for production deployment
- Configure build settings and deployment optimizations
- Set up custom domain (optional) and SSL certificates
- Add deployment documentation and runbook
- Configure database connection pooling for serverless environment
- Update CORS and authentication redirect URLs for production domain

## Impact
- **Affected specs**: New `deployment` capability
- **Affected code**:
  - Configuration: `.env.local.example` - Document production environment variables
  - Database: `prisma/schema.prisma` - Add connection pooling for Neon
  - Build: `next.config.mjs` - Add production optimizations
  - Documentation: New deployment guide
  - Clerk: Update redirect URLs and webhooks in Clerk dashboard
  - Vercel: Project configuration, environment variables, build settings
  - Neon: Database provisioning, connection string configuration
- **No breaking changes**: Existing local development workflow remains unchanged
- **New infrastructure**: Adds cloud services (Vercel, Neon) with associated costs
