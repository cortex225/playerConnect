import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Fiche exemple affichée dans le hero : mêmes données que le compte de démo.
const DEMO_CARD = {
  number: "11",
  name: "Maëlle Tremblay",
  position: "Meneuse",
  team: "Cégep des Deux-Rives, Riverains",
  level: "Collégial D1 · 2007 · 1,70 m",
  stats: [
    { label: "PTS", value: "17,4" },
    { label: "PD", value: "6,2" },
    { label: "INT", value: "2,1" },
    { label: "3PT %", value: "38" },
  ],
  lastGames: [72, 81, 64, 88, 79],
};

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="container grid max-w-6xl gap-12 py-16 md:grid-cols-[1.15fr_1fr] md:items-center md:py-24">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Recrutement sportif scolaire, collégial et universitaire
          </p>
          <h1 className="font-display mt-4 text-balance text-6xl uppercase sm:text-7xl lg:text-[5.5rem]">
            Ton jeu,
            <br />
            sur une seule fiche.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground">
            PlayerConnect regroupe les stats, les vidéos et le calendrier de
            match d&apos;un athlète. Les recruteurs comparent les profils et
            écrivent directement, dans un cadre pensé pour les mineurs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth/register"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6")}
            >
              Créer mon profil athlète
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="#recruteurs"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "px-6",
              )}
            >
              Voir le côté recruteur
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-x-6 -inset-y-8 -z-10 rounded-sm bg-brand md:right-[-30vw]"
          />
          <PlayerCard />
        </div>
      </div>
    </section>
  );
}

function PlayerCard() {
  const best = Math.max(...DEMO_CARD.lastGames);

  return (
    <figure
      className="mx-auto w-full max-w-sm rotate-[-1.5deg] rounded-md border border-foreground/15 bg-card shadow-[0_18px_40px_-20px_hsl(var(--foreground)/0.45)]"
      aria-label={`Fiche joueur exemple : ${DEMO_CARD.name}`}
    >
      <div className="flex items-start justify-between gap-4 border-b p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {DEMO_CARD.position} · Basketball
          </p>
          <p className="font-display mt-1 text-4xl uppercase">
            {DEMO_CARD.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{DEMO_CARD.team}</p>
        </div>
        <span className="font-display tabular rounded-sm bg-primary px-2.5 py-1.5 text-3xl text-primary-foreground">
          {DEMO_CARD.number}
        </span>
      </div>

      <dl className="grid grid-cols-4 divide-x border-b">
        {DEMO_CARD.stats.map((stat) => (
          <div key={stat.label} className="px-3 py-4 text-center">
            <dt className="text-[0.7rem] font-semibold text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="font-display tabular mt-1 text-2xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="p-5">
        <p className="text-xs font-semibold text-muted-foreground">
          Note de performance, 5 derniers matchs
        </p>
        <ol
          className="mt-3 flex h-16 items-end gap-2"
          aria-label="Notes des 5 derniers matchs"
        >
          {DEMO_CARD.lastGames.map((score, index) => (
            <li
              key={index}
              className={cn(
                "flex-1 rounded-t-sm",
                score === best ? "bg-brand" : "bg-primary/80 dark:bg-foreground/60",
              )}
              style={{ height: `${score}%` }}
            >
              <span className="sr-only">{score} sur 100</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-muted-foreground">{DEMO_CARD.level}</p>
      </div>
    </figure>
  );
}
