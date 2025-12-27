# Database Setup Guide

## Overview

This project uses PostgreSQL with Prisma ORM. You can work with either a local database or the production Neon database.

## Local Development Setup

### 1. Configure Environment

Edit `.env` file and ensure it points to your local database:

```env
# Local Development
DATABASE_URL="postgresql://predator:123456@localhost:5432/tarot?schema=public"
DIRECT_URL="postgresql://predator:123456@localhost:5432/tarot?schema=public"
```

### 2. Run Migrations

Apply all migrations to your local database:

```bash
npm run db:migrate:deploy
```

### 3. Generate Prisma Client

Generate the Prisma client for type safety:

```bash
npm run db:generate
```

### 4. (Optional) Open Prisma Studio

View and edit your local database:

```bash
npm run db:studio
```

## Production Database Setup

### 1. Configure Environment

Edit `.env` file to use Neon production database:

```env
# Production (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_...@ep-misty-violet-ahsz4xmd-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_...@ep-misty-violet-ahsz4xmd.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

### 2. Apply Migrations

```bash
npm run db:migrate:deploy
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate:deploy` | Apply all pending migrations to the database |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema changes directly (dev only) |
| `npm run db:studio` | Open Prisma Studio GUI |

## Creating New Migrations

When you modify `prisma/schema.prisma`:

1. **Development (using db push - quick iteration):**
   ```bash
   npm run db:push
   ```

2. **Production (creating proper migrations):**
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```

This creates a migration file in `prisma/migrations/` that can be applied to production.

## Current Schema

### Users Table

Stores user preferences and tip states:

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,              -- Clerk user ID
    "tipsShown" JSONB,                -- Track which tips have been shown
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### Journal Entries Table

Stores completed reading sessions:

```sql
CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,           -- Clerk user ID
    intention TEXT NOT NULL,
    topic TEXT,
    "deckSeed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messagesJson" JSONB NOT NULL     -- Entire chat session
);
```

## Troubleshooting

### Database Not Empty Error

If you get "The database schema is not empty" error:

```bash
# Baseline existing migrations
npx prisma migrate resolve --applied 20251211104215_add_authentication
npx prisma migrate resolve --applied 20251218194046_add_user_table
```

### Connection Issues

- **Local**: Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- **Production**: Check Neon dashboard for connection status

### Switching Between Local and Production

1. Update `DATABASE_URL` and `DIRECT_URL` in `.env`
2. Run `npm run db:generate` to update Prisma Client
3. Restart your dev server
