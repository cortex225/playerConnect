"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SecureMessagerie } from "@/components/chat/secure-messagerie";

// Same Activity interface and logic as athlete version

interface Activity {
  id: string;
  type: string;
  mediaId: string | null;
  createdAt: string;
  isRead: boolean;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<"messages" | "activite">("messages");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/social/activity?unread=true")
      .then((r) => r.ok ? r.json() : { unreadCount: 0 })
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab !== "activite") return;
    setLoadingActivities(true);
    fetch("/api/social/activity")
      .then((r) => r.ok ? r.json() : { activities: [] })
      .then((data) => {
        setActivities(data.activities || []);
        setUnreadCount(0);
      })
      .catch(() => setActivities([]))
      .finally(() => setLoadingActivities(false));
  }, [activeTab]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "LIKE": return <Heart className="size-4 text-red-500" />;
      case "COMMENT": return <MessageSquare className="size-4 text-blue-500" />;
      case "FOLLOW": return <UserPlus className="size-4 text-primary" />;
      default: return <Bell className="size-4 text-muted-foreground" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "LIKE": return "a aime un contenu";
      case "COMMENT": return "a commente";
      case "FOLLOW": return "vous suit maintenant";
      default: return "a interagi";
    }
  };

  return (
    <div className="-mx-4 -mt-4 flex h-[calc(100vh-8rem)] flex-col md:mx-0 md:mt-0 md:h-[calc(100vh-12rem)]">
      <div className="flex border-b bg-background">
        <button
          onClick={() => setActiveTab("messages")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeTab === "messages"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          )}
        >
          <MessageCircle className="size-4" />
          Messages
        </button>
        <button
          onClick={() => setActiveTab("activite")}
          className={cn(
            "relative flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeTab === "activite"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          )}
        >
          <Bell className="size-4" />
          Activite
          {unreadCount > 0 && (
            <Badge className="absolute right-1/4 top-1 size-5 justify-center rounded-full border-0 bg-red-500 p-0 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "messages" ? (
          <SecureMessagerie />
        ) : (
          <div className="h-full overflow-y-auto">
            {loadingActivities ? (
              <div className="flex justify-center py-12">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10">
                  <Bell className="size-8 text-primary" />
                </div>
                <h3 className="mt-4 font-urban text-lg font-bold">Aucune activite</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Les notifications apparaitront ici
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      !activity.isRead && "bg-primary/5"
                    )}
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={activity.actor.image || ""} />
                      <AvatarFallback className="text-xs">
                        {activity.actor.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.actor.name}</span>{" "}
                        <span className="text-muted-foreground">{getActivityText(activity)}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
