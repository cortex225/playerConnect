"use server"

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function deleteMedia(mediaId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const athlete = await prisma.athlete.findUnique({
      where: { userId: user.id },
      include: { media: true },
    });

    if (!athlete) throw new Error("Athlète non trouvé");

    // Vérifier si le média appartient à l'athlète
    const mediaExists = athlete.media.some((m) => m.id === mediaId);
    if (!mediaExists) throw new Error("Média non trouvé");

    // Supprimer le média
    await prisma.media.delete({
      where: { id: mediaId },
    });

    revalidatePath("/dashboard/athlete/media");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression du média" };
  }
} 