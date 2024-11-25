"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MediaCarousel() {
  const mediaCarouselRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Media/Highlight
            <Button variant="outline">Add Media +</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="overflow-hidden" ref={mediaCarouselRef}>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5,6,7,8,9].map((item) => (
                <div
                  key={item}
                  className="flex h-36 w-64 flex-none items-center justify-center rounded-lg bg-muted"
                >
                  <Video className="size-12 text-muted-foreground" />
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
