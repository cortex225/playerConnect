"use client";

import { useEffect, useState } from "react";
import { getAllAthletes } from "@/actions/get-athlete";
import { Athlete } from "@/types";
import { Eye } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AthleteDialog from "@/components/modals/athlete/athlete-profile-dialog";

export default function AthletesTable() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sportFilter, setSportFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [sortField, setSortField] = useState<keyof Athlete["user"] | "performance" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  // Fetch athletes data
  useEffect(() => {
    async function fetchAthletes() {
      try {
        const data = await getAllAthletes();
        setAthletes(data);
        setFilteredAthletes(data);
      } catch (error) {
        console.error("Error fetching athletes:", error);
      }
    }

    fetchAthletes();
  }, []);

  // Filter athletes based on search query and sport filter
  useEffect(() => {
    let filtered = athletes;

    if (searchQuery) {
      filtered = filtered.filter((athlete) =>
        athlete.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sportFilter !== "All") {
      filtered = filtered.filter(
        (athlete) => athlete.sport?.name === sportFilter
      );
    }

    setFilteredAthletes(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [athletes, searchQuery, sportFilter]);

  // Sort athletes
  const sortAthletes = (field: keyof Athlete["user"] | "performance") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    const sorted = [...filteredAthletes].sort((a, b) => {
      if (field === "performance") {
        const aScore = a.performances[0]?.score ?? 0;
        const bScore = b.performances[0]?.score ?? 0;
        return sortDirection === "asc" ? aScore - bScore : bScore - aScore;
      }

      const aValue = a.user[field] || "";
      const bValue = b.user[field] || "";
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue.toString())
        : bValue.localeCompare(aValue.toString());
    });

    setFilteredAthletes(sorted);
  };

  // Get unique sports for filter
  const uniqueSports = ["All", ...Array.from(new Set(athletes.map((a) => a.sport?.name || "Unknown").filter((name) => name !== "Unknown")))];

  // Pagination
  const totalPages = Math.ceil(filteredAthletes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAthletes = filteredAthletes.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Athletes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="sport">Sport</Label>
            <Select
              value={sportFilter}
              onValueChange={(value) => setSportFilter(value)}
            >
              <SelectTrigger id="sport">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Athlete</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentAthletes.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={athlete.user.image || undefined}
                          alt={athlete.user.name || ""}
                        />
                        <AvatarFallback>
                          {athlete.user.name
                            ? athlete.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{athlete.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {athlete.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{athlete.sport?.name || "N/A"}</TableCell>
                  <TableCell>{athlete.category?.name || "N/A"}</TableCell>
                  <TableCell>
                    {athlete.performances[0] ? (
                      <div className="flex items-center space-x-2">
                        <span>{athlete.performances[0].score.toFixed(1)}</span>
                      </div>
                    ) : (
                      "No performance"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedAthlete(athlete)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>

      {/* Athlete Profile Dialog */}
      {selectedAthlete && (
        <AthleteDialog
          athlete={selectedAthlete}
          setSelectedAthlete={setSelectedAthlete}
          selectedAthlete={selectedAthlete}
        />
      )}
    </Card>
  );
}
