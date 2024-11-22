import React from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {auth} from "@/auth";

export default async function ConnectedRecruiter() {
    const session = await auth();

    return (
        <>

            <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Sarah Thompson"/>
                    <AvatarFallback>{session?.user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold dark:text-white truncate">{session?.user?.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        NCAA Division I Scout
                    </p>
                </div>
            </div>
        </>
    )
}


