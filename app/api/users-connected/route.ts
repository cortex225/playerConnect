// pages/api/users/connected.ts (suite)
import { NextResponse } from "next/server";

import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const { user } = await request.json();

    // Trigger l'événement de mise à jour des utilisateurs connectés
    await pusherServer.trigger("connected-users", "update", user);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error updating connected users" },
      { status: 500 }
    );
  }
}
