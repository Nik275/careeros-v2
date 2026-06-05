-- CareerOS Memory System V2 Migration
-- Adds TTL fields, indexes, and archival support for production-scale memory

-- ============================================
-- Session Memory: Add TTL and indexes
-- ============================================

-- Add expiresAt column for TTL
ALTER TABLE "SessionMemory" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Create index for TTL cleanup queries
CREATE INDEX IF NOT EXISTS "SessionMemory_expiresAt_idx" ON "SessionMemory"("expiresAt");

-- Create composite index for student + expiration queries
CREATE INDEX IF NOT EXISTS "SessionMemory_userId_expiresAt_idx" ON "SessionMemory"("userId", "expiresAt");

-- ============================================
-- Mentor Memory Active: Add TTL
-- ============================================

-- Add expiresAt column for TTL
ALTER TABLE "MentorMemoryActive" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Create index for TTL cleanup
CREATE INDEX IF NOT EXISTS "MentorMemoryActive_expiresAt_idx" ON "MentorMemoryActive"("expiresAt");

-- ============================================
-- Emotional Pattern Profile: Add TTL
-- ============================================

-- Add expiresAt column for TTL
ALTER TABLE "EmotionalPatternProfile" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Create index for TTL cleanup
CREATE INDEX IF NOT EXISTS "EmotionalPatternProfile_expiresAt_idx" ON "EmotionalPatternProfile"("expiresAt");

-- ============================================
-- Mentor Memory Archive: New table for compressed historical data
-- ============================================

CREATE TABLE IF NOT EXISTS "MentorMemoryArchive" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodSummary" TEXT NOT NULL,
    "patternsEmerging" TEXT[],
    "patternsFading" TEXT[],
    "majorBreakthroughs" TEXT[],
    "persistentBlindSpots" TEXT[],
    "emotionalTrajectory" JSONB,
    "decisionMilestones" TEXT[],
    "compressed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "MentorMemoryArchive_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MentorMemoryArchive_userId_period_key" UNIQUE ("userId", "period")
);

-- Create index for archive queries
CREATE INDEX IF NOT EXISTS "MentorMemoryArchive_userId_idx" ON "MentorMemoryArchive"("userId");
CREATE INDEX IF NOT EXISTS "MentorMemoryArchive_period_idx" ON "MentorMemoryArchive"("period");

-- Add foreign key constraint
ALTER TABLE "MentorMemoryArchive" 
    ADD CONSTRAINT "MentorMemoryArchive_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- Growth Snapshots: Add trigger tracking
-- ============================================

-- Add triggerType column if not exists
ALTER TABLE "GrowthSnapshot" ADD COLUMN IF NOT EXISTS "triggerType" TEXT;
ALTER TABLE "GrowthSnapshot" ADD COLUMN IF NOT EXISTS "triggerDescription" TEXT;

-- Create index for trigger-based queries
CREATE INDEX IF NOT EXISTS "GrowthSnapshot_triggerType_idx" ON "GrowthSnapshot"("triggerType");

-- ============================================
-- Decision History: Ensure permanent storage
-- ============================================

-- Add index for decision queries
CREATE INDEX IF NOT EXISTS "DecisionHistory_userId_createdAt_idx" ON "DecisionHistory"("userId", "createdAt" DESC);

-- ============================================
-- Mentor Memory Core: Add version tracking
-- ============================================

-- Add version column for optimistic locking
ALTER TABLE "MentorMemoryCore" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- Create index for version queries
CREATE INDEX IF NOT EXISTS "MentorMemoryCore_version_idx" ON "MentorMemoryCore"("version");

-- ============================================
-- Cleanup Job: Create function for TTL cleanup
-- ============================================

-- Create cleanup function (PostgreSQL)
CREATE OR REPLACE FUNCTION cleanup_expired_memory()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    session_deleted INTEGER;
    active_deleted INTEGER;
    emotional_deleted INTEGER;
BEGIN
    -- Delete expired session memory
    DELETE FROM "SessionMemory" 
    WHERE "expiresAt" IS NOT NULL AND "expiresAt" < NOW();
    GET DIAGNOSTICS session_deleted = ROW_COUNT;
    deleted_count := deleted_count + session_deleted;
    
    -- Delete expired active memory
    DELETE FROM "MentorMemoryActive" 
    WHERE "expiresAt" IS NOT NULL AND "expiresAt" < NOW();
    GET DIAGNOSTICS active_deleted = ROW_COUNT;
    deleted_count := deleted_count + active_deleted;
    
    -- Delete expired emotional profiles
    DELETE FROM "EmotionalPatternProfile" 
    WHERE "expiresAt" IS NOT NULL AND "expiresAt" < NOW();
    GET DIAGNOSTICS emotional_deleted = ROW_COUNT;
    deleted_count := deleted_count + emotional_deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Performance: Additional indexes for hot paths
-- ============================================

-- Index for batch loading queries
CREATE INDEX IF NOT EXISTS "SessionMemory_userId_createdAt_idx" ON "SessionMemory"("userId", "createdAt" DESC);

-- Index for active memory lookups
CREATE INDEX IF NOT EXISTS "MentorMemoryActive_userId_idx" ON "MentorMemoryActive"("userId");

-- Index for emotional profile lookups
CREATE INDEX IF NOT EXISTS "EmotionalPatternProfile_userId_idx" ON "EmotionalPatternProfile"("userId");

-- Index for growth snapshot queries
CREATE INDEX IF NOT EXISTS "GrowthSnapshot_userId_createdAt_idx" ON "GrowthSnapshot"("userId", "createdAt" DESC);

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE "MentorMemoryArchive" IS 'Compressed historical memory data for long-term storage';
COMMENT ON COLUMN "SessionMemory"."expiresAt" IS 'TTL expiration date - records deleted after this date';
COMMENT ON COLUMN "MentorMemoryActive"."expiresAt" IS 'TTL expiration date - records deleted after this date';
COMMENT ON COLUMN "EmotionalPatternProfile"."expiresAt" IS 'TTL expiration date - records deleted after this date';
COMMENT ON FUNCTION cleanup_expired_memory() IS 'Removes expired memory records based on TTL';
