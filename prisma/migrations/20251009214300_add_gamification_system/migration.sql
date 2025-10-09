-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "RankingScope" AS ENUM ('GLOBAL', 'NATIONAL', 'REGIONAL', 'LOCAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BadgeType" AS ENUM ('PERFORMANCE', 'MILESTONE', 'CONSISTENCY', 'ACHIEVEMENT', 'SPECIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to athletes table (if not exists)
DO $$ BEGIN
    ALTER TABLE "athletes" ADD COLUMN "country" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "athletes" ADD COLUMN "region" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "athletes" ADD COLUMN "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "athletes" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "athletes" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- CreateTable badges (if not exists)
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "condition" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'COMMON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable athlete_badges (if not exists)
CREATE TABLE IF NOT EXISTS "athlete_badges" (
    "id" TEXT NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athlete_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable rankings (if not exists)
CREATE TABLE IF NOT EXISTS "rankings" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "sportId" TEXT NOT NULL,
    "positionId" TEXT,
    "scope" "RankingScope" NOT NULL,
    "region" TEXT,
    "country" TEXT,
    "rank" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rankings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (if not exists)
DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "badges_name_key" ON "badges"("name");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "athlete_badges_athleteId_badgeId_key" ON "athlete_badges"("athleteId", "badgeId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "rankings_athleteId_sportId_scope_period_region_country_key" ON "rankings"("athleteId", "sportId", "scope", "period", "region", "country");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "rankings_sportId_scope_period_rank_idx" ON "rankings"("sportId", "scope", "period", "rank");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "rankings_athleteId_sportId_idx" ON "rankings"("athleteId", "sportId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- AddForeignKey (if not exists)
DO $$ BEGIN
    ALTER TABLE "athlete_badges" ADD CONSTRAINT "athlete_badges_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "athlete_badges" ADD CONSTRAINT "athlete_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "rankings" ADD CONSTRAINT "rankings_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
