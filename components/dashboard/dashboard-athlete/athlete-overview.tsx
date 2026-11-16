import Link from "next/link";
import { ArrowRight, Eye, MessageSquare, Users } from "lucide-react";

import { prisma } from "@/lib/db";
import { positionLabel, sportLabel } from "@/lib/sport-labels";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const LEVEL_LABELS: Record<string, string> = {
  BENJAMIN: "Benjamin",
  CADET: "Cadet",
  JUVENILE: "Juvénile",
  SENIOR: "Senior",
};

const dateFormat = new Intl.DateTimeFormat("fr-CA", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("fr-CA", {
  hour: "2-digit",
  minute: "2-digit",
});
const number = (value: number, digits = 1) =>
  value.toLocaleString("fr-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

async function getOverview(userId: string) {
  const athlete = await prisma.athlete.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, image: true } },
      sport: true,
      category: { include: { level: true } },
      positions: { include: { position: true }, take: 1 },
      performances: {
        orderBy: { date: "desc" },
        take: 10,
        include: { KPI: true },
      },
      rankings: { where: { scope: "GLOBAL" }, take: 1 },
      media: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });
  if (!athlete) return null;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [events, recruiterViews, followers, unread, rankedInSport] =
    await Promise.all([
      prisma.event.findMany({
        where: { athleteId: athlete.id, eventDate: { gte: new Date() } },
        orderBy: { eventDate: "asc" },
        take: 4,
        include: {
          invitations: {
            where: { status: "ACCEPTED", isIncognito: false },
            include: {
              recruiter: { include: { user: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.activity.count({
        where: { userId, type: "RECRUITER_VIEW", createdAt: { gte: since } },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.message.count({ where: { recipientId: userId, isRead: false } }),
      athlete.sportId
        ? prisma.ranking.count({
            where: { sportId: athlete.sportId, scope: "GLOBAL" },
          })
        : Promise.resolve(0),
    ]);

  return { athlete, events, recruiterViews, followers, unread, rankedInSport };
}

export async function AthleteOverview({ userId }: { userId: string }) {
  const data = await getOverview(userId);

  if (!data) {
    return (
      <section className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-display text-4xl uppercase">Ta fiche est vide</h1>
        <p className="mt-3 text-muted-foreground">
          Complète ton profil sportif (sport, position, niveau) pour apparaître
          dans les recherches des recruteurs.
        </p>
        <Link
          href="/dashboard/athlete/settings"
          className={cn(buttonVariants(), "mt-6 gap-2")}
        >
          Compléter mon profil <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    );
  }

  const { athlete, events, recruiterViews, followers, unread, rankedInSport } =
    data;
  const games = [...athlete.performances].reverse();
  const average =
    games.length > 0
      ? games.reduce((sum, game) => sum + game.score, 0) / games.length
      : 0;
  const lastThree = games.slice(-3);
  const previousThree = games.slice(-6, -3);
  const delta =
    lastThree.length && previousThree.length
      ? lastThree.reduce((s, g) => s + g.score, 0) / lastThree.length -
        previousThree.reduce((s, g) => s + g.score, 0) / previousThree.length
      : null;

  // Moyenne de chaque indicateur sur les matchs chargés.
  const kpiTotals = new Map<string, { sum: number; count: number }>();
  for (const game of athlete.performances) {
    for (const kpi of game.KPI) {
      const entry = kpiTotals.get(kpi.name) ?? { sum: 0, count: 0 };
      entry.sum += kpi.value;
      entry.count += 1;
      kpiTotals.set(kpi.name, entry);
    }
  }
  const kpis = Array.from(kpiTotals.entries()).map(([name, { sum, count }]) => ({
    name,
    value: sum / count,
  }));

  const rank = athlete.rankings[0]?.rank;
  const position = athlete.positions[0]?.position.name;
  const levelName = athlete.category?.level.name;
  const categoryName = athlete.category
    ? LEVEL_LABELS[athlete.category.name]
    : null;
  const best = Math.max(...games.map((g) => g.score), 0);

  return (
    <div className="space-y-10 pb-24 md:pb-10">
      {/* En-tête de fiche */}
      <header className="flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          {athlete.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={athlete.user.image}
              alt=""
              className="size-16 shrink-0 rounded-xl object-cover sm:size-20"
            />
          ) : (
            <span className="font-display flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary text-3xl text-primary-foreground sm:size-20">
              {athlete.user.name?.[0] ?? "A"}
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              {positionLabel(position, athlete.gender)} ·{" "}
              {sportLabel(athlete.sport?.name)}
            </p>
            <h1 className="font-display text-4xl uppercase sm:text-5xl">
              {athlete.user.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                levelName && categoryName
                  ? `${levelName} ${categoryName}`
                  : null,
                athlete.city,
                athlete.height ? `${number(athlete.height / 100, 2)} m` : null,
                athlete.age ? `${athlete.age} ans` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <Link
            href="/dashboard/athlete/media"
            className={buttonVariants({ variant: "outline" })}
          >
            Ajouter un média
          </Link>
          <Link
            href="/dashboard/athlete/settings"
            className={buttonVariants()}
          >
            Ajouter un match
          </Link>
        </div>
      </header>

      {/* Ligne de résultats */}
      <dl className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:divide-x">
        <Stat
          label={`Classement ${sportLabel(athlete.sport?.name).toLowerCase()}`}
          value={rank ? (rank === 1 ? "1er" : `${rank}e`) : "-"}
          hint={rank ? `sur ${rankedInSport} athlètes` : "Ajoute des matchs"}
        />
        <Stat
          label="Note moyenne"
          value={games.length ? number(average) : "-"}
          hint={
            delta === null
              ? `${games.length} match${games.length > 1 ? "s" : ""}`
              : `${delta >= 0 ? "+" : ""}${number(delta)} sur les 3 derniers`
          }
        />
        <Stat
          label="Vues de recruteurs"
          value={String(recruiterViews)}
          hint="30 derniers jours"
        />
        <Stat
          label="Recruteurs abonnés"
          value={String(followers)}
          hint={`${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`}
        />
      </dl>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        {/* Performances */}
        <section aria-labelledby="perf-titre" className="space-y-8">
          <div>
            <h2 id="perf-titre" className="font-display text-3xl uppercase">
              Notes de match
            </h2>
            {games.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed p-6 text-muted-foreground">
                Aucun match enregistré pour l&apos;instant. Ajoute ton premier
                match pour obtenir une note et entrer au classement.
              </p>
            ) : (
              <figure className="mt-4">
                <ol
                  className="flex h-44 items-end gap-2 border-b"
                  aria-label="Note de chaque match, du plus ancien au plus récent"
                >
                  {games.map((game) => (
                    <li
                      key={game.id}
                      className="group relative flex h-full flex-1 flex-col justify-end"
                    >
                      <span className="tabular mb-1 text-center text-xs text-muted-foreground">
                        {Math.round(game.score)}
                      </span>
                      <span
                        className={cn(
                          "block rounded-t-sm",
                          game.score === best
                            ? "bg-brand"
                            : "bg-primary/85 dark:bg-foreground/60",
                        )}
                        style={{ height: `${Math.max(4, ((game.score - 40) / 60) * 100)}%` }}
                      />
                      <span className="sr-only">
                        {dateFormat.format(game.date)} :{" "}
                        {Math.round(game.score)} sur 100
                      </span>
                    </li>
                  ))}
                </ol>
                <figcaption className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{dateFormat.format(games[0].date)}</span>
                  <span className="text-center">Note sur 100, axe de 40 à 100</span>
                  <span>{dateFormat.format(games[games.length - 1].date)}</span>
                </figcaption>
              </figure>
            )}
          </div>

          {kpis.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Moyennes par match
              </h3>
              <dl className="mt-3 grid grid-cols-2 border-t sm:grid-cols-3 lg:grid-cols-5">
                {kpis.map((kpi) => (
                  <div key={kpi.name} className="border-b py-3 pr-3">
                    <dt className="text-xs text-muted-foreground">
                      {kpi.name}
                    </dt>
                    <dd className="font-display tabular mt-1 text-2xl">
                      {number(kpi.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Derniers médias
              </h3>
              <Link
                href="/dashboard/athlete/media"
                className="text-sm font-medium underline underline-offset-4"
              >
                Tout voir
              </Link>
            </div>
            {athlete.media.length === 0 ? (
              <p className="mt-3 rounded-md border border-dashed p-6 text-muted-foreground">
                Ajoute une photo ou une vidéo de match. Les profils avec médias
                sont consultés bien plus souvent.
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-3 gap-3">
                {athlete.media.map((media) => (
                  <li key={media.id}>
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        className="aspect-[4/3] w-full rounded-md object-cover"
                        muted
                        preload="metadata"
                        aria-label={media.title}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.url}
                        alt={media.title}
                        className="aspect-[4/3] w-full rounded-md object-cover"
                        loading="lazy"
                      />
                    )}
                    <p className="mt-1.5 line-clamp-1 text-sm">{media.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Calendrier et activité */}
        <aside className="space-y-8">
          <section aria-labelledby="matchs-titre">
            <div className="flex items-baseline justify-between">
              <h2 id="matchs-titre" className="font-display text-3xl uppercase">
                Prochains matchs
              </h2>
              <Link
                href="/dashboard/athlete/calendar"
                className="text-sm font-medium underline underline-offset-4"
              >
                Calendrier
              </Link>
            </div>
            {events.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed p-6 text-muted-foreground">
                Aucun match à venir. Ajoute ton calendrier pour que les
                recruteurs puissent venir te voir jouer.
              </p>
            ) : (
              <ol className="mt-4 border-t">
                {events.map((event) => (
                  <li
                    key={event.id}
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
                      {event.invitations.length > 0 && (
                        <p className="mt-2 inline-flex items-center gap-1.5 rounded-sm bg-brand px-2 py-0.5 text-xs font-semibold text-brand-foreground">
                          <Eye className="size-3.5" aria-hidden />
                          {event.invitations
                            .map((i) => i.recruiter.user.name)
                            .join(", ")}{" "}
                          sera présent
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-md border bg-card p-5">
            <h2 className="font-semibold">Raccourcis</h2>
            <ul className="mt-3 space-y-1">
              <Shortcut
                href="/dashboard/athlete/messages"
                icon={<MessageSquare className="size-4" aria-hidden />}
                label="Messages"
                badge={unread > 0 ? String(unread) : undefined}
              />
              <Shortcut
                href="/dashboard/athlete/athletes"
                icon={<Users className="size-4" aria-hidden />}
                label="Autres athlètes de ton sport"
              />
            </ul>
          </section>
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
  value: string;
  hint: string;
}) {
  return (
    <div className="md:px-6 md:first:pl-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-display tabular mt-1 text-4xl sm:text-5xl">{value}</dd>
      <dd className="text-sm text-muted-foreground">{hint}</dd>
    </div>
  );
}

function Shortcut({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-sm p-2 text-sm transition-colors hover:bg-muted"
      >
        {icon}
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="tabular rounded-sm bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
}
