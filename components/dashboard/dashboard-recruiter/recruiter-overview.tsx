import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { prisma } from "@/lib/db";
import { positionLabel, sportLabel } from "@/lib/sport-labels";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const dateFormat = new Intl.DateTimeFormat("fr-CA", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("fr-CA", {
  hour: "2-digit",
  minute: "2-digit",
});
const number = (value: number) =>
  value.toLocaleString("fr-CA", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

async function getOverview(userId: string) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId },
    include: { user: { select: { name: true, image: true } } },
  });
  if (!recruiter) return null;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followedIds = follows.map((f) => f.followingId);

  const upcomingWhere = {
    recruiterId: recruiter.id,
    status: "ACCEPTED",
    event: { eventDate: { gte: new Date() } },
  };

  const [shortlist, matches, matchCount, unread, newProfiles, media] =
    await Promise.all([
    prisma.athlete.findMany({
      where: { userId: { in: followedIds } },
      orderBy: { totalScore: "desc" },
      take: 8,
      include: {
        user: { select: { name: true } },
        sport: true,
        positions: { include: { position: true }, take: 1 },
        rankings: { where: { scope: "GLOBAL", period: "all-time" }, take: 1 },
        performances: {
          orderBy: { date: "desc" },
          take: 5,
          select: { score: true },
        },
      },
    }),
    prisma.invitation.findMany({
      where: upcomingWhere,
      orderBy: { event: { eventDate: "asc" } },
      take: 4,
      include: {
        event: {
          include: {
            athlete: { include: { user: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.invitation.count({ where: upcomingWhere }),
    prisma.message.count({ where: { recipientId: userId, isRead: false } }),
    prisma.athlete.count({ where: { user: { createdAt: { gte: since } } } }),
    prisma.media.findMany({
      where: { athlete: { userId: { in: followedIds } }, type: "image" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { athlete: { include: { user: { select: { name: true } } } } },
    }),
  ]);

  return {
    recruiter,
    shortlist,
    matches,
    matchCount,
    unread,
    newProfiles,
    media,
    followed: followedIds.length,
  };
}

export async function RecruiterOverview({ userId }: { userId: string }) {
  const data = await getOverview(userId);

  if (!data) {
    return (
      <section className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-display text-4xl uppercase">
          Profil recruteur incomplet
        </h1>
        <p className="mt-3 text-muted-foreground">
          Indique ton organisation et ta région pour que les athlètes sachent
          qui les contacte.
        </p>
        <Link
          href="/dashboard/recruiter/settings"
          className={cn(buttonVariants(), "mt-6 gap-2")}
        >
          Compléter mon profil <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    );
  }

  const {
    recruiter,
    shortlist,
    matches,
    matchCount,
    unread,
    newProfiles,
    media,
    followed,
  } = data;

  return (
    <div className="space-y-10 pb-24 md:pb-10">
      <header className="flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            {recruiter.organization ?? "Organisation à préciser"}
          </p>
          <h1 className="font-display text-4xl uppercase sm:text-5xl">
            Bonjour, {recruiter.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[recruiter.position, recruiter.region].filter(Boolean).join(" · ")}
          </p>
        </div>
        <form
          action="/dashboard/recruiter/athletes"
          className="flex w-full gap-2 md:w-auto"
        >
          <label htmlFor="recherche" className="sr-only">
            Rechercher un athlète
          </label>
          <input
            id="recherche"
            name="q"
            type="search"
            placeholder="Nom, ville, position..."
            className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-72"
          />
          <button type="submit" className={buttonVariants()}>
            Chercher
          </button>
        </form>
      </header>

      <dl className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:divide-x">
        <Stat label="Athlètes suivis" value={followed} />
        <Stat label="Matchs à venir confirmés" value={matchCount} />
        <Stat label="Messages non lus" value={unread} />
        <Stat
          label="Nouveaux profils"
          value={newProfiles}
          hint="30 derniers jours"
        />
      </dl>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="liste-titre">
          <div className="flex items-baseline justify-between">
            <h2 id="liste-titre" className="font-display text-3xl uppercase">
              Ma liste
            </h2>
            <Link
              href="/dashboard/recruiter/athletes"
              className="text-sm font-medium underline underline-offset-4"
            >
              Tous les athlètes
            </Link>
          </div>

          {shortlist.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed p-6 text-muted-foreground">
              Ta liste est vide. Suis des athlètes depuis la recherche pour
              retrouver ici leurs notes et leur progression.
            </p>
          ) : (
            <>
              <ol className="mt-4 border-t">
                {shortlist.map((athlete) => {
                  const scores = athlete.performances.map((p) => p.score);
                  const avg = scores.length
                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                    : null;
                  const rank = athlete.rankings[0]?.rank;
                  return (
                    <li
                      key={athlete.id}
                      className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b py-3"
                    >
                      <span className="font-display tabular text-2xl text-muted-foreground">
                        {rank ?? "-"}
                        <span className="sr-only"> au classement</span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {athlete.user.name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {positionLabel(
                            athlete.positions[0]?.position.name,
                            athlete.gender,
                          )}
                          {" · "}
                          {sportLabel(athlete.sport?.name)}
                          {athlete.city ? ` · ${athlete.city}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Sparkline scores={[...scores].reverse()} />
                        <span className="tabular w-10 text-right font-semibold">
                          {avg === null ? "-" : number(avg)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-2 text-xs text-muted-foreground">
                Rang dans le sport, forme et moyenne des 5 derniers matchs.
              </p>
            </>
          )}

          {media.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Derniers médias de ta liste
              </h3>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {media.map((item) => (
                  <li key={item.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.title}
                      className="aspect-[4/3] w-full rounded-md object-cover"
                      loading="lazy"
                    />
                    <p className="mt-1.5 line-clamp-1 text-sm font-medium">
                      {item.athlete.user.name}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {item.title}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside aria-labelledby="obs-titre">
          <div className="flex items-baseline justify-between">
            <h2 id="obs-titre" className="font-display text-3xl uppercase">
              Mes observations
            </h2>
            <Link
              href="/dashboard/recruiter/calendar"
              className="text-sm font-medium underline underline-offset-4"
            >
              Calendrier
            </Link>
          </div>
          {matches.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed p-6 text-muted-foreground">
              Aucun match prévu. Les athlètes peuvent t&apos;inviter à leurs
              matchs publics ; ils apparaîtront ici.
            </p>
          ) : (
            <ol className="mt-4 border-t">
              {matches.map(({ id, event }) => (
                <li
                  key={id}
                  className="grid grid-cols-[4.5rem_1fr] gap-3 border-b py-4"
                >
                  <time
                    dateTime={event.eventDate.toISOString()}
                    className="text-sm"
                  >
                    <span className="block font-semibold capitalize">
                      {dateFormat.format(event.eventDate)}
                    </span>
                    <span className="text-muted-foreground">
                      {timeFormat.format(event.eventDate)}
                    </span>
                  </time>
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                    <p className="mt-1 text-sm">
                      Pour voir{" "}
                      <span className="font-semibold">
                        {event.athlete.user.name}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="md:px-6 md:first:pl-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-display tabular mt-1 text-4xl sm:text-5xl">
        {value}
      </dd>
      {hint && <dd className="text-sm text-muted-foreground">{hint}</dd>}
    </div>
  );
}

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2)
    return <span className="text-muted-foreground">-</span>;
  const width = 64;
  const height = 20;
  const min = 40;
  const max = 100;
  const points = scores
    .map((score, i) => {
      const x = (i / (scores.length - 1)) * width;
      const y = height - ((score - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const rising = scores[scores.length - 1] >= scores[0];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="ml-auto block"
      role="img"
      aria-label={
        rising ? "En progression sur 5 matchs" : "En baisse sur 5 matchs"
      }
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        className={rising ? "text-foreground" : "text-muted-foreground"}
      />
    </svg>
  );
}
