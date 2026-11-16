"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { positionLabel, sportLabel } from "@/lib/sport-labels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TopAthlete {
  id: number;
  rank: number;
  name: string | null;
  sport: string | null;
  position: string;
  city: string | null;
  totalScore: number;
  averagePerformance: number;
  performancesCount: number;
}

const SPORTS = [
  { value: "all", label: "Tous" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "SOCCER", label: "Soccer" },
  { value: "FOOTBALL", label: "Football" },
  { value: "RUGBY", label: "Rugby" },
];

type Status = "loading" | "ready" | "error";

export default function TopPlayers() {
  const [sport, setSport] = useState("all");
  const [athletes, setAthletes] = useState<TopAthlete[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const load = useCallback(async (selected: string) => {
    setStatus("loading");
    try {
      const params = new URLSearchParams({ limit: "8" });
      if (selected !== "all") params.set("sport", selected);
      const response = await fetch(`/api/rankings/top-athletes?${params}`);
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      setAthletes(data.athletes ?? []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(sport);
  }, [sport, load]);

  return (
    <section className="border-y bg-card" aria-labelledby="classement-titre">
      <div className="container max-w-6xl py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Classement de la saison
            </p>
            <h2
              id="classement-titre"
              className="font-display mt-3 text-4xl uppercase sm:text-5xl"
            >
              Qui performe en ce moment
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Calculé à partir des notes de match saisies sur la plateforme.
              Même grille pour tous les athlètes d&apos;une position.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Filtrer par sport"
            className="flex flex-wrap gap-1 rounded-md border bg-background p-1"
          >
            {SPORTS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={sport === item.value}
                onClick={() => setSport(item.value)}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  sport === item.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left">
            <caption className="sr-only">
              Classement des athlètes par score total
            </caption>
            <thead>
              <tr className="border-b-2 border-foreground text-xs font-semibold uppercase text-muted-foreground">
                <th scope="col" className="w-14 py-3 pr-2">
                  Rang
                </th>
                <th scope="col" className="py-3 pr-4">
                  Athlète
                </th>
                <th scope="col" className="py-3 pr-4">
                  Sport · position
                </th>
                <th scope="col" className="py-3 pr-4">
                  Ville
                </th>
                <th scope="col" className="py-3 pr-4 text-right">
                  Matchs
                </th>
                <th scope="col" className="py-3 pr-4 text-right">
                  Moy.
                </th>
                <th scope="col" className="py-3 text-right">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {status === "loading" &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td colSpan={7} className="py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {status === "ready" &&
                athletes.map((athlete) => (
                  <tr key={athlete.id} className="border-b">
                    <td
                      className={cn(
                        "font-display tabular py-3 pr-2 text-2xl",
                        athlete.rank === 1 && "text-foreground",
                        athlete.rank > 1 && "text-muted-foreground",
                      )}
                    >
                      {athlete.rank}
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {athlete.name ?? "Athlète"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {sportLabel(athlete.sport)} ·{" "}
                      {positionLabel(athlete.position)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {athlete.city ?? "-"}
                    </td>
                    <td className="tabular py-3 pr-4 text-right">
                      {athlete.performancesCount}
                    </td>
                    <td className="tabular py-3 pr-4 text-right">
                      {athlete.averagePerformance.toLocaleString("fr-CA")}
                    </td>
                    <td className="tabular py-3 text-right font-semibold">
                      {Math.round(athlete.totalScore).toLocaleString("fr-CA")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {status === "ready" && athletes.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">
              Aucun athlète classé pour ce sport cette saison. Le classement
              apparaît dès les premières notes de match.
            </p>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-muted-foreground">
                Le classement n&apos;a pas pu être chargé.
              </p>
              <Button variant="outline" size="sm" onClick={() => load(sport)}>
                Réessayer
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Tu veux apparaître ici ?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Crée ton profil
          </Link>{" "}
          et ajoute tes matchs.
        </p>
      </div>
    </section>
  );
}
