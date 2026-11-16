"use client";

import { useEffect, useState } from "react";
import { getAllAthletes } from "@/actions/get-athlete";
import { Athlete } from "@/types";
import { MapPin, Search, SlidersHorizontal, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { positionLabel, sportLabel } from "@/lib/sport-labels";

const CATEGORY_LABELS: Record<string, string> = {
  BENJAMIN: "Benjamin",
  CADET: "Cadet",
  JUVENILE: "Juvénile",
  SENIOR: "Senior",
};

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AthleteProfileDialog from "@/components/modals/athlete/athlete-profile-dialog";

export default function AthletesTable() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sportFilter, setSportFilter] = useState<string>("Tous");
  const [categoryFilter, setCategoryFilter] = useState<string>("Toutes");
  const [sortBy, setSortBy] = useState<string>("score");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [minHeight, setMinHeight] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [minScore, setMinScore] = useState("");
  const [hasMediaFilter, setHasMediaFilter] = useState(false);
  const itemsPerPage = 12;
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    async function fetchAthletes() {
      try {
        const data = await getAllAthletes();
        setAthletes(data as unknown as Athlete[]);
        setFilteredAthletes(data as unknown as Athlete[]);
      } catch (error) {
        console.error("Erreur lors du chargement des athletes:", error);
      }
    }

    fetchAthletes();
  }, []);

  useEffect(() => {
    let filtered = [...athletes];

    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sportFilter !== "Tous") {
      filtered = filtered.filter((a) => a.sport?.name === sportFilter);
    }

    if (categoryFilter !== "Toutes") {
      filtered = filtered.filter((a) => a.category?.name === categoryFilter);
    }

    if (cityFilter) {
      filtered = filtered.filter(
        (a) =>
          (a.city || "").toLowerCase().includes(cityFilter.toLowerCase()) ||
          ((a as any).region || "")
            .toLowerCase()
            .includes(cityFilter.toLowerCase())
      );
    }

    if (minHeight) {
      filtered = filtered.filter((a) => (a.height || 0) >= Number(minHeight));
    }

    if (maxHeight) {
      filtered = filtered.filter((a) => (a.height || 999) <= Number(maxHeight));
    }

    if (minScore) {
      const min = Number(minScore);
      filtered = filtered.filter(
        (a) => (a.performances?.[0]?.score || 0) >= min
      );
    }

    if (hasMediaFilter) {
      filtered = filtered.filter((a) => ((a as any).media?.length || 0) > 0);
    }

    switch (sortBy) {
      case "score":
        filtered.sort(
          (a, b) =>
            (b.performances?.[0]?.score || 0) -
            (a.performances?.[0]?.score || 0)
        );
        break;
      case "name":
        filtered.sort((a, b) =>
          (a.user.name || "").localeCompare(b.user.name || "")
        );
        break;
      case "matches":
        filtered.sort(
          (a, b) =>
            (b.performances?.length || 0) - (a.performances?.length || 0)
        );
        break;
      case "recent":
        break;
    }

    setFilteredAthletes(filtered);
    setCurrentPage(1);
  }, [
    athletes,
    searchQuery,
    sportFilter,
    categoryFilter,
    cityFilter,
    minHeight,
    maxHeight,
    minScore,
    hasMediaFilter,
    sortBy,
  ]);

  const uniqueSports = [
    "Tous",
    ...Array.from(
      new Set(
        athletes
          .map((a) => a.sport?.name || "")
          .filter((name) => name !== "")
      )
    ),
  ];

  const uniqueCategories = [
    "Toutes",
    ...Array.from(
      new Set(
        athletes
          .map((a) => a.category?.name || "")
          .filter((name) => name !== "")
      )
    ),
  ];

  const activeFilterCount = [
    categoryFilter !== "Toutes",
    cityFilter,
    minHeight,
    maxHeight,
    minScore,
    hasMediaFilter,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategoryFilter("Toutes");
    setCityFilter("");
    setMinHeight("");
    setMaxHeight("");
    setMinScore("");
    setHasMediaFilter(false);
    setSortBy("score");
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAthletes.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAthletes = filteredAthletes.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Nom ou ville"
          aria-label="Rechercher un athlète"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 rounded-xl pl-10"
        />
      </div>

      {/* Sport pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {uniqueSports.map((sport) => (
          <button
            key={sport}
            onClick={() => setSportFilter(sport)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-all",
              sportFilter === sport
                ? sport === "Tous"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
          >
            {sport === "Tous" ? "Tous" : sportLabel(sport)}
          </button>
        ))}
      </div>

      {/* Filtres avances - toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="size-4" />
          Filtres avancés
          {activeFilterCount > 0 && (
            <Badge className="ml-1 size-5 justify-center rounded-full p-0 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtres avances - panneau */}
      {showAdvancedFilters && (
        <div className="grid gap-3 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Categorie */}
          <div className="space-y-1">
            <Label className="text-xs">Categorie</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Toutes les categories" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "Toutes" ? "Toutes les categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ville / Region */}
          <div className="space-y-1">
            <Label className="text-xs">Ville / Region</Label>
            <Input
              placeholder="Ex: Montreal"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Taille (cm) */}
          <div className="space-y-1">
            <Label className="text-xs">Taille (cm)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minHeight}
                onChange={(e) => setMinHeight(e.target.value)}
                className="rounded-xl"
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Score minimum */}
          <div className="space-y-1">
            <Label className="text-xs">Score minimum</Label>
            <Input
              type="number"
              placeholder="Ex: 70"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Trier par */}
          <div className="space-y-1">
            <Label className="text-xs">Trier par</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Meilleur score</SelectItem>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
                <SelectItem value="matches">Plus de matchs</SelectItem>
                <SelectItem value="recent">Plus recents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Avec medias */}
          <div className="flex items-end">
            <Button
              variant={hasMediaFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setHasMediaFilter(!hasMediaFilter)}
              className="gap-2"
            >
              <Video className="size-4" />
              Avec medias
            </Button>
          </div>

          {/* Reinitialiser */}
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reinitialiser
            </Button>
          </div>
        </div>
      )}

      {/* Nombre de resultats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAthletes.length} athlète
          {filteredAthletes.length > 1 ? "s" : ""}, classés par note
        </p>
      </div>

      {/* Liste d'athlètes */}
      <ul className="divide-y rounded-xl border bg-card">
        {currentAthletes.map((athlete) => {
          const bestScore = athlete.performances?.[0]?.score;
          const position = athlete.performances?.[0]?.position?.name;
          const hasMedia = ((athlete as any).media?.length || 0) > 0;
          const sportName = athlete.sport?.name;
          const initials = athlete.user.name
            ? athlete.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
            : "A";

          return (
            <li key={athlete.id}>
              <button
                type="button"
                onClick={() => setSelectedAthlete(athlete)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none"
              >
                <div className="relative shrink-0">
                  <Avatar className="size-12">
                    <AvatarImage src={athlete.user?.image || ""} alt="" />
                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {hasMedia && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground ring-2 ring-card">
                      <Video className="size-3" aria-hidden />
                      <span className="sr-only">A des médias</span>
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{athlete.user?.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {positionLabel(position, (athlete as any).gender)} ·{" "}
                    {sportLabel(sportName)}
                  </p>
                  {athlete.city && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" aria-hidden />
                      {athlete.city}
                      {athlete.category?.name ? ` · ${CATEGORY_LABELS[athlete.category.name] ?? athlete.category.name}` : ""}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display tabular text-2xl leading-none">
                    {bestScore
                      ? bestScore.toLocaleString("fr-CA", { maximumFractionDigits: 0 })
                      : "-"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {athlete.performances?.length || 0} match
                    {(athlete.performances?.length || 0) > 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Etat vide */}
      {currentAthletes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            Aucun athlète ne correspond à ces filtres.
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredAthletes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} ({filteredAthletes.length}{" "}
            athlète
            {filteredAthletes.length !== 1 ? "s" : ""})
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Dialogue profil athlete */}
      {selectedAthlete && (
        <AthleteProfileDialog
          athlete={selectedAthlete}
          selectedAthlete={selectedAthlete}
          onClose={() => setSelectedAthlete(null)}
        />
      )}
    </div>
  );
}
