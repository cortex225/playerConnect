"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarCheck,
  Check,
  MapPin,
  RefreshCw,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Type pour les invitations
type Invitation = {
  id: number;
  eventId: number;
  recruiterId: number;
  status: string;
  sentAt: string;
  recruiterName: string;
  event: {
    id: number;
    title: string;
    eventDate: string;
    endDate: string | null;
    location: string;
    description: string | null;
  };
};

export default function MatchInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<{
    [key: number]: boolean;
  }>({});

  // Fonction pour récupérer les invitations via l'API
  const fetchInvitations = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Récupérer les invitations en attente
      const response = await fetch("/api/matches/invitations?status=PENDING");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des invitations");
      }

      const data = await response.json();
      setInvitations(data);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les invitations");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fonction pour répondre à une invitation
  const respondToInvitation = async (invitationId: number, status: string) => {
    try {
      setProcessingInvitation((prev) => ({ ...prev, [invitationId]: true }));

      const response = await fetch("/api/matches/invite", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la réponse à l'invitation",
        );
      }

      // Mettre à jour la liste des invitations
      setInvitations(invitations.filter((inv) => inv.id !== invitationId));

      toast.success(
        `Invitation ${status === "ACCEPTED" ? "acceptée" : "refusée"} avec succès!`,
      );
    } catch (err) {
      console.error("Erreur lors de la réponse à l'invitation:", err);
      toast.error("Impossible de traiter votre réponse. Veuillez réessayer.");
    } finally {
      setProcessingInvitation((prev) => ({ ...prev, [invitationId]: false }));
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

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
          <CardTitle>Demandes d'invitation aux matchs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-48" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Demandes d'invitation aux matchs
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInvitations(true)}
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
            <Button variant="outline" onClick={() => fetchInvitations()}>
              Réessayer
            </Button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground">
              Aucune demande d'invitation en attente
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="p-4">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    {format(
                      new Date(invitation.event.eventDate),
                      "EEEE d MMMM",
                      {
                        locale: fr,
                      },
                    )}
                  </div>
                  <h3 className="mb-4 text-lg font-bold">
                    {invitation.event.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Timer className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(invitation.event.eventDate), "HH:mm", {
                          locale: fr,
                        })}
                        {invitation.event.endDate &&
                          ` - ${format(new Date(invitation.event.endDate), "HH:mm", { locale: fr })}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{extractVenue(invitation.event.location)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{extractCity(invitation.event.location)}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className="font-medium">
                        Recruteur: {invitation.recruiterName}
                      </p>
                      <p className="text-muted-foreground">
                        Demande envoyée le{" "}
                        {format(new Date(invitation.sentAt), "d MMMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        respondToInvitation(invitation.id, "REJECTED")
                      }
                      disabled={processingInvitation[invitation.id]}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        respondToInvitation(invitation.id, "ACCEPTED")
                      }
                      disabled={processingInvitation[invitation.id]}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accepter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
