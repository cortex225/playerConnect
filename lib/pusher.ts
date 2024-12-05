// lib/pusher.ts
import PusherServer from "pusher";
import PusherClient from "pusher-js";

let pusherServer: PusherServer | undefined;
let pusherClient: PusherClient | undefined;

if (process.env.NEXT_PUBLIC_PUSHER_APP_ID && 
    process.env.NEXT_PUBLIC_PUSHER_KEY && 
    process.env.NEXT_PUBLIC_PUSHER_SECRET && 
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  pusherServer = new PusherServer({
    appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.NEXT_PUBLIC_PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });

  pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  });
}

export { pusherServer, pusherClient };
