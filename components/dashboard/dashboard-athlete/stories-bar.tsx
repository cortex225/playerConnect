"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Camera, ImageIcon, Loader2, Plus, Video, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getSportIcon } from "@/lib/sport-icons";

interface StoryGroup {
  userId: string;
  userName: string | null;
  userImage: string | null;
  sport?: string | null;
  isOwn: boolean;
  stories: {
    id: string;
    mediaUrl: string;
    type: string;
    caption: string | null;
    createdAt: string;
    viewed?: boolean;
    viewCount?: number;
  }[];
  allViewed: boolean;
}

export function StoriesBar() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.ok ? r.json() : [])
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  // Story viewer auto-advance
  useEffect(() => {
    if (!activeGroup) return;

    const story = activeGroup.stories[activeIndex];
    if (!story) return;

    // Mark as viewed
    fetch("/api/stories/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: story.id }),
    }).catch(() => {});

    // Auto-advance timer (5s for images, video duration for videos)
    const duration = story.type === "image" ? 5000 : 15000;
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          nextStory();
          return 0;
        }
        return p + (100 / (duration / 100));
      });
    }, 100);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [activeGroup, activeIndex]);

  const openStory = (group: StoryGroup) => {
    if (group.stories.length === 0) return; // No stories to show
    setActiveGroup(group);
    setActiveIndex(0);
    setProgress(0);
  };

  const nextStory = () => {
    if (!activeGroup) return;
    if (activeIndex < activeGroup.stories.length - 1) {
      setActiveIndex((i) => i + 1);
      setProgress(0);
    } else {
      closeViewer();
    }
  };

  const prevStory = () => {
    if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
      setProgress(0);
    }
  };

  const closeViewer = () => {
    setActiveGroup(null);
    setActiveIndex(0);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 50 Mo)");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Upload story
  const handleUploadStory = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      // Upload file via media API (reuse existing Supabase upload)
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", caption || "Story");
      formData.append("description", "Story");

      const uploadRes = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload echoue");
      const media = await uploadRes.json();

      // Create story with the uploaded media URL
      const storyRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: media.url,
          type: selectedFile.type.startsWith("video/") ? "video" : "image",
          caption: caption || null,
        }),
      });

      if (!storyRes.ok) throw new Error("Creation echouee");

      toast.success("Story publiee !");
      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");

      // Refresh stories
      const res = await fetch("/api/stories");
      if (res.ok) setGroups(await res.json());
    } catch {
      toast.error("Impossible de publier la story");
    } finally {
      setUploading(false);
    }
  };

  // Open upload or view own stories
  const handleOwnAvatarClick = (group: StoryGroup) => {
    if (group.stories.length > 0) {
      openStory(group);
    } else {
      setShowUpload(true);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden px-1 py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="size-16 animate-pulse rounded-full bg-muted" />
            <div className="h-2 w-10 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) return null;

  const currentStory = activeGroup?.stories[activeIndex];

  return (
    <>
      {/* Stories bar */}
      <div className="flex gap-3 overflow-x-auto px-1 py-2 [&::-webkit-scrollbar]:hidden">
        {groups.map((group) => (
          <div
            key={group.userId}
            onClick={() => group.isOwn ? handleOwnAvatarClick(group) : openStory(group)}
            role="button"
            tabIndex={0}
            className="flex shrink-0 cursor-pointer flex-col items-center gap-1"
          >
            <div
              className={cn(
                "relative rounded-full p-[2px]",
                group.isOwn && group.stories.length === 0
                  ? "bg-muted"
                  : group.allViewed
                    ? "bg-muted"
                    : "bg-gradient-to-r from-primary via-purple-600 to-pink-500"
              )}
            >
              <div className="rounded-full bg-background p-[2px]">
                <Avatar className="size-14">
                  <AvatarImage src={group.userImage || ""} />
                  <AvatarFallback className="text-xs">
                    {group.userName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              {group.isOwn && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowUpload(true); }}
                  className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600 text-white shadow-md ring-2 ring-background"
                >
                  <Plus className="size-3.5" />
                </button>
              )}
            </div>
            <span className="max-w-[60px] truncate text-[10px]">
              {group.isOwn ? "Toi" : group.userName?.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Full-screen story viewer */}
      {activeGroup && currentStory && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Progress bars */}
          <div className="absolute inset-x-0 top-0 z-10 flex gap-1 p-2">
            {activeGroup.stories.map((_, i) => (
              <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: i < activeIndex ? "100%" : i === activeIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute inset-x-0 top-4 z-10 flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 border border-white/30">
                <AvatarImage src={activeGroup.userImage || ""} />
                <AvatarFallback className="text-xs text-white">
                  {activeGroup.userName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">{activeGroup.userName}</p>
                {activeGroup.sport && (
                  <p className="text-xs text-white/60">
                    {getSportIcon(activeGroup.sport)} {activeGroup.sport}
                  </p>
                )}
              </div>
            </div>
            <button onClick={closeViewer} className="flex size-8 items-center justify-center rounded-full bg-white/20">
              <X className="size-5 text-white" />
            </button>
          </div>

          {/* Media */}
          {currentStory.type === "video" ? (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              muted
              className="size-full object-contain"
            />
          ) : (
            <Image
              src={currentStory.mediaUrl}
              alt=""
              fill
              className="object-contain"
            />
          )}

          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute inset-x-0 bottom-16 z-10 px-6">
              <p className="text-center text-sm text-white drop-shadow-lg">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Navigation tap zones */}
          <div className="absolute inset-0 z-[5] flex">
            <button className="w-1/3" onClick={prevStory} />
            <div className="w-1/3" />
            <button className="w-1/3" onClick={nextStory} />
          </div>
        </div>
      )}

      {/* Upload Story Sheet */}
      <Sheet open={showUpload} onOpenChange={(open) => {
        setShowUpload(open);
        if (!open) { setSelectedFile(null); setPreviewUrl(null); setCaption(""); }
      }}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-10">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2 text-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
                <Camera className="size-4 text-white" />
              </div>
              Ajouter une story
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {/* Camera input - opens phone camera directly */}
            <input
              id="story-camera-video"
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              id="story-camera-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">
                  Ta story sera visible pendant 24h
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Camera video */}
                  <button
                    onClick={() => document.getElementById("story-camera-video")?.click()}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary/50 active:scale-95"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
                      <Video className="size-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">Filmer</span>
                  </button>
                  {/* Camera photo */}
                  <button
                    onClick={() => document.getElementById("story-camera-photo")?.click()}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 p-4 transition-all hover:border-purple-500/50 active:scale-95"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500">
                      <Camera className="size-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">Photo</span>
                  </button>
                  {/* Gallery */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-4 transition-all hover:border-muted-foreground/40 active:scale-95"
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium">Galerie</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Preview */}
                <div className="relative mx-auto aspect-[9/16] max-h-[40vh] overflow-hidden rounded-2xl bg-black">
                  {selectedFile.type.startsWith("video/") ? (
                    <video
                      src={previewUrl || ""}
                      controls
                      playsInline
                      className="size-full object-contain"
                    />
                  ) : (
                    previewUrl && (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    )
                  )}
                </div>

                {/* Caption */}
                <div>
                  <Label className="text-xs">Legende (optionnel)</Label>
                  <Input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Ajoute une legende..."
                    className="mt-1 rounded-xl"
                    maxLength={100}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  >
                    Changer
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white"
                    onClick={handleUploadStory}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      "Publier la story"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
