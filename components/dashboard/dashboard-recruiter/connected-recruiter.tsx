import React from "react";

import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ConnectedRecruiter() {
  const session = await auth();

  return (
    <>
      <div className="flex items-center space-x-4">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src="/placeholder.svg?height=40&width=40"
            alt="Sarah Thompson"
          />
          <AvatarFallback>
            {session?.user?.name
              ? session.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold dark:text-white">
            {session?.user?.name}
          </h1>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            NCAA Division I Scout
          </p>
        </div>
      </div>
    </>
  );
}
