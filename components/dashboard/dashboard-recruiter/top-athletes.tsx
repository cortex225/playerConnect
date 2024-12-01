"use client";

import React, { useEffect, useState } from "react";
import { getTopAthletes } from "@/actions/get-athlete";
import { Athlete } from "@/types";
import { Star } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TopAthlete = Awaited<ReturnType<typeof getTopAthletes>>[number];

export const TopAthletes = () => {
  const [athletes, setAthletes] = useState<TopAthlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const data = await getTopAthletes();
        setAthletes(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des athlètes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  if (loading) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top Athletes</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Top Athletes</CardTitle>
        <CardDescription>
          Top performing athletes based on their best scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {athletes.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center justify-between space-x-4 p-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage 
                    src={athlete.user?.image || undefined} 
                    alt={athlete.user?.name || "Athlete"} 
                  />
                  <AvatarFallback>
                    {athlete.user?.name
                      ? athlete.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                      : "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {athlete.user?.name || "Unknown Athlete"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {athlete.sport?.name || "No Sport"} - {athlete.category?.name || "No Category"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {athlete.performances && athlete.performances.length > 0 && (
                  <>
                    <Star className="size-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {athlete.performances[0].score.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
