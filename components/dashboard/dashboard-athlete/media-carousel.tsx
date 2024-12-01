"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  const scroll = (direction: number, ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction * 300, behavior: "smooth" });
    }
  };

  return (
    <>
      <Card className="col-span-3 h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Media/Highlight
            <Button >Add Media +</Button>
          </CardTitle>
          <CardDescription className="text-sm">
            Your recent videos and highlights
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="overflow-hidden" ref={mediaCarouselRef}>
            <div className="flex space-x-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-video w-80 flex-none cursor-pointer overflow-hidden rounded-lg bg-muted"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="size-12 text-muted-foreground group-hover:hidden" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="icon" variant="secondary" className="size-12 rounded-full">
                      <Play className="size-6" />
                    </Button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
    </>
  );
}
