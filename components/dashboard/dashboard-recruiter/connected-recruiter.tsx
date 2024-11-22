import React from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {auth} from "@/auth";
import {cookies} from "next/headers";

export default async function Connected() {
    const session = await auth();
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('user_role')?.value;
    const userRole = session?.user?.role as "ADMIN" | "ATHLETE" | "RECRUITER" | undefined;

    return (
        <>
            <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Sarah Thompson"/>
                    <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold dark:text-white truncate">Sarah Thompson</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        NCAA Division I Scout
                    </p>
                </div>
            </div>
        </>
    )
}


