"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db"

export async function updateRecruiterProfile(id: number, data: {
  organization?: string
  position?: string
  region?: string
  experience?: number
}) {
  await prisma.recruiter.update({
    where: { id },
    data
  })
  
  revalidatePath("/dashboard/settings")
  return { success: true }
} 