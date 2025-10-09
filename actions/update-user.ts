"use server"

import { revalidatePath } from "next/cache"
import { hash } from "bcrypt"

import { prisma } from "@/lib/db"

export async function updateUserName(userId: string, { name }: { name: string }) {
  await prisma.user.update({
    where: { id: userId },
    data: { name }
  })
  revalidatePath("/dashboard/settings")
}

export async function updateUserEmail(userId: string, { email }: { email: string }) {
  await prisma.user.update({
    where: { id: userId },
    data: { email, emailVerified: false }
  })
  revalidatePath("/dashboard/settings")
}

export async function updateUserPassword(userId: string, { currentPassword, newPassword }: { 
  currentPassword: string
  newPassword: string
  confirmPassword: string 
}) {
  const hashedPassword = await hash(newPassword, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
  revalidatePath("/dashboard/settings")
} 