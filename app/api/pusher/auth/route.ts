// app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/server/session";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!pusherServer) {
      return new NextResponse("Pusher not configured", { status: 500 });
    }

    const data = await request.text();
    const [socketId, channel] = data.split(":");

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: session.id,
      user_info: {
        name: session.name,
        email: session.email,
      },
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("[PUSHER_AUTH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
