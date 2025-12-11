-- AlterTable
-- Add userId column to journal_entries table
-- This is a breaking change that requires dropping existing data
-- as per the migration strategy in the design document

-- First, drop all existing journal entries (fresh start migration)
DELETE FROM journal_entries;

-- Add the userId column (required field)
ALTER TABLE "journal_entries" ADD COLUMN "userId" TEXT NOT NULL;

-- Create composite index on userId and createdAt for efficient user-specific queries
CREATE INDEX "journal_entries_userId_createdAt_idx" ON "journal_entries"("userId", "createdAt" DESC);
