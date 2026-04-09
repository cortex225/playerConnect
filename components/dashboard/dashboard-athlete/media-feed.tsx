"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Loader2, MessageCircle, Play, Send, Share2, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getSportIcon } from "@/lib/sport-icons";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface FeedItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  athlete: {
    id: number;
    userId: string;
    name: string | null;
    image: string | null;
    sport: string | null;
    category: string | null;
  };
}

export function MediaFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch feed
  const fetchFeed = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/feed?page=${pageNum}&limit=6`);
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();

      if (pageNum === 1) {
        setFeed(data.feed);
      } else {
        setFeed((prev) => [...prev, ...data.feed]);
      }
      setHasMore(data.hasMore);
    } catch {
      if (pageNum === 1) setFeed([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(nextPage);
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchFeed]);

  // Share
  const handleShare = (item: FeedItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Regarde ce highlight de ${item.athlete.name} sur PlayerConnect`,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast.success("Lien copie", { duration: 1500 });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border">
            <Skeleton className="aspect-[9/12] w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-8 text-center">
        <Play className="mx-auto size-10 text-muted-foreground/40" />
        <p className="mt-3 font-urban text-lg font-semibold">Aucun contenu</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les highlights des autres athletes apparaitront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feed.map((item) => (
        <FeedCard
          key={item.id}
          item={item}
          onShare={() => handleShare(item)}
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {loadingMore && (
          <div className="flex justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!hasMore && feed.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Tu as tout vu! Reviens plus tard pour du nouveau contenu
          </p>
        )}
      </div>
    </div>
  );
}

// Individual feed card
function FeedCard({
  item,
  onShare,
}: {
  item: FeedItem;
  onShare: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [commentCount, setCommentCount] = useState(item.commentCount);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => wasLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch("/api/social/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id }),
      });
      if (!res.ok) {
        setLiked(wasLiked);
        setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
    }
  };

  // Open comments panel
  const openComments = async () => {
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/social/comments?mediaId=${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  };

  // Send comment
  const sendComment = async () => {
    if (!newComment.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      const res = await fetch("/api/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id, content: newComment.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.blocked) {
          toast.error(data.error);
        } else {
          toast.error("Impossible d'envoyer le commentaire");
        }
        return;
      }
      const comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      setCommentCount((c) => c + 1);
      setNewComment("");
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSendingComment(false);
    }
  };

  // Auto-play when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const initials = item.athlete.name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "A";

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-2xl border bg-black"
    >
      {/* Video */}
      <div className="relative aspect-[9/14] w-full cursor-pointer md:aspect-video" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={item.url}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />

        {/* Play/Pause overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="size-8 text-white" />
            </div>
          </div>
        )}

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
        >
          {isMuted ? (
            <VolumeX className="size-4 text-white" />
          ) : (
            <Volume2 className="size-4 text-white" />
          )}
        </button>
      </div>

      {/* Micro-actions sidebar (TikTok-style, right side) on mobile */}
      <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 md:hidden">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={cn(
            "flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all",
            liked && "bg-red-500/80"
          )}>
            <Heart className={cn("size-5 text-white", liked && "fill-white")} />
          </div>
          <span className="text-[10px] font-medium text-white">{likeCount}</span>
        </button>
        <button onClick={openComments} className="flex flex-col items-center gap-1">
          <div className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <MessageCircle className="size-5 text-white" />
          </div>
          <span className="text-[10px] font-medium text-white">{commentCount}</span>
        </button>
        <button
          onClick={onShare}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Share2 className="size-5 text-white" />
          </div>
        </button>
      </div>

      {/* Bottom info overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <div className="flex items-end justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 border-2 border-white/30">
                <AvatarImage src={item.athlete.image || ""} />
                <AvatarFallback className="bg-primary text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">
                  {item.athlete.name}
                </p>
                <div className="flex items-center gap-1">
                  {item.athlete.sport && (
                    <span className="text-xs text-white/70">
                      {getSportIcon(item.athlete.sport)} {item.athlete.sport}
                    </span>
                  )}
                  {item.athlete.category && (
                    <span className="text-xs text-white/50">
                      · {item.athlete.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-white/90">
              {item.title}
            </p>
          </div>

          {/* Desktop actions */}
          <div className="ml-4 hidden flex-col items-center gap-2 md:flex">
            <button
              onClick={handleLike}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-all",
                liked ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
              )}
            >
              <Heart className={cn("size-4", liked && "fill-white")} />
            </button>
            <span className="text-[10px] font-medium text-white">{likeCount}</span>
            <button
              onClick={openComments}
              className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <MessageCircle className="size-4" />
            </button>
            <span className="text-[10px] font-medium text-white">{commentCount}</span>
            <button
              onClick={onShare}
              className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== COMMENTS PANEL ===== */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[60%] flex-col rounded-t-2xl bg-background/95 backdrop-blur-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-urban text-sm font-bold">
              Commentaires ({commentCount})
            </h3>
            <button
              onClick={() => setShowComments(false)}
              className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingComments ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun commentaire. Sois le premier !
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="size-7 shrink-0">
                      <AvatarImage src={comment.user.image || ""} />
                      <AvatarFallback className="text-[10px]">
                        {comment.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs">
                        <span className="font-semibold">{comment.user.name}</span>{" "}
                        <span className="text-muted-foreground">{comment.content}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendComment();
                  }
                }}
                placeholder="Ajouter un commentaire..."
                className="flex-1 rounded-full border-0 bg-muted/50 text-sm"
                disabled={sendingComment}
              />
              <button
                onClick={sendComment}
                disabled={!newComment.trim() || sendingComment}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-all",
                  newComment.trim()
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {sendingComment ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
