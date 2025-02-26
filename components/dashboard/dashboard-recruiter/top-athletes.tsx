"use client";

import React, { useEffect, useState } from "react";
import { getTopAthletes } from "@/actions/get-athlete";
import { Athlete } from "@/types";
import { Star } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";



import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";





type TopAthlete = Awaited<ReturnType<typeof getTopAthletes>>[number];

export const TopAthletes = () => {
  const [athletes, setAthletes] = useState<TopAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    setRetryCount(0); // Réinitialiser pour déclencher un nouveau fetch
    fetchAthletes(); // Appeler directement la fonction de chargement
  };

  // Fonction pour charger les athlètes
  const fetchAthletes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTopAthletes();
      setAthletes(data);
      setRetryCount(0); // Réinitialiser le compteur en cas de succès
    } catch (error) {
      console.error("Erreur lors de la récupération des athlètes:", error);

      // Si nous n'avons pas encore atteint le nombre maximum de tentatives
      if (retryCount < 3) {
        console.log(
          `Tentative de récupération des athlètes échouée (${retryCount + 1}/3), nouvelle tentative dans 1s...`,
        );
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 1000);
      } else {
        setError(
          "Impossible de charger les athlètes. Veuillez réessayer plus tard.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [retryCount]); // Relancer le fetch quand retryCount change

  if (loading) {
    return (
      <Card className="h-[45vh] md:col-span-2">
        <CardHeader>
          <CardTitle>Top Athletes</CardTitle>
          <CardDescription>
            Chargement des meilleurs athlètes...
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between space-x-4 p-4"
              >
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[45vh] md:col-span-2">
        <CardHeader>
          <CardTitle>Top Athletes</CardTitle>
          <CardDescription>Une erreur est survenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[30vh] flex-col items-center justify-center space-y-4">
            <p className="text-center text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={handleRetry}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si aucun athlète n'est trouvé, afficher un message et un bouton pour réessayer
  if (athletes.length === 0 && !loading) {
    return (
      <Card className="h-[45vh] md:col-span-2">
        <CardHeader>
          <CardTitle>Top Athletes</CardTitle>
          <CardDescription>Aucun athlète trouvé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[30vh] flex-col items-center justify-center space-y-4">
            <p className="text-center text-muted-foreground">
              Aucun athlète avec des performances n'a été trouvé.
            </p>
            <Button variant="outline" onClick={handleRetry}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[45vh] md:col-span-2">
      <CardHeader>
        <CardTitle>Top Athletes</CardTitle>
        <CardDescription>
          Top performing athletes based on their best scores
        </CardDescription>
      </CardHeader>
      <ScrollArea className="h-[30vh]">
        <CardContent>
          <div className="space-y-3">
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
                      {athlete.sport?.name || "No Sport"} -{" "}
                      {athlete.category?.name || "No Category"}
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
      </ScrollArea>
    </Card>
  );
};