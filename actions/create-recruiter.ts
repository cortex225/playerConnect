"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { RecruiterFormValues } from "@/lib/validations/recruiter";

export async function createRecruiter(data: RecruiterFormValues) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      throw new Error("Non autorisé");
    }

    // Vérifier si un recruteur existe déjà pour cet utilisateur
    const existingRecruiter = await prisma.recruiter.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (existingRecruiter) {
      // Revalider et rediriger vers le dashboard si le profil existe déjà
      revalidatePath("/dashboard");
      redirect("/dashboard");
      return { success: true, data: existingRecruiter };
    }

    // Créer un nouveau recruteur
    const recruiter = await prisma.recruiter.create({
      data: {
        userId: user.id, // Liaison avec l'utilisateur actuel
        organization: data.organization,
        position: data.position,
        region: data.region,
        experience: data.experience,
      },
    });

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "RECRUITER" },
    });

    // Revalider le cache pour /dashboard
    revalidatePath("/dashboard");
    redirect("/dashboard");
    return { success: true, data: recruiter };
  } catch (error) {
    console.error("Erreur création recruteur:", error);
    return { success: false, error: "Erreur lors de la création du recruteur" };
  }
}
