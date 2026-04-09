"use client";

import { useEffect, useState } from "react";
import { getAllAthletes } from "@/actions/get-athlete";
import { Athlete } from "@/types";
import { Eye, MapPin, Search, SlidersHorizontal, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSportIcon, getSportColor } from "@/lib/sport-icons";

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
          placeholder="Rechercher un athlete..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-2xl pl-10"
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
                  ? "border-primary bg-primary text-white"
                  : cn(getSportColor(sport), "border-current font-medium")
                : "hover:bg-accent"
            )}
          >
            {sport === "Tous" ? "Tous" : `${getSportIcon(sport)} ${sport}`}
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
          Filtres avances
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
          {filteredAthletes.length} athlete
          {filteredAthletes.length > 1 ? "s" : ""} trouve
          {filteredAthletes.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Grille de cartes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            : "A";

          return (
            <div
              key={athlete.id}
              className="group cursor-pointer overflow-hidden rounded-2xl border transition-all hover:border-primary/30 hover:shadow-md"
              onClick={() => setSelectedAthlete(athlete)}
            >
              {/* En-tete avec gradient sport */}
              <div
                className={cn(
                  "bg-gradient-to-r p-4",
                  sportName
                    ? `${getSportColor(sportName).split(" ")[0]}/5 to-transparent`
                    : "from-primary/5 to-purple-600/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="size-14 border-2 border-primary/20">
                      <AvatarImage src={athlete.user?.image || ""} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {hasMedia && (
                      <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Video className="size-3" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">
                      {athlete.user?.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge
                        className={cn(
                          "text-xs",
                          sportName
                            ? getSportColor(sportName)
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {getSportIcon(sportName)} {sportName || "N/A"}
                      </Badge>
                      {athlete.category?.name && (
                        <Badge variant="outline" className="text-xs">
                          {athlete.category.name}
                        </Badge>
                      )}
                    </div>
                    {athlete.city && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {athlete.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px border-t bg-border">
                <div className="bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-urban text-lg font-bold">
                    {bestScore ? bestScore.toFixed(1) : "-"}
                  </p>
                </div>
                <div className="bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Matchs</p>
                  <p className="font-urban text-lg font-bold">
                    {athlete.performances?.length || 0}
                  </p>
                </div>
              </div>

              {position && (
                <div className="border-t bg-background px-4 py-2">
                  <p className="text-xs text-muted-foreground">
                    Position :{" "}
                    <span className="font-medium text-foreground">
                      {position}
                    </span>
                  </p>
                </div>
              )}

              {/* Action */}
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  className="w-full justify-center gap-2 text-primary"
                  size="sm"
                >
                  <Eye className="size-4" />
                  Voir le profil
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Etat vide */}
      {currentAthletes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            Aucun athlete trouve
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredAthletes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} ({filteredAthletes.length}{" "}
            athlete
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
              Precedent
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
