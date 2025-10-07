import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    console.log("Début de la requête GET /api/media");

    // Utiliser getCurrentUser() qui fonctionne avec Better Auth
    const user = await getCurrentUser();

    if (!user) {
      console.log(
        "Erreur d'authentification: Aucune session utilisateur trouvée",
      );
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log(`Session utilisateur trouvée: ${user.id}, rôle: ${user.role}`);

    // Vérifier si l'URL contient le paramètre 'all'
    const url = new URL(req.url);
    const getAllMedias = url.searchParams.get("all") === "true";
    console.log(`Paramètre 'all' détecté: ${getAllMedias}`);

    // Si le paramètre 'all' est présent et que l'utilisateur est un recruteur, récupérer tous les médias
    if (getAllMedias) {
      console.log("Tentative de récupération de tous les médias");

      // Vérifier si l'utilisateur est un recruteur
      try {
        console.log(`Vérification du rôle utilisateur: ${user.role}`);

        if (user.role === "RECRUITER") {
          // Récupérer tous les médias avec les informations de l'athlète
          console.log("Récupération de tous les médias pour le recruteur");
          const allMedias = await prisma.media.findMany({
            include: {
              athlete: {
                include: {
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          console.log(`${allMedias.length} médias récupérés avec succès`);
          return NextResponse.json(allMedias);
        } else {
          console.log(
            `L'utilisateur n'est pas un recruteur (rôle: ${user.role}), accès refusé`,
          );
          return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du recruteur:", error);
        return NextResponse.json(
          { error: "Erreur lors de la vérification des permissions" },
          { status: 500 },
        );
      }
    }

    // Comportement par défaut: récupérer les médias de l'athlète connecté
    console.log("Récupération des médias pour l'athlète connecté");
    try {
      const athlete = await prisma.athlete.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!athlete) {
        console.log("Profil athlète non trouvé pour l'utilisateur");
        return NextResponse.json(
          { error: "Profil athlète non trouvé" },
          { status: 404 },
        );
      }

      console.log(
        `Athlète trouvé avec ID: ${athlete.id}, récupération des médias`,
      );
      const medias = await prisma.media.findMany({
        where: {
          athleteId: athlete.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`${medias.length} médias récupérés pour l'athlète`);
      return NextResponse.json(medias);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des médias de l'athlète:",
        error,
      );
      return NextResponse.json(
        { error: "Erreur lors de la récupération des médias de l'athlète" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Erreur générale lors de la récupération des médias:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des médias" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("Début de la requête POST /api/media");

    // Utiliser getCurrentUser() qui fonctionne avec Better Auth
    const user = await getCurrentUser();

    if (!user) {
      console.log(
        "Erreur d'authentification: Aucune session utilisateur trouvée",
      );
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log(`Session utilisateur trouvée: ${user.id}`);
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    if (!file) {
      console.log("Erreur: Fichier manquant dans la requête");
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    // Récupérer l'athleteId associé à l'utilisateur
    console.log("Recherche du profil athlète pour l'utilisateur");
    try {
      const athlete = await prisma.athlete.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!athlete) {
        console.log("Profil athlète non trouvé pour l'utilisateur");
        return NextResponse.json(
          { error: "Profil athlète non trouvé" },
          { status: 404 },
        );
      }

      console.log(
        `Athlète trouvé avec ID: ${athlete.id}, préparation de l'upload`,
      );

      // Utiliser l'ID de l'utilisateur pour le dossier
      const buffer = await file.arrayBuffer();

      // Nettoyer le nom du fichier :
      // - Remplacer les espaces par des tirets
      // - Supprimer les caractères spéciaux
      // - Garder seulement les lettres, chiffres, tirets et points
      const cleanFileName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
        .replace(/[^\w\s.-]/g, "") // Garder seulement alphanumérique, espaces, tirets et points
        .replace(/\s+/g, "-") // Remplacer espaces par tirets
        .toLowerCase();

      const fileName = `${user.id}/${Date.now()}-${cleanFileName}`;

      console.log(`Tentative d'upload vers Supabase Storage: ${fileName}`);
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
          { status: 500 },
        );
      }

      // Construire l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(fileName);

      console.log(`Fichier uploadé avec succès, URL: ${publicUrl}`);
      console.log("Création de l'entrée média dans la base de données");

      // Créer l'entrée média dans la base de données
      const media = await prisma.media.create({
        data: {
          title,
          description,
          url: publicUrl,
          type: file.type.startsWith("video/") ? "video" : "image",
          athleteId: athlete.id,
        },
      });

      console.log(`Média créé avec succès, ID: ${media.id}`);
      return NextResponse.json(media);
    } catch (error) {
      console.error("Erreur lors de la création du média:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du média" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Erreur générale lors de l'upload du média:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du média" },
      { status: 500 },
    );
  }
}
