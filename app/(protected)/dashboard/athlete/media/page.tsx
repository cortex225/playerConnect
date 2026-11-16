import { redirect } from "next/navigation";
import { Eye, Heart, MessageCircle, Play } from "lucide-react";

import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/server/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata = constructMetadata({
  title: "Mes médias - PlayerConnect",
  description: "Tes photos et vidéos de match, avec leurs vues et réactions.",
});

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("fr-CA", {
  day: "numeric",
  month: "short",
});

export default async function MediaPage() {
  const session = await getServerSession();
  if (!session) redirect("/auth/login");

  const athlete = await prisma.athlete.findUnique({
    where: { userId: session.id },
    include: {
      media: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { likes: true, views: true, comments: true } } },
      },
    },
  });
  if (!athlete) redirect("/onboarding");

  const totalViews = athlete.media.reduce((sum, m) => sum + m._count.views, 0);

  return (
    <DashboardShell className="px-4 pb-24 pt-2 md:px-0 md:pb-10">
      <header className="border-b pb-6">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">Mes médias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {athlete.media.length} média{athlete.media.length > 1 ? "s" : ""} ·{" "}
          {totalViews.toLocaleString("fr-CA")} vues au total
        </p>
      </header>

      {athlete.media.length === 0 ? (
        <div className="mx-auto max-w-sm py-16 text-center">
          <p className="font-semibold">Aucun média pour l&apos;instant</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Touche le bouton + en bas de l&apos;écran pour ajouter une photo ou
            une courte vidéo de match.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {athlete.media.map((media) => (
            <li key={media.id}>
              <div className="relative overflow-hidden rounded-xl bg-muted">
                {media.type === "video" ? (
                  <>
                    <video
                      src={media.url}
                      className="aspect-[4/5] w-full object-cover"
                      muted
                      preload="metadata"
                      aria-label={media.title}
                    />
                    <Play
                      className="absolute left-2 top-2 size-5 fill-white text-white"
                      aria-hidden
                    />
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.url}
                    alt={media.title}
                    className="aspect-[4/5] w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-semibold">{media.title}</p>
              <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" aria-hidden />
                  <span className="tabular">{media._count.views}</span>
                  <span className="sr-only">vues</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="size-3.5" aria-hidden />
                  <span className="tabular">{media._count.likes}</span>
                  <span className="sr-only">j&apos;aime</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="size-3.5" aria-hidden />
                  <span className="tabular">{media._count.comments}</span>
                  <span className="sr-only">commentaires</span>
                </span>
                <span className="ml-auto">{dateFormat.format(media.createdAt)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
