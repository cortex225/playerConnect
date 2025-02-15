"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaForm } from "@/components/forms/media-form";

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
}

const mediaItems = [
  { id: 1, title: "Match Highlights vs Eagles", thumbnail: "/placeholder.jpg" },
  { id: 2, title: "Training Session #12", thumbnail: "/placeholder.jpg" },
  { id: 3, title: "Best Goals Compilation", thumbnail: "/placeholder.jpg" },
  { id: 4, title: "Skills Showcase 2024", thumbnail: "/placeholder.jpg" },
  { id: 5, title: "Team Practice Highlights", thumbnail: "/placeholder.jpg" },
  { id: 6, title: "Season Recap 2023", thumbnail: "/placeholder.jpg" },
  { id: 7, title: "Match Highlights vs Eagles", thumbnail: "/placeholder.jpg" },
  { id: 8, title: "Training Session #12", thumbnail: "/placeholder.jpg" },
  { id: 9, title: "Best Goals Compilation", thumbnail: "/placeholder.jpg" },
];

export default function MediaCarousel() {
  const mediaCarouselRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [medias, setMedias] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedias = async () => {
    try {
      const response = await fetch('/api/media');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des médias');
      }
      const data = await response.json();
      // S'assurer que data est un tableau
      setMedias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des médias:", error);
      setMedias([]); // En cas d'erreur, définir un tableau vide
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedias();
  }, []);

  const scroll = (direction: number, ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction * 300, behavior: "smooth" });
    }
  };

  const handleVideoClick = (media: Media) => {
    setSelectedMedia(media);
    setIsVideoDialogOpen(true);
  };

  return (
    <>
      <Card className="col-span-3 h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Media/Highlight
            <Button onClick={() => setIsDialogOpen(true)}>Add Media +</Button>
          </CardTitle>
          <CardDescription className="text-sm">
            Your recent videos and highlights
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <p>Chargement des médias...</p>
            </div>
          ) : medias.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p>Aucun média disponible. Ajoutez votre premier média !</p>
            </div>
          ) : (
            <div className="overflow-hidden" ref={mediaCarouselRef}>
              <div className="flex space-x-4">
                {medias.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleVideoClick(media)}
                    className="group relative aspect-video w-80 flex-none cursor-pointer overflow-hidden rounded-lg bg-muted"
                  >
                    {/* Thumbnail */}
                    <div className="absolute inset-0">
                      <Image
                        src={`https://image.mux.com/${media.url}/thumbnail.jpg`}
                        alt={media.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Overlay avec icône play */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-12 rounded-full"
                      >
                        <Play className="size-6" />
                      </Button>
                    </div>

                    {/* Titre */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <h3 className="text-sm font-semibold text-white">
                        {media.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2"
            onClick={() => scroll(-1, mediaCarouselRef)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => scroll(1, mediaCarouselRef)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau média</DialogTitle>
          </DialogHeader>
          <MediaForm onSuccess={() => {
            setIsDialogOpen(false);
            fetchMedias();
          }} />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isVideoDialogOpen} 
        onOpenChange={setIsVideoDialogOpen}
      >
        <DialogContent className="sm:max-w-[80vw] sm:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.title}</DialogTitle>
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
