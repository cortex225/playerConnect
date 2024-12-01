// app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Lire le corps de la requête en tant que texte
  const bodyText = await request.text();

  // Parser les données encodées en URL
  const params = new URLSearchParams(bodyText);
  const socket_id = params.get("socket_id");
  const channel_name = params.get("channel_name");

  if (!socket_id || !channel_name) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  // Vérifier si l'utilisateur est autorisé à s'abonner au canal
  if (channel_name !== `private-chat-${session.user.id}`) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Générer la réponse d'authentification
  const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);

  return NextResponse.json(authResponse);
}
