import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/shell";
import { MediaFeed } from "@/components/dashboard/dashboard-athlete/media-feed";
import { StoriesBar } from "@/components/dashboard/dashboard-athlete/stories-bar";

export const metadata = constructMetadata({
  title: "Dashboard - Player Connect",
  description: "Ton espace athlete.",
});

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ATHLETE") redirect("/");

  try {
    return (
      <DashboardShell className="gap-0 pb-24 md:pb-6">
        {/* ========== STORIES ========== */}
        <section className="mt-2 px-4 md:px-0">
          <StoriesBar />
        </section>

        {/* ========== FEED HIGHLIGHTS ========== */}
        <section className="mt-4 px-4 md:px-0">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="size-5 text-orange-500" />
            <h2 className="font-urban text-lg font-bold">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Ton Feed
              </span>
            </h2>
          </div>
          <MediaFeed />
        </section>
      </DashboardShell>
    );
  } catch (error) {
    console.error("Erreur:", error);
    return (
      <DashboardShell>
        <Card className="mx-auto max-w-md rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Une erreur est survenue. Veuillez reessayer.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/athlete">Reessayer</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }
}
