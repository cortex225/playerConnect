"use server"

import { revalidatePath } from "next/cache"
import { Gender, DominantHand, DominantFoot, ProgramType } from "@prisma/client"

import { prisma } from "@/lib/db"

export async function updateAthleteProfile(id: number, data: {
  gender?: Gender
  age?: number
  city?: string
  height?: number
  weight?: number
  dominantHand?: DominantHand
  dominantFoot?: DominantFoot
  programType?: ProgramType
}) {
  await prisma.athlete.update({
    where: { id },
    data
  })
  
  revalidatePath("/dashboard/settings")
  return { success: true }
} 