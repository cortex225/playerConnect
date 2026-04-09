import React from "react";

import { getServerSession } from "@/lib/server/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ConnectedRecruiter() {
  const session = await getServerSession();

  return (
    <>
      <div className="flex items-center space-x-4">
        <Avatar className="size-16 shrink-0">
          <AvatarImage
            src={session?.image || ""}
            alt={session?.name || ""}
          />
          <AvatarFallback>
            {session?.name
              ? session.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-urban text-xl font-bold text-transparent">
            {session?.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            Recruteur
          </p>
        </div>
      </div>
    </>
  );
}
