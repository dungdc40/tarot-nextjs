# Deployment Implementation Tasks

## 1. Infrastructure Setup

- [x] 1.1 Create Neon account at https://neon.tech
- [x] 1.2 Provision new PostgreSQL database in Neon dashboard (Project: "Enkara")
- [x] 1.3 Copy connection pooling URL from Neon dashboard (for `DATABASE_URL`)
- [x] 1.4 Copy direct connection URL from Neon dashboard (for `DIRECT_DATABASE_URL`)
- [ ] 1.5 Create production Clerk application in Clerk dashboard
- [ ] 1.6 Copy production publishable key and secret key from Clerk
- [ ] 1.7 Create Vercel account at https://vercel.com
- [ ] 1.8 Import git repository to Vercel (connect GitHub/GitLab/Bitbucket account)

## 2. Database Configuration

- [x] 2.1 Update `prisma/schema.prisma` to add `directUrl` configuration
- [x] 2.2 Test Neon connection from local environment using connection pooling URL
- [x] 2.3 Run Prisma migrations against Neon database using direct URL
- [x] 2.4 Verify schema with `npx prisma db pull` against Neon database
- [x] 2.5 Open Prisma Studio pointing to Neon database and verify tables exist
- [ ] 2.6 Test database connectivity by creating a test journal entry via API

## 3. Environment Variable Configuration

- [x] 3.1 Create `.env.production.example` file documenting required production variables
- [ ] 3.2 Add Neon connection pooling URL to Vercel environment variables as `DATABASE_URL` (Production)
- [ ] 3.3 Add Neon direct URL to Vercel environment variables as `DIRECT_URL` (Production)
- [ ] 3.4 Add production Clerk publishable key to Vercel as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Production)
- [ ] 3.5 Add production Clerk secret key to Vercel as `CLERK_SECRET_KEY` (Production)
- [ ] 3.6 Add OpenAI API key to Vercel environment variables (Production)
- [ ] 3.7 Add all OpenAI prompt IDs to Vercel environment variables (Production)
- [ ] 3.8 Set `NEXT_PUBLIC_APP_URL` to production domain in Vercel (Production)
- [ ] 3.9 Configure preview environment variables in Vercel (use test Clerk keys)

## 4. Clerk Production Configuration

- [ ] 4.1 Update Clerk redirect URLs to include production domain in Clerk dashboard
- [ ] 4.2 Add `https://[production-domain]/sign-in` to allowed redirect URLs
- [ ] 4.3 Add `https://[production-domain]/sign-up` to allowed redirect URLs
- [ ] 4.4 Add `https://[production-domain]` to allowed origin URLs
- [ ] 4.5 Configure session settings in Clerk dashboard (session lifetime, multi-session)
- [ ] 4.6 Test authentication flow in preview deployment before production

## 5. Build Configuration

- [ ] 5.1 Verify `next.config.mjs` has production-ready settings
- [ ] 5.2 Test production build locally with `npm run build && npm run start`
- [ ] 5.3 Verify build output size and optimization in local build
- [ ] 5.4 Configure Vercel build settings (should be auto-detected for Next.js)
- [ ] 5.5 Set build command to `npm run build` in Vercel (default)
- [ ] 5.6 Set output directory to `.next` in Vercel (default)
- [ ] 5.7 Configure Node.js version in Vercel settings (18.x or 20.x)

## 6. Preview Deployment Testing

- [ ] 6.1 Create a feature branch and push to trigger preview deployment
- [ ] 6.2 Wait for Vercel preview build to complete
- [ ] 6.3 Access preview deployment URL from Vercel dashboard or PR comment
- [ ] 6.4 Test authentication flow (sign-up, sign-in, sign-out) in preview
- [ ] 6.5 Test tarot reading flow end-to-end in preview
- [ ] 6.6 Test journal entry creation and retrieval in preview
- [ ] 6.7 Verify database operations are working with Neon connection
- [ ] 6.8 Check browser console for errors in preview deployment
- [ ] 6.9 Review Vercel build logs for warnings or errors

## 7. Production Deployment

- [ ] 7.1 Merge feature branch to main branch to trigger production deployment
- [ ] 7.2 Monitor Vercel production build in real-time
- [ ] 7.3 Verify build completes successfully without errors
- [ ] 7.4 Access production URL (Vercel-generated domain or custom domain)
- [ ] 7.5 Test authentication flow completely in production
- [ ] 7.6 Create test account and perform full tarot reading in production
- [ ] 7.7 Verify journal entries are saved and retrieved correctly
- [ ] 7.8 Test all navigation paths and pages in production
- [ ] 7.9 Check Vercel logs for any runtime errors

## 8. Post-Deployment Validation

- [ ] 8.1 Monitor Vercel analytics for request volume and errors
- [ ] 8.2 Check Neon dashboard for database connection metrics
- [ ] 8.3 Verify SSL certificate is valid and HTTPS is working
- [ ] 8.4 Test performance and page load times on production
- [ ] 8.5 Verify cold start times are acceptable for serverless functions
- [ ] 8.6 Test rollback by promoting a previous deployment in Vercel dashboard
- [ ] 8.7 Restore current deployment after testing rollback
- [ ] 8.8 Document any issues encountered and resolutions

## 9. Documentation

- [ ] 9.1 Create deployment runbook with step-by-step instructions
- [ ] 9.2 Document environment variable requirements in `.env.production.example`
- [ ] 9.3 Add troubleshooting section for common deployment issues
- [ ] 9.4 Document Clerk configuration requirements for production
- [ ] 9.5 Document Neon database connection pooling setup
- [ ] 9.6 Create rollback procedures documentation
- [ ] 9.7 Add monitoring and observability guide
- [ ] 9.8 Update project README with deployment information

## 10. Optional Enhancements

- [ ] 10.1 Configure custom domain in Vercel (if desired)
- [ ] 10.2 Update Clerk redirect URLs for custom domain (if applicable)
- [ ] 10.3 Set up Vercel Analytics for detailed performance tracking
- [ ] 10.4 Configure Sentry or error tracking service (if needed)
- [ ] 10.5 Set up database backup automation beyond Neon defaults (if needed)
- [ ] 10.6 Configure Vercel preview deployment comments on PRs
- [ ] 10.7 Add deployment status badges to README
- [ ] 10.8 Set up monitoring alerts for errors or performance degradation
