"use client";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

const recruiters = [
  { 
    id: 1, 
    name: "Sarah Thompson", 
    role: "NCAA Division I Scout",
    organization: "University of California",
    experience: "8 years",
    rating: 4.8,
    location: "California, USA",
    avatar: "/placeholder.svg?height=40&width=40" 
  },
  { 
    id: 2, 
    name: "Michael Chen", 
    role: "Professional Scout",
    organization: "LA Galaxy",
    experience: "12 years",
    rating: 4.9,
    location: "Los Angeles, USA",
    avatar: "/placeholder.svg?height=40&width=40" 
  },
  { 
    id: 3, 
    name: "Emma Davis", 
    role: "College Recruiter",
    organization: "Stanford University",
    experience: "5 years",
    rating: 4.7,
    location: "Stanford, USA",
    avatar: "/placeholder.svg?height=40&width=40" 
  },
  { 
    id: 4, 
    name: "James Wilson", 
    role: "Sports Director",
    organization: "Elite Sports Academy",
    experience: "15 years",
    rating: 5.0,
    location: "New York, USA",
    avatar: "/placeholder.svg?height=40&width=40" 
  },
  { 
    id: 5, 
    name: "Lisa Anderson", 
    role: "Youth Scout",
    organization: "US Soccer Federation",
    experience: "7 years",
    rating: 4.6,
    location: "Chicago, USA",
    avatar: "/placeholder.svg?height=40&width=40" 
  },
];

export const TopRecruiters = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Recruiters</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="mx-4 sm:mx-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {recruiters.map((recruiter) => (
                <CarouselItem key={recruiter.id} className="basis-full pl-2 sm:basis-1/2 md:pl-4 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                            {recruiter.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold">{recruiter.name}</h3>
                            <p className="truncate text-sm text-muted-foreground">{recruiter.role}</p>
                            <p className="truncate text-sm text-muted-foreground">{recruiter.organization}</p>
                            <div className="mt-1 flex items-center">
                              <Star className="mr-1 size-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{recruiter.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground">Experience:</span>
                            <span className="ml-2 truncate">{recruiter.experience}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="ml-2 truncate">{recruiter.location}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <Button variant="secondary" className="w-full">
                            View Profile
                          </Button>
                          <Button className="w-full">
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <CarouselPrevious className="relative hidden sm:flex" />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <CarouselNext className="relative hidden sm:flex" />
            </div>
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
};
