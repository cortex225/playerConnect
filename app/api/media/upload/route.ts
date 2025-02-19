import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    // Ici, vous devrez implémenter la logique pour uploader le fichier vers un service de stockage
    // comme Supabase Storage ou AWS S3
    // Pour cet exemple, nous utiliserons une URL factice
    const fileUrl = "/placeholder.mp4"; // À remplacer par l'URL réelle après upload

    // Récupérer l'athleteId associé à l'utilisateur
    const athlete = await prisma.athlete.findUnique({
      where: {
        userId: session.user.id
      }
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Profil athlète non trouvé" },
        { status: 404 }
      );
    }

    // Créer l'entrée média dans la base de données
    const media = await prisma.media.create({
      data: {
        title,
        description,
        url: fileUrl,
        type: "video", // ou détecter automatiquement depuis le type du fichier
        athleteId: athlete.id
      }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Erreur lors de l'upload du média:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du média" },
      { status: 500 }
    );
  }
}
