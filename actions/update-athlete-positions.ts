"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateAthletePositions(athleteId: number, positionIds: string[]) {
  try {
    // First, remove all existing positions
    await prisma.athletePosition.deleteMany({
      where: {
        athleteId: athleteId,
      },
    });

    // Then create new positions
    await prisma.athletePosition.createMany({
      data: positionIds.map((positionId) => ({
        athleteId: athleteId,
        positionId: positionId,
      })),
    });

    revalidatePath("/dashboard/athlete");
    return { success: true };
  } catch (error) {
    console.error("Error updating athlete positions:", error);
    return { success: false, error: "Failed to update positions" };
  }
}
