import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

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

    const medias = await prisma.media.findMany({
      where: {
        athleteId: athlete.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(medias);
  } catch (error) {
    console.error("Erreur lors de la récupération des médias:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des médias" },
      { status: 500 }
    );
  }
}

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

    if (!file) {
      return NextResponse.json(
        { error: "Fichier manquant" },
        { status: 400 }
      );
    }

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

    // Utiliser l'ID de l'utilisateur pour le dossier
    const buffer = await file.arrayBuffer();
    const fileName = `${session.user.id}/${Date.now()}-${file.name}`;

    // Upload vers Supabase Storage avec le bon bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erreur Supabase Storage:", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'upload: " + uploadError.message },
        { status: 500 }
      );
    }

    // Construire l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(fileName);

    // Créer l'entrée média dans la base de données
    const media = await prisma.media.create({
      data: {
        title,
        description,
        url: publicUrl,
        type: file.type.startsWith("video/") ? "video" : "image",
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