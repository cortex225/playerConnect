import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function UpcomingMatches() {
  // Fake data for matches
  const matches = [
    {
      id: 1,
      type: "Today's Match",
      teams: "Team A vs Team B",
      time: "14:00",
      sport: "Basketball",
      venue: "Sports Arena 1",
    },
    {
      id: 2,
      type: "Today's Match",
      teams: "Team C vs Team D",
      time: "16:30",
      sport: "Soccer",
      venue: "City Stadium",
    },
    {
      id: 3,
      type: "Upcoming Match",
      teams: "Team E vs Team F",
      date: "2024-03-20",
      time: "15:00",
      sport: "Tennis",
      venue: "Tennis Complex",
    },
    {
      id: 4,
      type: "Upcoming Match",
      teams: "Team G vs Team H",
      date: "2024-03-22",
      time: "18:00",
      sport: "Basketball",
      venue: "University Gym",
    },
    {
      id: 5,
      type: "Upcoming Match",
      teams: "Team I vs Team J",
      date: "2024-03-25",
      time: "13:00",
      sport: "Swimming",
      venue: "Aquatic Center",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Matches</CardTitle>
        </CardHeader>
        <CardContent className={""}>
          <Carousel className="mx-auto w-full max-w-xl">
            <CarouselContent>
              {matches.map((match) => (
                <CarouselItem key={match.id}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <h3 className="mb-2 text-lg font-semibold">
                        {match.teams}
                      </h3>
                      <p className="mb-1 text-sm text-gray-500">
                        {match.sport}
                      </p>
                      <p className="mb-1 text-sm font-medium">
                        {match.date || "Today"} at {match.time}
                      </p>
                      <p className="mb-2 text-xs text-gray-400">
                        {match.venue}
                      </p>
                      <Button size="sm" variant="outline">
                        Request to Attend
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>
    </>
  );
}

export default UpcomingMatches;
