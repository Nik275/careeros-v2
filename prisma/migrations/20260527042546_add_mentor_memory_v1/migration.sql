-- CreateTable
CREATE TABLE "mentor_memories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coreMotivations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dominantTraits" JSONB NOT NULL DEFAULT '[]',
    "coreVulnerabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "decisionStyle" TEXT NOT NULL DEFAULT 'balanced',
    "stressResponse" TEXT NOT NULL DEFAULT 'problem_solve',
    "recurringPatterns" JSONB NOT NULL DEFAULT '[]',
    "blindSpotMemory" JSONB NOT NULL DEFAULT '[]',
    "unresolvedContradictions" JSONB NOT NULL DEFAULT '[]',
    "mentorSummary" TEXT NOT NULL DEFAULT 'New student. Building psychological profile.',
    "memoryConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "decisionTopic" TEXT NOT NULL,
    "context" TEXT,
    "mentorRecommendation" TEXT NOT NULL,
    "recommendationRationale" TEXT,
    "chosenDirection" TEXT NOT NULL,
    "decisionConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "outcome" TEXT,
    "outcomeConfidence" DOUBLE PRECISION,
    "unresolvedTension" BOOLEAN NOT NULL DEFAULT false,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "decision_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growth_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selfConfidence" JSONB NOT NULL,
    "decisionConfidence" JSONB NOT NULL,
    "careerClarity" JSONB NOT NULL,
    "identityClarity" JSONB NOT NULL,
    "motivationShift" JSONB NOT NULL DEFAULT '[]',
    "blindSpotFrequency" JSONB NOT NULL DEFAULT '[]',
    "contradictionChanges" JSONB NOT NULL DEFAULT '[]',
    "emotionalStability" JSONB NOT NULL,
    "anxietyBaseline" JSONB NOT NULL,
    "periodSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "growth_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotional_patterns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anxietyBeforeDecisions" JSONB NOT NULL,
    "validationSeeking" JSONB NOT NULL,
    "overthinkingTendency" JSONB NOT NULL,
    "confidenceVolatility" JSONB NOT NULL,
    "recurringFears" JSONB NOT NULL DEFAULT '[]',
    "knownTriggers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emotional_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_memories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "insights" JSONB NOT NULL DEFAULT '[]',
    "newPatterns" JSONB NOT NULL DEFAULT '[]',
    "reinforcedPatterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "surfacedBlindSpots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "decisionsDiscussed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dominantEmotion" TEXT NOT NULL DEFAULT 'neutral',
    "emotionalIntensity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "breakthroughs" JSONB NOT NULL DEFAULT '[]',
    "resistancePoints" JSONB NOT NULL DEFAULT '[]',
    "commitments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_memories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_memories_userId_key" ON "mentor_memories"("userId");

-- CreateIndex
CREATE INDEX "mentor_memories_userId_idx" ON "mentor_memories"("userId");

-- CreateIndex
CREATE INDEX "mentor_memories_updatedAt_idx" ON "mentor_memories"("updatedAt");

-- CreateIndex
CREATE INDEX "decision_history_userId_idx" ON "decision_history"("userId");

-- CreateIndex
CREATE INDEX "decision_history_status_idx" ON "decision_history"("status");

-- CreateIndex
CREATE INDEX "decision_history_createdAt_idx" ON "decision_history"("createdAt");

-- CreateIndex
CREATE INDEX "growth_snapshots_userId_idx" ON "growth_snapshots"("userId");

-- CreateIndex
CREATE INDEX "growth_snapshots_createdAt_idx" ON "growth_snapshots"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "emotional_patterns_userId_key" ON "emotional_patterns"("userId");

-- CreateIndex
CREATE INDEX "emotional_patterns_userId_idx" ON "emotional_patterns"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_memories_sessionId_key" ON "session_memories"("sessionId");

-- CreateIndex
CREATE INDEX "session_memories_userId_idx" ON "session_memories"("userId");

-- CreateIndex
CREATE INDEX "session_memories_sessionId_idx" ON "session_memories"("sessionId");

-- CreateIndex
CREATE INDEX "session_memories_createdAt_idx" ON "session_memories"("createdAt");

-- AddForeignKey
ALTER TABLE "mentor_memories" ADD CONSTRAINT "mentor_memories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_history" ADD CONSTRAINT "decision_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_snapshots" ADD CONSTRAINT "growth_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotional_patterns" ADD CONSTRAINT "emotional_patterns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_memories" ADD CONSTRAINT "session_memories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
