"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllAthletes } from "@/actions/get-athlete";
import { Eye, Star } from "lucide-react";
import AthleteDialog from "@/components/modals/athlete/athlete-profile-dialog";

import { Athlete } from "@/types";



export default function AthletesTable() {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sportFilter, setSportFilter] = useState<string>("All");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const [sortField, setSortField] = useState<keyof Athlete | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

    // Fetch athletes data
    useEffect(() => {
        async function fetchAthletes() {
            try {
                const data: Athlete[] = await getAllAthletes();
                setAthletes(data);
                setFilteredAthletes(data);

            } catch (error) {
                console.error("Error fetching athletes:", error);
            }
        }

        fetchAthletes();
    }, []);

    // Apply filters, search, and sorting
    useEffect(() => {
        let filtered = [...athletes];

        // Filter by sport
        if (sportFilter !== "All") {
            filtered = filtered.filter((athlete) => athlete.sport?.name === sportFilter);
        }

        // Search by name
        if (searchQuery) {
            filtered = filtered.filter((athlete) =>
                athlete.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort by the selected field
        if (sortField) {
            filtered.sort((a, b) => {
                const aValue = getFieldValue(a, sortField);
                const bValue = getFieldValue(b, sortField);

                if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
                if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
                return 0;
            });
        }

        setFilteredAthletes(filtered);
    }, [athletes, searchQuery, sportFilter, sortField, sortDirection]);

    // Helper to get the field value for sorting
    const getFieldValue = (athlete: Athlete, field: keyof Athlete) => {
        if (field === "rating") {
            return athlete.performances?.[0]?.score || 0;
        }
        if (field === "sport") {
            return athlete.sport?.name || "";
        }
        if (field === "performances") {
            return athlete.performances?.length || 0;
        }
        if (field === "user") {
            return athlete.user?.name || "";
        }
        return athlete[field] || "";
    };

    // Pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAthletes = filteredAthletes.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredAthletes.length / itemsPerPage);

    // Toggle sort direction
    const toggleSort = (field: keyof Athlete) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Athletes List
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="search" className="sr-only">
                            Search
                        </Label>
                        <Input
                            id="search"
                            type="text"
                            placeholder="Search by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Select value={sportFilter} onValueChange={setSportFilter}>
                            <SelectTrigger id="sport-filter" className="w-[180px]">
                                <SelectValue placeholder="Filter by Sport" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Sports</SelectItem>
                                {Array.from(new Set(athletes.map((athlete) => athlete.sport?.name)))
                                    .filter(Boolean)
                                    .map((sport) => (
                                        <SelectItem key={sport} value={sport!}>
                                            {sport}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead onClick={() => toggleSort("user")}>Name</TableHead>
                            <TableHead onClick={() => toggleSort("sport")}>Sport</TableHead>
                            <TableHead onClick={() => toggleSort("age")}>Age</TableHead>
                            <TableHead onClick={() => toggleSort("rating")}>Score</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentAthletes.length > 0 ? (
                            currentAthletes.map((athlete) => (
                                <TableRow key={athlete.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={athlete.user?.image || "/placeholder.svg"} alt={athlete.user?.name || "Athlete"} />
                                                <AvatarFallback>
                                                    {athlete.user?.name
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("") || "N/A"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{athlete.user?.name || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{athlete.sport?.name || "N/A"}</TableCell>
                                    <TableCell>{athlete.age || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${
                                                        star <= (athlete.performances?.[0]?.score || 0) / 20
                                                            ? "text-yellow-400"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <AthleteDialog
                                            athlete={athlete}
                                            setSelectedAthlete={setSelectedAthlete}
                                            selectedAthlete={selectedAthlete}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500">
                                    No athletes found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="mt-4 flex items-center justify-between">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Previous
                    </Button>
                    <span>
            Page {currentPage} of {totalPages}
          </span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}