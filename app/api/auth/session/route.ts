import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";

/**
 * API endpoint pour récupérer la session utilisateur complète
 * Utilisé par le hook useSession côté client
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[Session API] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
