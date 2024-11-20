"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllAthletes } from "@/actions/get-athlete";
import { Eye, Star } from "lucide-react";

type Athlete = {
    id: string;
    age: number;
    rating: number;
    sport: {
        id: string;
        name: string; // Assurez-vous que "SportType" est défini si nécessaire
    } | null;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        emailVerified: Date | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripeCurrentPeriodEnd: Date | null;
    };
};

export default function AthletesTable() {
    const [athletes, setAthletes] = useState([]); // Liste complète des athlètes
    const [filteredAthletes, setFilteredAthletes] = useState([]); // Liste filtrée des athlètes
    const [sportFilter, setSportFilter] = useState("All"); // Filtre par sport
    const [selectedAthlete, setSelectedAthlete] = useState(null); // Athlète sélectionné pour le dialog

    // Charger les athlètes depuis le serveur
    useEffect(() => {
        async function fetchAthletes() {
            try {
                const data = await getAllAthletes();
                console.log(data);
                // @ts-ignore
                setAthletes(data);
                // @ts-ignore
                setFilteredAthletes(data);
            } catch (error) {
                console.error("Erreur lors du chargement des athlètes:", error);
            }
        }

        fetchAthletes();
    }, []);

    // Filtrer les athlètes en fonction du sport sélectionné
    useEffect(() => {
        if (sportFilter === "All") {
            setFilteredAthletes(athletes);
        } else {
            setFilteredAthletes(athletes.filter((athlete) => athlete.sport?.name === sportFilter));
        }
    }, [sportFilter, athletes]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    Athletes List
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="sport-filter" className="sr-only">
                            Filter by Sport
                        </Label>
                        <Select value={sportFilter} onValueChange={setSportFilter}>
                            <SelectTrigger id="sport-filter" className="w-[180px]">
                                <SelectValue placeholder="Filter by Sport" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Sports</SelectItem>
                                <SelectItem value="Basketball">Basketball</SelectItem>
                                <SelectItem value="Soccer">Soccer</SelectItem>
                                <SelectItem value="Tennis">Tennis</SelectItem>
                                <SelectItem value="Swimming">Swimming</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Sport</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAthletes.length > 0 ? (
                            filteredAthletes.map((athlete) => (
                                <TableRow key={athlete.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={athlete.user?.image || "/placeholder.svg"} alt={athlete.user?.name || "Athlete"} />
                                                <AvatarFallback>
                                                    {athlete.user?.name.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{athlete.user?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{athlete.sport?.name}</TableCell>
                                    <TableCell>{athlete.age}</TableCell>
                                    <TableCell>{athlete.rating}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedAthlete(athlete)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Profile
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[625px]">
                                                <DialogHeader>
                                                    <DialogTitle>Athlete Profile</DialogTitle>
                                                    <DialogDescription>
                                                        Detailed information about {selectedAthlete?.user?.name}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                {selectedAthlete && (
                                                    <div className="grid gap-4 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-20 w-20">
                                                                <AvatarImage src={selectedAthlete.user?.image || "/placeholder.svg"} alt={selectedAthlete.user?.name || "Athlete"} />
                                                                <AvatarFallback>
                                                                    {selectedAthlete.user?.name.split(" ").map((n) => n[0]).join("")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h2 className="text-2xl font-bold">{selectedAthlete.user?.name}</h2>
                                                                <p className="text-gray-500">
                                                                    {selectedAthlete.sport?.name}, Age: {selectedAthlete.age}
                                                                </p>
                                                                <div className="flex items-center mt-1">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            className={`h-4 w-4 ${star <= selectedAthlete.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                                                        />
                                                                    ))}
                                                                    <span className="ml-2 text-sm text-gray-600">({selectedAthlete.rating})</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
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
            </CardContent>
        </Card>
    );
}