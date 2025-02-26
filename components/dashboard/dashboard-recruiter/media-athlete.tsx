"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";



import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";





// Définir l'interface pour le type Media
interface Media {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
  athleteId: number;
  createdAt: string;
  updatedAt: string;
  athlete?: {
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

export default function MediaAthlete() {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [medias, setMedias] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});

  // Fonction pour récupérer les médias via l'API avec retry
  const fetchMedias = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/media?all=true");

      if (!response.ok) {
        // Si la réponse est 401 (non autorisé), on peut retenter après un délai
        if (response.status === 401 && retryCount < 3) {
          console.log(
            `Tentative de récupération des médias échouée (${retryCount + 1}/3), nouvelle tentative dans 1s...`,
          );
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 1000);
          return;
        }

        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      setMedias(Array.isArray(data) ? data : []);
      setRetryCount(0); // Réinitialiser le compteur en cas de succès
    } catch (error) {
      console.error("Erreur lors du chargement des médias:", error);
      setError(
        "Impossible de charger les médias. Veuillez réessayer plus tard.",
      );
      setMedias([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedias();
  }, [retryCount]); // Relancer le fetch quand retryCount change

  // Fonction qui capture une miniature à partir de la vidéo
  const captureThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous"; // Assure-toi que le serveur permet le CORS
      video.currentTime = 2; // Capture à la 2e seconde

      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject("Impossible d'obtenir le contexte du canvas");
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL("image/jpeg");
        resolve(thumbnailUrl);
      });

      video.addEventListener("error", (err) => {
        reject(err);
      });
    });
  };

  // Génère les miniatures pour chaque média
  useEffect(() => {
    medias.forEach((media) => {
      if (!thumbnails[media.id]) {
        captureThumbnail(media.url)
          .then((thumb) => {
            setThumbnails((prev) => ({ ...prev, [media.id]: thumb }));
          })
          .catch((err) =>
            console.error(
              "Erreur lors de la capture de la miniature pour",
              media.url,
              err,
            ),
          );
      }
    });
  }, [medias]);

  // Ouvre le dialog pour la lecture vidéo
  const handleVideoClick = (media: Media) => {
    setSelectedMedia(media);
    setIsVideoDialogOpen(true);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    setRetryCount(0); // Réinitialiser pour déclencher un nouveau fetch
    fetchMedias();
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Médias des athlètes
          </CardTitle>
          <CardDescription className="text-sm">
            Vidéos et highlights récents des athlètes
          </CardDescription>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <CardContent className="pr-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg border bg-card shadow-sm"
                  >
                    <div className="flex items-center gap-3 border-b p-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-1 h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex h-48 flex-col items-center justify-center space-y-4">
                <p className="text-center text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={handleRetry}>
                  Réessayer
                </Button>
              </div>
            ) : medias.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center space-y-4">
                <p className="text-center text-muted-foreground">
                  Aucun média disponible.
                </p>
                <Button variant="outline" onClick={handleRetry}>
                  Actualiser
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {medias.map((media) => (
                  <div
                    key={media.id}
                    className="overflow-hidden rounded-lg border bg-card shadow-sm"
                  >
                    {/* En-tête avec info de l'athlète */}
                    {media.athlete && (
                      <div className="flex items-center gap-3 border-b p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={media.athlete.user.image || ""} />
                          <AvatarFallback>
                            {media.athlete.user.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
                            {media.athlete.user.name || "Athlète"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(media.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Miniature vidéo */}
                    <div
                      className="group relative aspect-video cursor-pointer"
                      onClick={() => handleVideoClick(media)}
                    >
                      <Image
                        src={thumbnails[media.id] || "/default-thumbnail.jpg"}
                        alt={media.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="items-center rounded-full"
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Titre et description */}
                    <div className="p-3">
                      <h3 className="text-base font-semibold">{media.title}</h3>
                      {media.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {media.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="sm:max-h-[80vh] sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>
              {selectedMedia?.title}
              {selectedMedia?.athlete && (
                <div className="mt-2 flex items-center text-sm font-normal">
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={selectedMedia.athlete.user.image || ""} />
                    <AvatarFallback>
                      {selectedMedia.athlete.user.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedMedia.athlete.user.name || "Athlète"}</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="aspect-video w-full">
              <video
                src={selectedMedia.url}
                controls
                className="h-full w-full rounded-lg"
                autoPlay
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}