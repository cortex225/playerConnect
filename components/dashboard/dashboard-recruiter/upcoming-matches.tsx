"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarCheck,
  MapPin,
  RefreshCw,
  Timer,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

// Type pour les matchs
type Match = {
  id: string;
  title: string;
  eventDate: string;
  endDate: string | null;
  location: string;
  description: string | null;
  isPublic: boolean;
  athleteId?: number;
};

function UpcomingMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestingAttendance, setRequestingAttendance] = useState<{
    [key: string]: boolean;
  }>({});

  // Fonction pour récupérer les matchs via l'API
  const fetchMatches = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Récupérer les matchs autorisés
      const response = await fetch("/api/matches/authorized");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des matchs");
      }

      const data = await response.json();
      setMatches(data);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les matchs");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fonction pour demander à assister à un match
  const requestToAttend = async (matchId: string, athleteId: number) => {
    try {
      console.log("Demande d'assistance au match:", { matchId, athleteId });
      setRequestingAttendance((prev) => ({ ...prev, [matchId]: true }));

      // Convertir l'ID du match en nombre
      const eventIdNumber = parseInt(matchId);
      console.log("Paramètres de la requête:", {
        eventId: eventIdNumber,
        athleteId,
      });

      const response = await fetch("/api/matches/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventIdNumber,
          athleteId: athleteId,
        }),
      });

      console.log("Statut de la réponse:", response.status);
      const responseData = await response.json();
      console.log("Données de la réponse:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Erreur lors de la demande");
      }

      toast.success(
        "Demande envoyée avec succès! L'athlète doit maintenant l'accepter.",
      );
    } catch (err) {
      console.error("Erreur lors de la demande:", err);
      toast.error("Impossible d'envoyer la demande. Veuillez réessayer.");
    } finally {
      setRequestingAttendance((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Fonction pour extraire les équipes du titre
  const extractTeams = (title: string) => {
    // Si le titre contient "vs", on extrait les équipes
    if (title.includes("vs")) {
      return title.replace("Match: ", "").trim();
    }
    return title;
  };

  // Fonction pour extraire le lieu du match
  const extractVenue = (location: string) => {
    // Si le lieu contient une virgule, on prend la première partie (gymnase)
    if (location.includes(",")) {
      return location.split(",")[0].trim();
    }
    return location;
  };

  // Fonction pour extraire la ville du match
  const extractCity = (location: string) => {
    // Si le lieu contient une virgule, on prend la deuxième partie (ville)
    if (location.includes(",")) {
      return location.split(",")[1].trim();
    }
    return "";
  };

  // État de chargement
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matchs publics à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel>
            <CarouselContent>
              {[1, 2, 3].map((i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <Card>
                    <CardContent className="p-4">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="mb-4 h-6 w-48" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Matchs publics à venir
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMatches(true)}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Actualisation..." : "Actualiser"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => fetchMatches()}>
              Réessayer
            </Button>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground">
              Aucun match public à venir pour le moment
            </p>
          </div>
        ) : (
          <Carousel>
            <CarouselContent>
              {matches.map((match) => (
                <CarouselItem
                  key={match.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">
                        {format(new Date(match.eventDate), "EEEE d MMMM", {
                          locale: fr,
                        })}
                      </div>
                      <h3 className="mb-4 text-lg font-bold">
                        {extractTeams(match.title)}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Timer className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(match.eventDate), "HH:mm", {
                              locale: fr,
                            })}
                            {match.endDate &&
                              ` - ${format(new Date(match.endDate), "HH:mm", { locale: fr })}`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{extractVenue(match.location)}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{extractCity(match.location)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          requestToAttend(match.id, match.athleteId || 0)
                        }
                        disabled={requestingAttendance[match.id]}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {requestingAttendance[match.id]
                          ? "Envoi en cours..."
                          : "Demander à assister"}
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}

export default UpcomingMatches;
