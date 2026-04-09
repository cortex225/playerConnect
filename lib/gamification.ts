import { prisma } from "@/lib/db";

// XP rewards for actions
export const XP_REWARDS = {
  ADD_PERFORMANCE: 50,
  UPLOAD_MEDIA: 25,
  CREATE_EVENT: 30,
  CREATE_PUBLIC_EVENT: 50,
  RECEIVE_INVITATION: 20,
  DAILY_LOGIN: 10,
  FIRST_PERFORMANCE: 100, // Bonus for first ever
  FIRST_MEDIA: 50, // Bonus for first ever
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500,
  7500, 10000, 13000, 17000, 22000, 28000, 35000, 43000, 52000, 65000,
];

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;
}

/**
 * Award XP to an athlete and handle level-ups
 * Returns the new XP, level, and whether a level-up occurred
 */
export async function awardXP(
  athleteId: number,
  amount: number,
  reason: string
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean; previousLevel: number }> {
  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { xp: true, level: true },
  });

  if (!athlete) throw new Error("Athlete not found");

  const previousLevel = athlete.level;
  const newXp = athlete.xp + amount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > previousLevel;

  // Update athlete XP and level
  await prisma.athlete.update({
    where: { id: athleteId },
    data: {
      xp: newXp,
      level: newLevel,
    },
  });

  console.log(
    `[Gamification] Athlete ${athleteId}: +${amount} XP (${reason}). Total: ${newXp}. Level: ${newLevel}${leveledUp ? " LEVEL UP!" : ""}`
  );

  return { newXp, newLevel, leveledUp, previousLevel };
}

/**
 * Award XP for adding a performance
 */
export async function rewardPerformance(athleteId: number): Promise<ReturnType<typeof awardXP>> {
  // Check if this is the first performance
  const count = await prisma.performance.count({ where: { athleteId } });
  const bonus = count === 1 ? XP_REWARDS.FIRST_PERFORMANCE : 0;
  return awardXP(athleteId, XP_REWARDS.ADD_PERFORMANCE + bonus, "performance_added");
}

/**
 * Award XP for uploading media
 */
export async function rewardMedia(athleteId: number): Promise<ReturnType<typeof awardXP>> {
  const count = await prisma.media.count({ where: { athleteId } });
  const bonus = count === 1 ? XP_REWARDS.FIRST_MEDIA : 0;
  return awardXP(athleteId, XP_REWARDS.UPLOAD_MEDIA + bonus, "media_uploaded");
}

/**
 * Award XP for creating an event
 */
export async function rewardEvent(athleteId: number, isPublic: boolean): Promise<ReturnType<typeof awardXP>> {
  const amount = isPublic ? XP_REWARDS.CREATE_PUBLIC_EVENT : XP_REWARDS.CREATE_EVENT;
  return awardXP(athleteId, amount, "event_created");
}

/**
 * Award XP when receiving a recruiter invitation
 */
export async function rewardInvitation(athleteId: number): Promise<ReturnType<typeof awardXP>> {
  return awardXP(athleteId, XP_REWARDS.RECEIVE_INVITATION, "invitation_received");
}
